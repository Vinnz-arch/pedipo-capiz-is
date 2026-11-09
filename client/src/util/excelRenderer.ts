import ExcelJS from "exceljs";

export interface SpreadsheetSheetItem {
  name: string;
  html: string;
}

export interface ParsedSpreadsheetWorkbook {
  sheets: SpreadsheetSheetItem[];
  html: string;
  headers: string[];
  rows: string[][];
}

const THEME_COLORS: Record<number, string> = {
  0: "#FFFFFF",
  1: "#000000",
  2: "#E7E6E6",
  3: "#44546A",
  4: "#4472C4",
  5: "#ED7D31",
  6: "#A5A5A5",
  7: "#FFC000",
  8: "#5B9BD5",
  9: "#70AD47",
};

function argbToHex(argb: any, theme?: number): string | null {
  if (typeof argb === "string") {
    if (argb.length === 8) return "#" + argb.substring(2);
    if (argb.length === 6) return "#" + argb;
  }
  if (theme !== undefined && THEME_COLORS[theme]) {
    return THEME_COLORS[theme];
  }
  return null;
}

function parseCellRange(rangeStr: string) {
  const parts = rangeStr.split(":");
  const start = parts[0];
  const end = parts[1] || start;

  const startMatch = start.match(/([A-Z]+)(\d+)/);
  const endMatch = end.match(/([A-Z]+)(\d+)/);

  if (!startMatch || !endMatch) {
    return { startCol: 1, startRow: 1, endCol: 1, endRow: 1 };
  }

  const colToNum = (col: string) => {
    let num = 0;
    for (let i = 0; i < col.length; i++) {
      num = num * 26 + (col.charCodeAt(i) - 64);
    }
    return num;
  };

  return {
    startCol: colToNum(startMatch[1]),
    startRow: parseInt(startMatch[2], 10),
    endCol: colToNum(endMatch[1]),
    endRow: parseInt(endMatch[2], 10),
  };
}

const numToCol = (num: number): string => {
  let s = "";
  while (num > 0) {
    const m = (num - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    num = Math.floor((num - m) / 26);
  }
  return s;
};

/**
 * Lightweight formula evaluator for common Excel formulas:
 * - SUM(C6:C10), AVERAGE(C6:C10), MIN, MAX, COUNT
 * - Basic arithmetic: C6*D6, C6+D6, (A1+B1)*C1, etc.
 */
function evaluateFormula(formula: string, getCellValue: (addr: string) => any): number | null {
  if (!formula || typeof formula !== "string") return null;
  let expr = formula.trim();
  if (expr.startsWith("=")) expr = expr.substring(1).trim();

  // SUM(A1:B10)
  const sumMatch = expr.match(/^SUM\(([A-Z]+\d+):([A-Z]+\d+)\)$/i);
  if (sumMatch) {
    const { startCol, startRow, endCol, endRow } = parseCellRange(`${sumMatch[1]}:${sumMatch[2]}`);
    let total = 0;
    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        const val = Number(getCellValue(`${numToCol(c)}${r}`)) || 0;
        total += val;
      }
    }
    return total;
  }

  // AVERAGE(A1:B10)
  const avgMatch = expr.match(/^AVERAGE\(([A-Z]+\d+):([A-Z]+\d+)\)$/i);
  if (avgMatch) {
    const { startCol, startRow, endCol, endRow } = parseCellRange(`${avgMatch[1]}:${avgMatch[2]}`);
    let total = 0;
    let count = 0;
    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        const val = Number(getCellValue(`${numToCol(c)}${r}`)) || 0;
        total += val;
        count++;
      }
    }
    return count > 0 ? total / count : 0;
  }

  // Arithmetic formulas like C6*D6, C6+D6, C6-D6
  const replaced = expr.replace(/\b([A-Z]+)(\d+)\b/g, (_, col, row) => {
    const val = getCellValue(`${col}${row}`);
    const num = Number(val);
    return isNaN(num) ? "0" : String(num);
  });

  try {
    if (/^[0-9+\-*/().\s]+$/.test(replaced)) {
      const res = Function(`"use strict"; return (${replaced})`)();
      if (typeof res === "number" && !isNaN(res) && isFinite(res)) {
        return res;
      }
    }
  } catch (e) {
    // Return null if evaluation fails
  }

  return null;
}

