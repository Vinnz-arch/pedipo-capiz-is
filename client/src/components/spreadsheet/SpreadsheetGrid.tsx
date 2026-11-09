import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Upload,
  Download,
  Save,
  Search,
  FileSpreadsheet,
  Columns3,
  Loader2,
  Calendar,
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  Table as TableIcon
} from "lucide-react";
import ExcelJS from "exceljs";
import { notify } from "@/util/notify";
import { ApiHandler } from "@/api/ApiHandler";
import AxiosInstance from "@/api/AxiosIntance";
import { OpportunityService } from "@/services/OpportunityService";
import { parseExcelToHighFidelity } from "@/util/excelRenderer";

export interface SpreadsheetSheet {
  name: string;
  html: string;
}

export interface SpreadsheetData {
  headers: string[];
  rows: string[][];
  filename?: string;
  file_path?: string;
  file_size?: number;
  updated_at?: string;
  sheets?: SpreadsheetSheet[];
  html?: string;
}

interface SpreadsheetGridProps {
  opportunityId: number | string;
  opportunityName: string;
  categoryName?: string;
  locationName?: string;
  isAdmin?: boolean;
  uploadOnly?: boolean;
  sheetTitle?: string;
  isParentOpportunity?: boolean;
  initialYear?: string;
  onYearChange?: (year: string) => void;
  onClose?: () => void;
  onSaved?: () => void;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  opportunityId,
  opportunityName,
  categoryName = "Investment Project",
  locationName = "Capiz",
  isAdmin = false,
  uploadOnly = false,
  sheetTitle,
  isParentOpportunity = false,
  initialYear,
  onYearChange,
  onClose,
  onSaved,
}) => {
  const [dataYear, setDataYear] = useState<string>(initialYear || String(new Date().getFullYear()));
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [sheetsData, setSheetsData] = useState<SpreadsheetSheet[]>([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [displayMode, setDisplayMode] = useState<"document" | "grid">("document");
  const [zoom, setZoom] = useState<number>(100);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [uploadedAt, setUploadedAt] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEditable = isAdmin && !uploadOnly;

  // Load existing spreadsheet data
  useEffect(() => {
    const fetchSpreadsheet = async () => {
      setIsLoading(true);
      const endpoint = isParentOpportunity
        ? `/v1/parent-opportunities/${opportunityId}/operators-and-production`
        : `/v1/opportunities/${opportunityId}/spreadsheet`;

      try {
        const res = await ApiHandler.get<{
          spreadsheet_data?: SpreadsheetData;
          data_year?: string;
          opportunity?: any;
          parent_opportunity?: any;
        }>(endpoint);

        if (res.data_year) {
          setDataYear(res.data_year);
          if (onYearChange) onYearChange(res.data_year);
        }

        const data = res.spreadsheet_data;
        if (data) {
          if (data.sheets && Array.isArray(data.sheets) && data.sheets.length > 0) {
            setSheetsData(data.sheets);
            setDisplayMode("document");
          } else if (data.html) {
            setSheetsData([{ name: "Sheet1", html: data.html }]);
            setDisplayMode("document");
          } else {
            setSheetsData([]);
            setDisplayMode("grid");
          }

          if (data.headers && data.headers.length > 0) {
            setHeaders(data.headers);
            setRows(data.rows || []);
          }
          if (data.filename) setUploadedFilename(data.filename);
          if (data.file_path) setUploadedFilePath(data.file_path);
          if (data.updated_at) setUploadedAt(data.updated_at);
        } else if (isAdmin && !uploadOnly) {
          if (isParentOpportunity) {
            setHeaders([
              "Municipality / Location",
              "Number of Operators",
              "Annual Production (MT)",
              "Production Value (PHP)",
              "Area / Facility Type",
              "Remarks / Source"
            ]);
            setRows([
              ["", "", "", "", "", ""],
              ["", "", "", "", "", ""],
              ["", "", "", "", "", ""],
            ]);
          } else {
            // Admin starts with a clean, blank slate ready for entry
            setHeaders(["Item Description", "Specifications", "Unit / Metric", "Estimated Cost (PHP)"]);
            setRows([
              ["", "", "", ""],
              ["", "", "", ""],
              ["", "", "", ""],
            ]);
          }
          setSheetsData([]);
          setDisplayMode("grid");
        } else {
          setHeaders([]);
          setRows([]);
          setSheetsData([]);
          setDisplayMode("document");
        }
      } catch (err) {
        console.error("Failed to load spreadsheet data:", err);
        if (isAdmin) {
          setHeaders(["Column 1", "Column 2", "Column 3"]);
          setRows([["", "", ""]]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpreadsheet();
  }, [opportunityId, isAdmin, isParentOpportunity]);

  // Cell change handler
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    if (!isAdmin) return;
    setRows((prev) => {
      const newRows = prev.map((r) => [...r]);
      if (!newRows[rowIndex]) {
        newRows[rowIndex] = new Array(headers.length).fill("");
      }
      newRows[rowIndex][colIndex] = value;
      return newRows;
    });
  };

  // Header change handler
  const handleHeaderChange = (colIndex: number, newHeader: string) => {
    if (!isAdmin) return;
    setHeaders((prev) => {
      const next = [...prev];
      next[colIndex] = newHeader;
      return next;
    });
  };

  // Add Row
  const handleAddRow = () => {
    if (!isAdmin) return;
    setRows((prev) => [...prev, new Array(headers.length).fill("")]);
  };

  // Delete Row
  const handleDeleteRow = (rowIndex: number) => {
    if (!isAdmin) return;
    setRows((prev) => prev.filter((_, idx) => idx !== rowIndex));
  };

  // Add Column
  const handleAddColumn = () => {
    if (!isAdmin) return;
    const newColName = `Column ${headers.length + 1}`;
    setHeaders((prev) => [...prev, newColName]);
    setRows((prev) => prev.map((r) => [...r, ""]));
  };

  // Delete Column
  const handleDeleteColumn = (colIndex: number) => {
    if (!isAdmin || headers.length <= 1) return;
    setHeaders((prev) => prev.filter((_, idx) => idx !== colIndex));
    setRows((prev) => prev.map((r) => r.filter((_, idx) => idx !== colIndex)));
  };

  // Clear Sheet (reset to empty rows)
  const handleClearSheet = () => {
    if (!isEditable) return;
    if (confirm("Are you sure you want to clear all data rows in this spreadsheet? (Headers will remain intact)")) {
      setRows([]);
    }
  };

  // Remove / Detach File completely from database
  const handleRemoveFile = async () => {
    if (!isAdmin) return;
    const confirmMsg = uploadedFilename
      ? `Are you sure you want to remove and detach "${uploadedFilename}"?\n\nThis will completely clear the spreadsheet data and reset this project to "No Sheet".`
      : "Are you sure you want to remove this spreadsheet completely?";

    if (!confirm(confirmMsg)) return;

    try {
      const endpoint = isParentOpportunity
        ? `/v1/parent-opportunities/${opportunityId}/operators-and-production/spreadsheet`
        : `/v1/opportunities/${opportunityId}/spreadsheet`;

      await ApiHandler.delete(endpoint);

      setHeaders([]);
      setRows([]);
      setSheetsData([]);
      setActiveSheetIndex(0);
      setUploadedFilename(null);
      setUploadedFilePath(null);
      setUploadedAt(null);

      notify.success("Spreadsheet Removed", "The spreadsheet was detached and removed successfully.");
      if (onSaved) onSaved();
    } catch (err: any) {
      console.error("Failed to delete spreadsheet:", err);
      notify.error("Delete Failed", err.message || "Could not remove spreadsheet.");
    }
  };

  // Upload Spreadsheet file (.xlsx, .csv) and save physical file + high-fidelity preview
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["csv", "xlsx", "xls"].includes(fileExt)) {
      notify.error("Invalid File Type", "Please upload a valid spreadsheet file (.xlsx, .xls, or .csv).");
      return;
    }

    setIsUploading(true);
    try {
      const parsed = await parseExcelToHighFidelity(file);

      if (!parsed.sheets || parsed.sheets.length === 0) {
        notify.error("Empty Workbook", "The uploaded spreadsheet file contains no readable sheets.");
        return;
      }

      let savedFilePath: string | null = null;

      if (isParentOpportunity) {
        const parentRes = await OpportunityService.uploadParentOperatorsSpreadsheet(opportunityId, [file]);
        savedFilePath = parentRes.spreadsheet_data?.file_path || null;

        await ApiHandler.put(`/v1/parent-opportunities/${opportunityId}/operators-and-production`, {
          headers: parsed.headers,
          rows: parsed.rows,
          sheets: parsed.sheets,
          html: parsed.html,
          file_path: savedFilePath,
          data_year: dataYear.trim() || String(new Date().getFullYear()),
          filename: file.name,
        });
      } else {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("headers", JSON.stringify(parsed.headers));
        formData.append("rows", JSON.stringify(parsed.rows));
        formData.append("sheets", JSON.stringify(parsed.sheets));
        formData.append("html", parsed.html || "");

        const childRes = await OpportunityService.uploadOpportunitySpreadsheet(opportunityId, formData);
        savedFilePath = childRes.spreadsheet_data?.file_path || null;
      }

      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setSheetsData(parsed.sheets);
      setActiveSheetIndex(0);
      setDisplayMode("document");
      setUploadedFilename(file.name);
      setUploadedFilePath(savedFilePath);
      setUploadedAt(new Date().toISOString());

      notify.success("Spreadsheet Uploaded", `Successfully uploaded ${file.name} (Original file stored for download).`);
      if (onSaved) onSaved();
    } catch (err: any) {
      console.error("Spreadsheet file upload failed:", err);
      notify.error("Upload Error", err.message || "Failed to process spreadsheet file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Save changes to Database (Grid Mode)
  const handleSave = async () => {
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      if (isParentOpportunity) {
        await ApiHandler.put(`/v1/parent-opportunities/${opportunityId}/operators-and-production`, {
          data_year: dataYear.trim() || String(new Date().getFullYear()),
          headers,
          rows,
          filename: uploadedFilename || undefined,
        });
        notify.success("Saved Successfully", "Operators and production data updated.");
      } else {
        await ApiHandler.put(`/v1/opportunities/${opportunityId}/spreadsheet`, {
          headers,
          rows,
          filename: uploadedFilename || undefined,
        });
        notify.success("Saved Successfully", "Spreadsheet data updated for this opportunity.");
      }
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Failed to save spreadsheet:", err);
      notify.error("Save Error", "Could not save spreadsheet data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveYearOnly = async () => {
    if (!isParentOpportunity || !isAdmin) return;
    try {
      await ApiHandler.put(`/v1/parent-opportunities/${opportunityId}/operators-and-production`, {
        data_year: dataYear.trim() || String(new Date().getFullYear()),
        headers,
        rows,
        filename: uploadedFilename || undefined,
      });
      notify.success("Year Updated", `Data year updated to ${dataYear}.`);
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Failed to update year:", err);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  // Download exact original file if stored on server, or export real .xlsx workbook
  const handleDownloadFile = async () => {
    setIsDownloading(true);
    try {
      // 1. Download the exact original physical file directly from the backend download endpoint
      if (opportunityId && (uploadedFilePath || uploadedFilename)) {
        try {
          const downloadEndpoint = isParentOpportunity
            ? `/v1/parent-opportunities/${opportunityId}/operators-and-production/spreadsheet/download`
            : `/v1/opportunities/${opportunityId}/spreadsheet/download`;

          const response = await AxiosInstance.get(downloadEndpoint, {
            responseType: "blob",
          });

          // If the server returned an error JSON instead of file stream
          if (response.data && response.data.type === "application/json") {
            const text = await (response.data as Blob).text();
            const errObj = JSON.parse(text);
            throw new Error(errObj.message || "Failed to download");
          }

          let filename = uploadedFilename || `${opportunityName.replace(/[^a-zA-Z0-9_-]/g, "_")}.xlsx`;
          const disposition = response.headers?.["content-disposition"];
          if (disposition && typeof disposition === "string") {
            const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1].replace(/['"]/g, "").trim();
            }
          }

          const mimeType = typeof response.headers?.["content-type"] === "string"
            ? response.headers["content-type"]
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

          const blob = new Blob([response.data], { type: mimeType });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          notify.success("Download Complete", `Downloaded ${filename}`);
          return;
        } catch (apiErr: any) {
          console.warn("Direct file download route failed or no uploaded file, falling back to grid generator:", apiErr);
        }
      }

      // 2. Fallback: generate clean Excel (.xlsx) workbook using ExcelJS
      if (headers.length > 0 || rows.length > 0) {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet(sheetsData[0]?.name || "Data Sheet");
        
        if (headers.length > 0) {
          ws.addRow(headers);
          const headRow = ws.getRow(1);
          headRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
          headRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF002B66" } };
          headRow.alignment = { horizontal: "center", vertical: "middle" };
        }

        rows.forEach((r) => ws.addRow(r));

        // Auto-fit column widths
        ws.columns.forEach((column) => {
          let maxLen = 14;
          column.eachCell?.({ includeEmpty: false }, (cell) => {
            const len = cell.value ? String(cell.value).length : 0;
            if (len > maxLen) maxLen = Math.min(len + 3, 40);
          });
          column.width = maxLen;
        });

        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const safeName = opportunityName.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 30);
        a.download = `${safeName}_DataSheet.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        notify.success("Export Complete", "Exported Excel (.xlsx) file.");
        return;
      }

      notify.info("No File Available", "There is no spreadsheet file attached to download.");
    } catch (err: any) {
      console.error("Failed to download file:", err);
      notify.error("Download Error", err.message || "Failed to download the spreadsheet file.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Filter rows by search
  const filteredRows = rows.filter((row) => {
    if (!searchQuery.trim()) return true;
    return row.some((cell) => cell.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const zoomLevels = [50, 75, 90, 100, 110, 125, 150];
  const handleZoomIn = () => {
    const nextIdx = zoomLevels.findIndex((lvl) => lvl > zoom);
    if (nextIdx !== -1) setZoom(zoomLevels[nextIdx]);
    else if (zoom < 200) setZoom((prev) => Math.min(200, prev + 15));
  };
  const handleZoomOut = () => {
    const prevLvls = [...zoomLevels].reverse();
    const nextIdx = prevLvls.findIndex((lvl) => lvl < zoom);
    if (nextIdx !== -1) setZoom(prevLvls[nextIdx]);
    else if (zoom > 40) setZoom((prev) => Math.max(40, prev - 15));
  };
  const handleZoomReset = () => setZoom(100);

  const containerClasses = isFullScreen
    ? "fixed inset-0 z-[100] w-screen h-screen bg-white flex flex-col overflow-hidden"
    : "flex flex-col h-full bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden";

  return (
    <div className={containerClasses}>
      {/* Unified Professional Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#002B66] to-[#003882] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full">
              {sheetTitle || (uploadOnly ? "Annual Reports (Upload Mode)" : isAdmin ? "Data Entry & Spreadsheet Editor" : "Project Data Sheet (Investor View-Only)")}
            </span>
            <span className="text-xs text-blue-200 font-semibold">• {categoryName}</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight">{opportunityName}</h2>
          <p className="text-xs text-slate-300">
            {locationName}
            {sheetsData.length > 0 && ` • Sheet: ${sheetsData[activeSheetIndex]?.name || "Sheet1"} (${activeSheetIndex + 1}/${sheetsData.length})`}
            {headers.length > 0 && ` • ${headers.length} Columns • ${rows.length} Data Records`}
            {uploadedFilename && ` • File: ${uploadedFilename}`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Zoom Controls */}
          {sheetsData.length > 0 && displayMode === "document" && (
            <div className="flex items-center bg-white/10 border border-white/20 rounded-xl px-1.5 py-0.5 text-xs text-white">
              <button
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1 hover:bg-white/20 rounded-lg cursor-pointer transition"
              >
                <ZoomOut className="w-3.5 h-3.5 text-slate-200" />
              </button>
              <button
                onClick={handleZoomReset}
                title="Reset Zoom (100%)"
                className="px-2 py-0.5 font-bold text-[11px] text-emerald-300 hover:text-white cursor-pointer"
              >
                {zoom}%
              </button>
              <button
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1 hover:bg-white/20 rounded-lg cursor-pointer transition"
              >
                <ZoomIn className="w-3.5 h-3.5 text-slate-200" />
              </button>
              <button
                onClick={handleZoomReset}
                title="Reset Scale"
                className="p-1 hover:bg-white/20 rounded-lg cursor-pointer text-slate-300"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Toggle between Document High-Fidelity & Grid (If editable and sheet exists) */}
          {isEditable && sheetsData.length > 0 && (
            <button
              onClick={() => setDisplayMode(displayMode === "document" ? "grid" : "document")}
              title={displayMode === "document" ? "Switch to Cell Editor" : "Switch to Document Layout"}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {displayMode === "document" ? (
                <>
                  <TableIcon className="w-3.5 h-3.5 text-sky-300" />
                  <span>Edit Cells</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Document View</span>
                </>
              )}
            </button>
          )}

          {isAdmin && (
            <>
              {/* Hidden File Input for Spreadsheet Upload */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Upload Spreadsheet File (.xlsx, .xls, .csv)"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{uploadedFilename ? "Replace File" : "Upload Spreadsheet"}</span>
              </button>

              {(uploadedFilename || headers.length > 0 || sheetsData.length > 0) && (
                <button
                  onClick={handleRemoveFile}
                  title="Remove and Detach Spreadsheet File"
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/80 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove File</span>
                </button>
              )}
            </>
          )}

          {isEditable && displayMode === "grid" && (
            <>
              <button
                onClick={handleAddRow}
                title="Add New Row"
                className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-300" />
                <span>Add Row</span>
              </button>

              <button
                onClick={handleAddColumn}
                title="Add New Column"
                className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Columns3 className="w-3.5 h-3.5 text-sky-300" />
                <span>Add Col</span>
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                title="Save Spreadsheet Changes"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save</span>
              </button>
            </>
          )}

          {/* Download Original File Button */}
          <button
            onClick={handleDownloadFile}
            disabled={isDownloading || (!uploadedFilename && !uploadedFilePath && headers.length === 0 && sheetsData.length === 0)}
            title={uploadedFilename ? `Download original ${uploadedFilename}` : "Download Spreadsheet File"}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
            ) : (
              <Download className="w-3.5 h-3.5 text-emerald-300" />
            )}
            <span>Download File</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen View"}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all cursor-pointer"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              title="Close Spreadsheet"
              className="p-2 bg-white/10 hover:bg-rose-500/80 border border-white/20 rounded-xl text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-toolbar: Search, Year Input & Status */}
      <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          {displayMode === "grid" && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rows in sheet..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#002B66]"
              />
            </div>
          )}

          {isParentOpportunity && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-[11px] font-extrabold uppercase text-slate-500 whitespace-nowrap">
                Year Data Created:
              </span>
              {isAdmin ? (
                <input
                  type="text"
                  value={dataYear}
                  onChange={(e) => {
                    setDataYear(e.target.value);
                    if (onYearChange) onYearChange(e.target.value);
                  }}
                  onBlur={handleSaveYearOnly}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveYearOnly();
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  placeholder="e.g. 2026"
                  className="w-20 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs font-black text-slate-900 outline-none focus:ring-1 focus:ring-blue-600 text-center"
                />
              ) : (
                <span className="text-xs font-black text-slate-900">
                  {dataYear || "Current"}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          {uploadedFilename && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs shadow-2xs">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold text-slate-800 truncate max-w-[200px]" title={uploadedFilename}>
                {uploadedFilename}
              </span>
              {uploadedAt && (
                <span className="text-[10px] text-slate-400">
                  ({new Date(uploadedAt).toLocaleDateString()})
                </span>
              )}
            </div>
          )}

          {uploadOnly ? (
            <span className="flex items-center gap-1 text-slate-600 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              High-Fidelity Document Preview
            </span>
          ) : isEditable ? (
            <span className="flex items-center gap-1 text-slate-600 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {displayMode === "document" ? "Document View (Layout Preserved)" : "Double-click any cell or header to edit"}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-600 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Investor View • Official Form Layout
            </span>
          )}

          {isEditable && rows.length > 0 && displayMode === "grid" && (
            <button
              onClick={handleClearSheet}
              title="Empty row data while keeping columns and file attachment"
              className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline"
            >
              Clear Rows Only
            </button>
          )}
        </div>
      </div>

      {/* Main Grid / Document Viewport */}
      <div className="flex-1 overflow-auto bg-slate-100/70 relative">
        {isLoading ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#002B66]" />
            <span className="text-xs font-medium">Loading project spreadsheet...</span>
          </div>
        ) : sheetsData.length === 0 && headers.length === 0 && (!isAdmin || uploadOnly) ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-3 text-center bg-white m-4 rounded-xl border border-dashed border-slate-200 p-8">
            <FileSpreadsheet className="w-10 h-10 text-slate-300" />
            <div>
              <h4 className="text-sm font-bold text-slate-700">No Spreadsheet Data Available</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                {uploadOnly
                  ? "Click 'Upload Spreadsheet' to import an .xlsx, .xls, or .csv file containing annual operators and production data."
                  : isAdmin
                  ? "Click 'Add Row' or 'Upload Spreadsheet' above to begin populating data for this investment project."
                  : "The administration has not attached spreadsheet records to this investment opportunity yet."}
              </p>
            </div>
            {isAdmin && uploadOnly && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Spreadsheet (.xlsx, .xls, .csv)</span>
                </button>
              </div>
            )}
          </div>
        ) : sheetsData.length > 0 && displayMode === "document" ? (
          /* High-Fidelity Excel Viewport (Option A: Formatted, Merged Cells, Dates Intact) */
          <div className="p-4 sm:p-6 flex justify-center items-start min-h-full">
            <div
              className="bg-white rounded-xl shadow-md border border-slate-200/90 p-4 sm:p-6 w-full max-w-full overflow-x-auto origin-top transition-transform duration-100"
              style={{
                zoom: `${zoom}%`,
              }}
            >
              <div
                className="excel-doc-wrapper"
                dangerouslySetInnerHTML={{
                  __html: sheetsData[activeSheetIndex]?.html || "<p class='p-4 text-center text-slate-400 italic'>No content in sheet.</p>",
                }}
              />
            </div>
          </div>
        ) : (
          /* Editable Data Grid (Manual Editing Fallback) */
          <div className="p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {/* Row Index Column Header */}
                      <th className="w-12 px-3 py-2 text-center text-[11px] font-bold text-slate-400 bg-slate-100 border-r border-slate-200">
                        #
                      </th>

                      {/* Column Headers */}
                      {headers.map((head, colIdx) => (
                        <th
                          key={colIdx}
                          className="px-3 py-2 text-xs font-bold text-[#002B66] border-r border-slate-200 min-w-[160px] bg-slate-50/90 relative group"
                        >
                          {isEditable ? (
                            <div className="flex items-center justify-between gap-2">
                              <input
                                type="text"
                                value={head}
                                onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                                className="w-full bg-transparent font-bold text-xs text-[#002B66] outline-none hover:bg-white/80 focus:bg-white focus:ring-1 focus:ring-blue-500 px-1 py-0.5 rounded"
                              />
                              {headers.length > 1 && (
                                <button
                                  onClick={() => handleDeleteColumn(colIdx)}
                                  title="Delete Column"
                                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-opacity p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span>{head}</span>
                          )}
                        </th>
                      ))}

                      {/* Admin Actions Column */}
                      {isEditable && (
                        <th className="w-12 px-2 py-2 text-center text-[10px] font-bold text-slate-400 bg-slate-100">
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={headers.length + (isEditable ? 2 : 1)}
                          className="px-4 py-8 text-center text-slate-400 text-xs italic"
                        >
                          {searchQuery ? "No matching rows found." : "Spreadsheet is currently empty."}
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-blue-50/20 transition-colors">
                          <td className="px-3 py-2 text-center text-[11px] font-semibold text-slate-400 bg-slate-50/60 border-r border-slate-200 select-none">
                            {rowIdx + 1}
                          </td>

                          {headers.map((_, colIdx) => {
                            const cellValue = row[colIdx] || "";
                            const isActive =
                              activeCell?.row === rowIdx && activeCell?.col === colIdx;

                            return (
                              <td
                                key={colIdx}
                                onClick={() => isEditable && setActiveCell({ row: rowIdx, col: colIdx })}
                                className={`p-0 border-r border-slate-200 relative ${
                                  isActive ? "ring-2 ring-blue-600 z-10" : ""
                                }`}
                              >
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={cellValue}
                                    onChange={(e) =>
                                      handleCellChange(rowIdx, colIdx, e.target.value)
                                    }
                                    placeholder="—"
                                    className="w-full h-full px-3 py-2 bg-transparent text-xs text-slate-800 outline-none focus:bg-white"
                                  />
                                ) : (
                                  <div className="px-3 py-2 text-xs text-slate-700 font-medium">
                                    {cellValue || "—"}
                                  </div>
                                )}
                              </td>
                            );
                          })}

                          {isEditable && (
                            <td className="px-2 py-1 text-center bg-slate-50/40">
                              <button
                                onClick={() => handleDeleteRow(rowIdx)}
                                title="Delete Row"
                                className="p-1 text-slate-300 hover:text-rose-600 transition-colors rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Sheet Bottom Tabs (If workbook contains multiple sheets) */}
      {sheetsData.length > 1 && displayMode === "document" && (
        <div className="flex items-center gap-1 px-4 py-1.5 bg-slate-200 border-t border-slate-300 overflow-x-auto shrink-0">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 mr-2 flex items-center gap-1">
            <FileSpreadsheet className="w-3 h-3 text-slate-400" /> Sheets:
          </span>
          {sheetsData.map((sheet, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSheetIndex(idx)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                activeSheetIndex === idx
                  ? "bg-white text-[#002B66] shadow-xs border-b-2 border-[#002B66]"
                  : "bg-slate-300/60 hover:bg-white/60 text-slate-700"
              }`}
            >
              <span>{sheet.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between shrink-0">
        <span>
          {displayMode === "document"
            ? sheetsData.length > 0
              ? `Displaying Sheet: ${sheetsData[activeSheetIndex]?.name || "Sheet1"}`
              : "Document layout mode"
            : `Showing ${filteredRows.length} of ${rows.length} rows`}
        </span>
        <span className="font-semibold text-slate-400">
          PEDIPO Capiz IS • Investment Management Module Integration
        </span>
      </div>
    </div>
  );
};

export default SpreadsheetGrid;
