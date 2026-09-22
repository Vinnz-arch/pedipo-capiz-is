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
  X
} from "lucide-react";
import * as XLSX from "xlsx";
import { notify } from "@/util/notify";
import { ApiHandler } from "@/api/ApiHandler";

export interface SpreadsheetData {
  headers: string[];
  rows: string[][];
  filename?: string;
  updated_at?: string;
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
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
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
        if (data && data.headers && data.headers.length > 0) {
          setHeaders(data.headers);
          setRows(data.rows || []);
          if (data.filename) setUploadedFilename(data.filename);
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
        } else {
          setHeaders([]);
          setRows([]);
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

  // Clear Sheet (reset to empty)
  const handleClearSheet = () => {
    if (!isEditable) return;
    if (confirm("Are you sure you want to clear all data in this spreadsheet?")) {
      setRows([]);
    }
  };

  // Upload Spreadsheet file (.xlsx, .xls, .csv) and parse using SheetJS
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
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        notify.error("Empty Workbook", "The uploaded spreadsheet file contains no readable sheets.");
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
      if (!jsonData || jsonData.length === 0) {
        notify.error("Empty Spreadsheet", "The uploaded sheet has no rows.");
        return;
      }

      const headerIdx = jsonData.findIndex((r) => r && r.some((c: any) => String(c).trim() !== ""));
      if (headerIdx === -1) {
        notify.error("Empty Spreadsheet", "No header row found in the uploaded file.");
        return;
      }

      const rawHeaders = jsonData[headerIdx];
      const extractedHeaders = rawHeaders.map((h: any, i: number) => String(h || "").trim() || `Column ${i + 1}`);

      const extractedRows = jsonData.slice(headerIdx + 1)
        .filter((r) => r && r.some((c: any) => String(c).trim() !== ""))
        .map((r) =>
          extractedHeaders.map((_, colIdx) => (r[colIdx] !== undefined && r[colIdx] !== null ? String(r[colIdx]).trim() : ""))
        );

      const endpoint = isParentOpportunity
        ? `/v1/parent-opportunities/${opportunityId}/operators-and-production`
        : `/v1/opportunities/${opportunityId}/spreadsheet`;

      await ApiHandler.put(endpoint, {
        headers: extractedHeaders,
        rows: extractedRows,
        data_year: isParentOpportunity ? (dataYear.trim() || String(new Date().getFullYear())) : undefined,
        filename: file.name,
      });

      setHeaders(extractedHeaders);
      setRows(extractedRows);
      setUploadedFilename(file.name);
      setUploadedAt(new Date().toISOString());

      notify.success("Spreadsheet Uploaded", `Successfully loaded ${extractedRows.length} rows from ${file.name}.`);
      if (onSaved) onSaved();
    } catch (err: any) {
      console.error("Spreadsheet file upload failed:", err);
      notify.error("Upload Error", err.message || "Failed to process spreadsheet file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Save changes to Database
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

  // Export CSV download
  const handleExportCSV = () => {
    if (headers.length === 0) return;

    let csv = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";
    rows.forEach((row) => {
      const line = headers
        .map((_, colIdx) => `"${(row[colIdx] || "").replace(/"/g, '""')}"`)
        .join(",");
      csv += line + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeName = opportunityName.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 30);
    link.setAttribute("download", `${safeName}_DataSheet.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter rows by search
  const filteredRows = rows.filter((row) => {
    if (!searchQuery.trim()) return true;
    return row.some((cell) => cell.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 bg-gradient-to-r from-[#002B66] to-[#003882] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full">
              {sheetTitle || (uploadOnly ? "Annual Reports (Upload Mode)" : isAdmin ? "Data Entry & Spreadsheet Editor" : "Project Data Sheet (View Only)")}
            </span>
            <span className="text-xs text-blue-200 font-semibold">• {categoryName}</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight">{opportunityName}</h2>
          <p className="text-xs text-slate-300">
            {locationName} • {headers.length} Columns • {rows.length} Data Records
            {uploadedFilename && ` • File: ${uploadedFilename}`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {isAdmin && (
            <>
              {/* Hidden File Input for Spreadsheet Upload (.xlsx, .xls, .csv) */}
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
            </>
          )}

          {isEditable && (
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

          {/* Export CSV (Both Admin and Investor can export) */}
          <button
            onClick={handleExportCSV}
            disabled={headers.length === 0}
            title="Download Spreadsheet as CSV"
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Export CSV</span>
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
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
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
              <span className="font-bold text-slate-800 truncate max-w-[180px]" title={uploadedFilename}>
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
              Upload-Only Mode • Sheet is non-editable
            </span>
          ) : isEditable ? (
            <span className="flex items-center gap-1 text-slate-600 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Double-click any cell or header to edit
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-600 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Read-Only Viewer Mode for Investors
            </span>
          )}

          {isEditable && rows.length > 0 && (
            <button
              onClick={handleClearSheet}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
            >
              Clear Rows
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className="flex-1 overflow-auto bg-slate-100/50 p-4">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#002B66]" />
            <span className="text-xs font-medium">Loading project spreadsheet...</span>
          </div>
        ) : headers.length === 0 || (rows.length === 0 && !isAdmin) ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-center bg-white rounded-xl border border-dashed border-slate-200 p-8">
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
            {isAdmin && !uploadOnly && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    setHeaders(["Item Description", "Specifications", "Unit", "Cost (PHP)"]);
                    setRows([["", "", "", ""]]);
                  }}
                  className="px-3 py-1.5 bg-[#002B66] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Create Initial Sheet
                </button>
              </div>
            )}
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
        ) : (
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

                    {/* Admin Actions Column (Editable mode only) */}
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
                        {/* Row Index */}
                        <td className="px-3 py-2 text-center text-[11px] font-semibold text-slate-400 bg-slate-50/60 border-r border-slate-200 select-none">
                          {rowIdx + 1}
                        </td>

                        {/* Cells */}
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

                        {/* Admin Row Delete Button (Editable mode only) */}
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
        )}
      </div>

      {/* Footer Info */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
        <span>
          Showing {filteredRows.length} of {rows.length} rows
        </span>
        <span className="font-semibold text-slate-400">
          PEDIPO Capiz IS • Investment Management Module Integration
        </span>
      </div>
    </div>
  );
};

export default SpreadsheetGrid;