/**
 * Converts an ExcelJS worksheet into an HTML table with exact styles,
 * background colors, alignments, borders, and calculated formula results.
 */
function convertWorksheetToHtml(ws: ExcelJS.Worksheet): string {
  const merges = ws.model.merges || [];
  const mergeMap = new Map<string, { isMaster?: boolean; isSlave?: boolean; rowspan?: number; colspan?: number }>();

  merges.forEach((rangeStr) => {
    const { startCol, startRow, endCol, endRow } = parseCellRange(rangeStr);
    const rowspan = endRow - startRow + 1;
    const colspan = endCol - startCol + 1;

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const key = `${r},${c}`;
        if (r === startRow && c === startCol) {
          mergeMap.set(key, { isMaster: true, rowspan, colspan });
        } else {
          mergeMap.set(key, { isSlave: true });
        }
      }
    }
  });

  // Accurate bounds that account for empty spacer rows (so summary rows are never cut off)
  const maxRow = Math.max(
    ws.rowCount || 0,
    ws.lastRow ? ws.lastRow.number : 0,
    ws.actualRowCount || 0,
    1
  );
  const maxCol = Math.max(
    ws.columnCount || 0,
    ws.lastColumn ? ws.lastColumn.number : 0,
    ws.actualColumnCount || 0,
    1
  );

  // Pass 1: Build cell values dictionary for formula resolution
  const cellValues = new Map<string, any>();
  for (let r = 1; r <= maxRow; r++) {
    const row = ws.getRow(r);
    for (let c = 1; c <= maxCol; c++) {
      const cell = row.getCell(c);
      const v = cell.value;
      if (v !== null && v !== undefined) {
        if (typeof v === "object") {
          if ((v as any).result !== undefined && (v as any).result !== null) {
            cellValues.set(cell.address, (v as any).result);
          }
        } else {
          cellValues.set(cell.address, v);
        }
      }
    }
  }

  const getVal = (addr: string) => cellValues.get(addr.toUpperCase()) ?? 0;

  let html = `<table class="excel-rendered-table" style="border-collapse: collapse; width: 100%; font-family: Calibri, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11pt; color: #1e293b; background-color: #ffffff;">\n`;

  // Colgroup with proportional column widths
  html += `  <colgroup>\n`;
  for (let c = 1; c <= maxCol; c++) {
    const col = ws.getColumn(c);
    const width = col.width ? Math.round(col.width * 8.5) : 95;
    html += `    <col style="min-width: ${width}px; width: ${width}px;" />\n`;
  }
  html += `  </colgroup>\n`;

  // Pass 2: Render rows and evaluate formulas
  for (let r = 1; r <= maxRow; r++) {
    const row = ws.getRow(r);
    const rowHeight = row.height ? `height: ${Math.round(row.height * 1.35)}px;` : "";
    html += `  <tr style="${rowHeight}">\n`;

    for (let c = 1; c <= maxCol; c++) {
      const mergeInfo = mergeMap.get(`${r},${c}`);
      if (mergeInfo && mergeInfo.isSlave) {
        continue; // Skip slave merged cells
      }

      const cell = row.getCell(c);
      const styles: string[] = [];
      const attrs: string[] = [];

      if (mergeInfo && mergeInfo.isMaster) {
        if (mergeInfo.rowspan && mergeInfo.rowspan > 1) attrs.push(`rowspan="${mergeInfo.rowspan}"`);
        if (mergeInfo.colspan && mergeInfo.colspan > 1) attrs.push(`colspan="${mergeInfo.colspan}"`);
      }

      // Background color / Fill
      if (cell.fill && cell.fill.type === "pattern" && cell.fill.fgColor) {
        const bg = argbToHex(cell.fill.fgColor.argb, (cell.fill.fgColor as any).theme);
        if (bg) {
          styles.push(`background-color: ${bg} !important`);
        }
      }

      // Font formatting
      if (cell.font) {
        if (cell.font.bold) styles.push(`font-weight: 700`);
        if (cell.font.italic) styles.push(`font-style: italic`);
        if (cell.font.size) styles.push(`font-size: ${Math.max(10, Math.round(cell.font.size * 1.1))}px`);
        const fontColor = argbToHex(cell.font.color?.argb, (cell.font.color as any)?.theme);
        if (fontColor) {
          styles.push(`color: ${fontColor} !important`);
        }
      }

      // Alignment
      if (cell.alignment) {
        if (cell.alignment.horizontal) {
          styles.push(`text-align: ${cell.alignment.horizontal}`);
        }
        if (cell.alignment.vertical) {
          styles.push(`vertical-align: ${cell.alignment.vertical === "middle" ? "middle" : cell.alignment.vertical}`);
        }
        if (cell.alignment.wrapText) {
          styles.push(`white-space: normal`);
        }
      }

      // Value extraction & formula evaluation (prevent [object Object])
      const val = cell.value;
      let displayVal = "";

      if (val !== null && val !== undefined) {
        if (typeof val === "object") {
          if ((val as any).result !== undefined && (val as any).result !== null) {
            displayVal = String((val as any).result);
          } else if ((val as any).formula || (val as any).sharedFormula) {
            // Evaluate formula if result was not cached in the file
            const formulaStr = (val as any).formula || "";
            const computed = evaluateFormula(formulaStr, getVal);
            if (computed !== null) {
              displayVal = String(computed);
              cellValues.set(cell.address, computed); // Cache computed value for dependent formulas (like total revenue)
            } else {
              displayVal = "";
            }
          } else if ((val as any).richText && Array.isArray((val as any).richText)) {
            displayVal = (val as any).richText.map((t: any) => t.text).join("");
          } else if (val instanceof Date) {
            displayVal = val.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
          } else {
            displayVal = "";
          }
        } else {
          displayVal = String(val);
        }
      }

      // Number & Currency formatting
      const numFmt = cell.numFmt || "";
      if (displayVal !== "" && !isNaN(Number(displayVal))) {
        const num = Number(displayVal);
        if (numFmt.includes("₱")) {
          displayVal = "₱" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          if (!cell.alignment?.horizontal) styles.push("text-align: right");
        } else if (numFmt.includes("$")) {
          displayVal = "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          if (!cell.alignment?.horizontal) styles.push("text-align: right");
        } else if (numFmt.includes("#,##0") || numFmt.includes("0.00")) {
          displayVal = num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          if (!cell.alignment?.horizontal) styles.push("text-align: right");
        }
      }

      // Borders
      styles.push("border: 1px solid #cbd5e1");
      styles.push("padding: 5px 8px");

      const styleStr = styles.length > 0 ? `style="${styles.join("; ")}"` : "";
      const attrStr = attrs.length > 0 ? " " + attrs.join(" ") : "";

      html += `    <td ${styleStr}${attrStr}>${displayVal}</td>\n`;
    }

    html += `  </tr>\n`;
  }

  html += `</table>`;
  return html;
}

