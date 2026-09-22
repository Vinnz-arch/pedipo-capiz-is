import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileSpreadsheet,
  Search,
  Building2,
  RefreshCw,
  MapPin,
  Database,
  ArrowUpRight,
  Upload,
  Eye,
  Loader2
} from "lucide-react";
import * as XLSX from "xlsx";
import { notify } from "@/util/notify";
import { ApiHandler } from "@/api/ApiHandler";
import MainLayout from "@/components/layout/Mainlayout";
import { OpportunityService, type OpportunityData, type CategoryData } from "@/services/OpportunityService";
import { SpreadsheetGrid } from "@/components/spreadsheet/SpreadsheetGrid";
import { PATHS } from "@/routes/paths";

export const DataEntry: React.FC = () => {
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeOpportunity, setActiveOpportunity] = useState<OpportunityData | null>(null);
  const [isDirectUploadingId, setIsDirectUploadingId] = useState<number | string | null>(null);

  const handleDirectUpload = async (opp: OpportunityData, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["csv", "xlsx", "xls"].includes(fileExt)) {
      notify.error("Invalid File Type", "Please upload a valid spreadsheet file (.xlsx, .xls, or .csv).");
      return;
    }

    setIsDirectUploadingId(opp.id);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        notify.error("Empty Workbook", "The uploaded spreadsheet workbook contains no readable sheets.");
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

      await ApiHandler.put(`/v1/opportunities/${opp.id}/spreadsheet`, {
        headers: extractedHeaders,
        rows: extractedRows,
        filename: file.name,
      });

      notify.success("Spreadsheet Uploaded", `Successfully loaded ${extractedRows.length} records into ${opp.project_name}.`);
      await loadData();
    } catch (err: any) {
      console.error("Direct spreadsheet upload failed:", err);
      notify.error("Upload Error", err.message || "Failed to process spreadsheet file.");
    } finally {
      setIsDirectUploadingId(null);
      e.target.value = "";
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await OpportunityService.getAll();
      if (res && res.opportunities) {
        setOpportunities(res.opportunities);
      }
      if (res && res.categories) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error("Failed to load opportunities for data entry:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter opportunities
  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesCategory =
      selectedCategory === "All" || opp.category?.name === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      opp.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opp.municipality?.name || opp.location || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <MainLayout>
      <div className="space-y-6 pb-12 text-left">
        {/* Page Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#002B66] to-[#003882] p-6 rounded-2xl text-white shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-white/10 rounded-lg">
                <Database className="w-4 h-4 text-emerald-300" />
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200">
                Data Management Subsystem
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              Investment Data Entry Module
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Upload spreadsheet files (.xlsx, .xls, .csv) for synchronized investment opportunities. Uploaded sheets are automatically parsed and displayed in a non-editable, verified data sheet, and remain viewable for investors on the Investor Portal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={PATHS.APP.MANAGE_INVESTMENT_MANAGEMENT}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all text-white shrink-0"
            >
              <span>Investment Management</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={loadData}
              disabled={isLoading}
              title="Refresh Synchronized Opportunities"
              className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Toolbar: Search and Categories */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === "All"
                  ? "bg-[#002B66] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Projects ({opportunities.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.name
                    ? "bg-[#002B66] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search investment projects..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
            />
          </div>
        </div>

        {/* Opportunities List / Cards Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#002B66]" />
              <h2 className="text-sm font-bold text-slate-900">
                Synchronized Investment Opportunities ({filteredOpportunities.length})
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Click any project to launch its spreadsheet file
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium">
              Loading synchronized investment projects...
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <Building2 className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">No opportunities match your filter.</p>
              <p className="text-[11px]">
                Create new projects in the Investment Management module to manage their data spreadsheets.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                    <th className="p-3.5 pl-5">Project Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Land Area</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-5">Spreadsheet Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOpportunities.map((opp) => (
                    <tr
                      key={opp.id}
                      onClick={() => setActiveOpportunity(opp)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-[#002B66] group-hover:text-white transition-colors">
                            <FileSpreadsheet className="w-4 h-4 text-[#002B66] group-hover:text-white" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors block text-xs">
                              {opp.project_name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ID #{opp.id} • Connected to Investment Management
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-medium text-slate-600">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {opp.category?.name || "General"}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          <span>{opp.municipality?.name || opp.location || "Capiz"}</span>
                        </div>
                      </td>

                      <td className="p-3.5 font-bold text-slate-700">
                        {opp.land_area ? `${opp.land_area} Ha` : "Designated Lot"}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            opp.status === "Published"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : opp.status === "Closed"
                              ? "bg-slate-100 text-slate-600 border-slate-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {opp.status}
                        </span>
                      </td>

                      <td className="p-3.5 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {opp.spreadsheet_data?.rows && opp.spreadsheet_data.rows.length > 0 ? (
                            <div className="text-right hidden xl:block mr-1">
                              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block truncate max-w-[140px]" title={opp.spreadsheet_data.filename || "Sheet Uploaded"}>
                                {opp.spreadsheet_data.filename || "Uploaded"}
                              </span>
                              <span className="text-[9px] text-slate-400">
                                {opp.spreadsheet_data.rows.length} record{opp.spreadsheet_data.rows.length === 1 ? "" : "s"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded mr-1 hidden xl:inline-block">
                              No Sheet File
                            </span>
                          )}

                          {/* Direct file upload label/button for row */}
                          <label
                            title="Upload Spreadsheet File (.xlsx, .xls, .csv)"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-xs shadow-2xs transition-all cursor-pointer shrink-0"
                          >
                            {isDirectUploadingId === opp.id ? (
                              <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            <span>{opp.spreadsheet_data?.rows && opp.spreadsheet_data.rows.length > 0 ? "Replace" : "Upload File"}</span>
                            <input
                              type="file"
                              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                              onChange={(e) => handleDirectUpload(opp, e)}
                              disabled={isDirectUploadingId === opp.id}
                              className="hidden"
                            />
                          </label>

                          {/* View Sheet Button */}
                          <button
                            onClick={() => setActiveOpportunity(opp)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#002B66] hover:bg-[#003882] text-white font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Sheet</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Spreadsheet Modal (Non-Editable Upload-Only Mode) */}
        {activeOpportunity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-6xl h-[88vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <SpreadsheetGrid
                opportunityId={activeOpportunity.id}
                opportunityName={activeOpportunity.project_name}
                categoryName={activeOpportunity.category?.name}
                locationName={activeOpportunity.municipality?.name || activeOpportunity.location}
                isAdmin={true}
                uploadOnly={true}
                onClose={() => setActiveOpportunity(null)}
                onSaved={() => {
                  loadData();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DataEntry;