/**
 * Extracts tabular headers and rows directly from an ExcelJS worksheet
 * without requiring any third-party JSON conversion library.
 */
function extractTabularData(ws: ExcelJS.Worksheet): { headers: string[]; rows: string[][] } {
  const maxRow = Math.max(ws.rowCount || 0, ws.lastRow ? ws.lastRow.number : 0, 1);
  const maxCol = Math.max(ws.columnCount || 0, ws.lastColumn ? ws.lastColumn.number : 0, 1);

  // Identify merged slave cells to prevent duplicating the master cell's value across the row
  const merges = ws.model.merges || [];
  const slaveCells = new Set<string>();
  merges.forEach((rangeStr) => {
    const { startCol, startRow, endCol, endRow } = parseCellRange(rangeStr);
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (r !== startRow || c !== startCol) {
          slaveCells.add(`${r},${c}`);
        }
      }
    }
  });

  const rawGrid: string[][] = [];
  for (let r = 1; r <= maxRow; r++) {
    const row = ws.getRow(r);
    const rowCells: string[] = [];
    for (let c = 1; c <= maxCol; c++) {
      if (slaveCells.has(`${r},${c}`)) {
        rowCells.push("");
        continue;
      }

      const cell = row.getCell(c);
      const val = cell.value;
      let text = "";
      if (val !== null && val !== undefined) {
        if (typeof val === "object") {
          if ((val as any).result !== undefined && (val as any).result !== null) {
            text = String((val as any).result);
          } else if ((val as any).richText && Array.isArray((val as any).richText)) {
            text = (val as any).richText.map((t: any) => t.text).join("");
          } else if (val instanceof Date) {
            text = val.toLocaleDateString();
          } else {
            text = "";
          }
        } else {
          text = String(val).trim();
        }
      }
      rowCells.push(text);
    }
    rawGrid.push(rowCells);
  }

  // Find the most appropriate header row (row with the maximum distinct non-empty cells in the first 15 rows)
  let bestHeaderIdx = -1;
  let maxCount = 0;
  for (let r = 0; r < Math.min(rawGrid.length, 15); r++) {
    const count = rawGrid[r].filter((c) => c !== "").length;
    if (count > maxCount) {
      maxCount = count;
      bestHeaderIdx = r;
    }
  }

  if (bestHeaderIdx === -1 || maxCount === 0) {
    return { headers: [], rows: [] };
  }

  const headers = rawGrid[bestHeaderIdx].map((h, i) => h || `Col ${i + 1}`);
  const rows = rawGrid
    .slice(bestHeaderIdx + 1)
    .filter((r) => r.some((c) => c !== ""))
    .map((r) => headers.map((_, colIdx) => (r[colIdx] !== undefined ? r[colIdx] : "")));

  return { headers, rows };
}

/**
 * Parses raw CSV text into a structured grid of rows and columns.
 */
function parseCsvToGrid(csvText: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      row.push(current.trim());
      if (row.some((c) => c !== "")) lines.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current || row.length > 0) {
    row.push(current.trim());
    if (row.some((c) => c !== "")) lines.push(row);
  }

  return lines;
}

/**
 * Main parser: processes an uploaded Excel (.xlsx) or CSV file 100% via ExcelJS.
 */
export async function parseExcelToHighFidelity(file: File): Promise<ParsedSpreadsheetWorkbook> {
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "";

  if (fileExt === "xls") {
    throw new Error(
      "Legacy .xls (Excel 97-2003) format detected. Please save or re-export your spreadsheet as .xlsx (Excel Workbook) or .csv and upload again."
    );
  }

  // Handle CSV files natively
  if (fileExt === "csv") {
    const csvText = await file.text();
    const grid = parseCsvToGrid(csvText);

    if (grid.length === 0) {
      return { sheets: [], html: "", headers: [], rows: [] };
    }

    const headers = grid[0].map((h, i) => h || `Col ${i + 1}`);
    const rows = grid.slice(1);

    // Build standard HTML table for CSV preview
    let html = `<table class="excel-rendered-table" style="border-collapse: collapse; width: 100%; font-family: Calibri, sans-serif; font-size: 11pt; color: #1e293b;">\n`;
    html += `  <thead>\n    <tr style="background-color: #f1f5f9; font-weight: 700;">\n`;
    headers.forEach((h) => {
      html += `      <th style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left;">${h}</th>\n`;
    });
    html += `    </tr>\n  </thead>\n  <tbody>\n`;
    rows.forEach((r) => {
      html += `    <tr>\n`;
      headers.forEach((_, colIdx) => {
        const val = r[colIdx] || "";
        const isNum = val !== "" && !isNaN(Number(val));
        html += `      <td style="border: 1px solid #cbd5e1; padding: 5px 10px; ${isNum ? "text-align: right;" : ""}">${val}</td>\n`;
      });
      html += `    </tr>\n`;
    });
    html += `  </tbody>\n</table>`;

    return {
      sheets: [{ name: "Data", html }],
      html,
      headers,
      rows,
    };
  }

  // Handle modern .xlsx workbooks using ExcelJS
  const buffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  if (!wb.worksheets || wb.worksheets.length === 0) {
    return { sheets: [], html: "", headers: [], rows: [] };
  }

  const sheets: SpreadsheetSheetItem[] = [];
  wb.worksheets.forEach((ws) => {
    const html = convertWorksheetToHtml(ws);
    sheets.push({
      name: ws.name,
      html,
    });
  });

  const firstWs = wb.worksheets[0];
  const { headers, rows } = extractTabularData(firstWs);

  return {
    sheets,
    html: sheets[0]?.html || "",
    headers,
    rows,
  };
}
