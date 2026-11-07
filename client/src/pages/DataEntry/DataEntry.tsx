import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  Loader2,
  Layers,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  ExternalLink,
  AlertCircle,
  FolderGit2,
  Table,
  MoveRight
} from "lucide-react";
import * as XLSX from "xlsx";
import { notify } from "@/util/notify";
import { ApiHandler } from "@/api/ApiHandler";
import MainLayout from "@/components/layout/Mainlayout";
import {
  OpportunityService,
  type ParentOpportunityData,
  type OpportunityData,
  type CategoryData
} from "@/services/OpportunityService";
import { SpreadsheetGrid } from "@/components/spreadsheet/SpreadsheetGrid";
import { PATHS } from "@/routes/paths";

interface ActiveSpreadsheetTarget {
  id: number | string;
  name: string;
  categoryName?: string;
  locationName?: string;
  isParentOpportunity: boolean;
  initialYear?: string;
}

export const DataEntry: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [parentOpportunities, setParentOpportunities] = useState<ParentOpportunityData[]>([]);
  const [standaloneOpportunities, setStandaloneOpportunities] = useState<OpportunityData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // View Mode: 'grouped' shows Opportunity Groups with nested locations; 'flat' shows all project locations
  const [viewMode, setViewMode] = useState<"grouped" | "flat">("grouped");

  // Accordion state for expanded parent groups
  const [expandedParentIds, setExpandedParentIds] = useState<Record<string | number, boolean>>({});
  const [isStandaloneExpanded, setIsStandaloneExpanded] = useState<boolean>(true);

  // Active spreadsheet modal target (either parent opportunity or child project)
  const [activeSpreadsheet, setActiveSpreadsheet] = useState<ActiveSpreadsheetTarget | null>(null);

  // Direct file uploading indicator: stores key like `parent-1` or `child-7`
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  // Assigning standalone opportunity modal / inline selector
  const [assigningChildId, setAssigningChildId] = useState<number | string | null>(null);
  const [selectedAssignParentId, setSelectedAssignParentId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Fetch all parent opportunities and child projects
  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await OpportunityService.getAllParents();
      if (res) {
        const parents = res.parent_opportunities || [];
        setParentOpportunities(parents);
        setStandaloneOpportunities(res.standalone_opportunities || []);
        setCategories(res.categories || []);

        // Default expand all parents
        const initialExpanded: Record<string | number, boolean> = {};
        parents.forEach((p) => {
          initialExpanded[p.id] = true;
        });
        setExpandedParentIds((prev) => ({ ...initialExpanded, ...prev }));
      }
    } catch (err) {
      console.error("Failed to load opportunities for data entry:", err);
      notify.error("Load Error", "Failed to retrieve synchronized opportunities.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle URL Deep-linking (?parent=ID or ?opp=ID)
  useEffect(() => {
    if (isLoading || parentOpportunities.length === 0) return;

    const parentParam = searchParams.get("parent");
    const oppParam = searchParams.get("opp");

    if (parentParam) {
      const targetParent = parentOpportunities.find((p) => String(p.id) === String(parentParam));
      if (targetParent) {
        setExpandedParentIds((prev) => ({ ...prev, [targetParent.id]: true }));
        // Scroll to parent group
        setTimeout(() => {
          const el = document.getElementById(`parent-card-${targetParent.id}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
      }
    } else if (oppParam) {
      // Find parent containing this child or standalone
      let foundParent: ParentOpportunityData | undefined;
      let foundChild: OpportunityData | undefined;

      for (const p of parentOpportunities) {
        const c = p.projects?.find((proj) => String(proj.id) === String(oppParam));
        if (c) {
          foundParent = p;
          foundChild = c;
          break;
        }
      }

      if (!foundChild) {
        foundChild = standaloneOpportunities.find((s) => String(s.id) === String(oppParam));
      }

      if (foundParent) {
        setExpandedParentIds((prev) => ({ ...prev, [foundParent.id]: true }));
      }

      if (foundChild) {
        setActiveSpreadsheet({
          id: foundChild.id,
          name: foundChild.project_name,
          categoryName: foundChild.category?.name,
          locationName: foundChild.municipality?.name || foundChild.location,
          isParentOpportunity: false,
        });
      }
    }
  }, [searchParams, parentOpportunities, standaloneOpportunities, isLoading]);

  const toggleParentExpand = (parentId: number | string) => {
    setExpandedParentIds((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  // Helper to parse spreadsheet file (.xlsx, .xls, .csv)
  const parseSpreadsheetFile = async (
    file: File
  ): Promise<{ headers: string[]; rows: string[][] } | null> => {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["csv", "xlsx", "xls"].includes(fileExt)) {
      notify.error("Invalid File Type", "Please upload a valid spreadsheet file (.xlsx, .xls, or .csv).");
      return null;
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      notify.error("Empty Workbook", "The uploaded spreadsheet workbook contains no readable sheets.");
      return null;
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
    if (!jsonData || jsonData.length === 0) {
      notify.error("Empty Spreadsheet", "The uploaded sheet has no rows.");
      return null;
    }

    const headerIdx = jsonData.findIndex((r) => r && r.some((c: any) => String(c).trim() !== ""));
    if (headerIdx === -1) {
      notify.error("Empty Spreadsheet", "No header row found in the uploaded file.");
      return null;
    }

    const rawHeaders = jsonData[headerIdx];
    const extractedHeaders = rawHeaders.map((h: any, i: number) => String(h || "").trim() || `Column ${i + 1}`);

    const extractedRows = jsonData
      .slice(headerIdx + 1)
      .filter((r) => r && r.some((c: any) => String(c).trim() !== ""))
      .map((r) =>
        extractedHeaders.map((_, colIdx) => (r[colIdx] !== undefined && r[colIdx] !== null ? String(r[colIdx]).trim() : ""))
      );

    return { headers: extractedHeaders, rows: extractedRows };
  };

  // Upload spreadsheet directly to Parent Opportunity (Annual Reports / Sector Data)
  const handleDirectUploadParent = async (
    parent: ParentOpportunityData,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const key = `parent-${parent.id}`;
    setUploadingKey(key);

    try {
      const parsed = await parseSpreadsheetFile(file);
      if (!parsed) return;

      // 1. Update parsed tabular data in parent operators and production
      await ApiHandler.put(`/v1/parent-opportunities/${parent.id}/operators-and-production`, {
        headers: parsed.headers,
        rows: parsed.rows,
        filename: file.name,
        data_year: String(new Date().getFullYear()),
      });

      // 2. Also register file in parent Annual Reports list for downloadable access
      await OpportunityService.uploadParentOperatorsSpreadsheet(parent.id, [file]);

      notify.success(
        "Sector Sheet Uploaded",
        `Successfully loaded ${parsed.rows.length} rows into ${parent.name} Annual Reports.`
      );
      await loadData();
    } catch (err: any) {
      console.error("Parent spreadsheet upload failed:", err);
      notify.error("Upload Error", err.message || "Failed to process sector spreadsheet file.");
    } finally {
      setUploadingKey(null);
      e.target.value = "";
    }
  };

  // Upload spreadsheet directly to Child Project (Feasibility Data Sheet)
  const handleDirectUploadChild = async (
    opp: OpportunityData,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const key = `child-${opp.id}`;
    setUploadingKey(key);

    try {
      const parsed = await parseSpreadsheetFile(file);
      if (!parsed) return;

      await ApiHandler.put(`/v1/opportunities/${opp.id}/spreadsheet`, {
        headers: parsed.headers,
        rows: parsed.rows,
        filename: file.name,
      });

      notify.success(
        "Project Data Sheet Uploaded",
        `Successfully loaded ${parsed.rows.length} records into ${opp.project_name}.`
      );
      await loadData();
    } catch (err: any) {
      console.error("Direct child spreadsheet upload failed:", err);
      notify.error("Upload Error", err.message || "Failed to process spreadsheet file.");
    } finally {
      setUploadingKey(null);
      e.target.value = "";
    }
  };

  // Move / Assign unassigned opportunity to a parent opportunity group
  const handleAssignToParent = async (oppId: number | string) => {
    if (!selectedAssignParentId) {
      notify.warning("Selection Required", "Please choose an Opportunity Group to assign this project to.");
      return;
    }

    setIsAssigning(true);
    try {
      await OpportunityService.moveChildProject(oppId, selectedAssignParentId);
      notify.success("Project Assigned", "Project successfully assigned to the selected Opportunity Group.");
      setAssigningChildId(null);
      setSelectedAssignParentId("");
      await loadData();
    } catch (err) {
      console.error("Failed to assign project to parent:", err);
      notify.error("Assign Failed", "Could not assign project to Opportunity Group.");
    } finally {
      setIsAssigning(false);
    }
  };

  // Filtering Opportunity Groups
  const filteredParents = useMemo(() => {
    return parentOpportunities.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" || p.category?.name === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesParentSearch =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        (p.category?.name || "").toLowerCase().includes(q) ||
        (p.municipalities_summary || []).some((m) => m.toLowerCase().includes(q));

      const matchesChildSearch =
        q === "" ||
        (p.projects || []).some(
          (c) =>
            c.project_name.toLowerCase().includes(q) ||
            (c.location || "").toLowerCase().includes(q) ||
            (c.municipality?.name || "").toLowerCase().includes(q)
        );

      return matchesCategory && (matchesParentSearch || matchesChildSearch);
    });
  }, [parentOpportunities, selectedCategory, searchQuery]);

  // Flattened child projects list for 'flat' view mode
  const allChildProjects = useMemo(() => {
    const list: Array<OpportunityData & { parentName?: string; parentId?: number | string }> = [];
    parentOpportunities.forEach((p) => {
      (p.projects || []).forEach((c) => {
        list.push({ ...c, parentName: p.name, parentId: p.id });
      });
    });
    standaloneOpportunities.forEach((s) => {
      list.push({ ...s, parentName: "Unassigned Standalone", parentId: undefined });
    });

    return list.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category?.name === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        item.project_name.toLowerCase().includes(q) ||
        (item.parentName || "").toLowerCase().includes(q) ||
        (item.location || item.municipality?.name || "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [parentOpportunities, standaloneOpportunities, selectedCategory, searchQuery]);

  // Overall Statistics
  const totalProjectsCount = useMemo(() => {
    let count = standaloneOpportunities.length;
    parentOpportunities.forEach((p) => {
      count += p.projects?.length || 0;
    });
    return count;
  }, [parentOpportunities, standaloneOpportunities]);

  const totalSheetsUploaded = useMemo(() => {
    let count = 0;
    parentOpportunities.forEach((p) => {
      if (
        (p.spreadsheet_data?.rows && p.spreadsheet_data.rows.length > 0) ||
        (p.spreadsheet_data?.annual_reports && p.spreadsheet_data.annual_reports.length > 0)
      ) {
        count++;
      }
      (p.projects || []).forEach((c) => {
        if (c.spreadsheet_data?.rows && c.spreadsheet_data.rows.length > 0) {
          count++;
        }
      });
    });
    standaloneOpportunities.forEach((s) => {
      if (s.spreadsheet_data?.rows && s.spreadsheet_data.rows.length > 0) {
        count++;
      }
    });
    return count;
  }, [parentOpportunities, standaloneOpportunities]);

  return (
    <MainLayout>
      <div className="space-y-6 pb-16 text-left">
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
            <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2.5">
              <span>Investment Data Entry Module</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                Connected to Investment Management
              </span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Upload and manage spreadsheet datasets for verified Opportunity Groups and specific Project Locations. Datasets are non-editable in live investor presentation and immediately accessible in the Investor Portal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to={PATHS.APP.MANAGE_INVESTMENT_MANAGEMENT}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all text-white shrink-0 shadow-xs"
            >
              <FolderGit2 className="w-4 h-4 text-blue-300" />
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

        {/* Quick Statistics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#002B66] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Opportunity Groups
              </span>
              <span className="text-lg font-black text-slate-900">
                {parentOpportunities.length} Groups
              </span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Project Locations
              </span>
              <span className="text-lg font-black text-slate-900">
                {totalProjectsCount} Locations
              </span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Active Data Sheets
              </span>
              <span className="text-lg font-black text-slate-900">
                {totalSheetsUploaded} Uploaded
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar: Category Filters, Search, View Mode Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === "All"
                  ? "bg-[#002B66] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Sectors ({parentOpportunities.length})
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

          {/* Search Box & View Mode Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groups or locations..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => setViewMode("grouped")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "grouped"
                    ? "bg-white text-[#002B66] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Grouped by Opportunity Group / Sector"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">By Opportunity Group</span>
              </button>
              <button
                onClick={() => setViewMode("flat")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "flat"
                    ? "bg-white text-[#002B66] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="All Project Locations Flat List"
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">All Project Locations</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW MODE 1: HIERARCHICAL OPPORTUNITY GROUPS (DEFAULT & CONNECTED)       */}
        {/* ========================================================================= */}
        {viewMode === "grouped" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-16 text-center text-slate-400 text-xs font-medium bg-white rounded-2xl border border-slate-200">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                <span>Loading synchronized opportunity groups...</span>
              </div>
            ) : filteredParents.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-xs space-y-3 bg-white rounded-2xl border border-slate-200">
                <Building2 className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-bold text-slate-700 text-sm">No Opportunity Groups Found</p>
                <p className="text-xs max-w-md mx-auto text-slate-500">
                  No groups match your current filter. You can create new Opportunity Groups directly in Investment Management.
                </p>
                <Link
                  to={PATHS.APP.MANAGE_INVESTMENT_MANAGEMENT}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#002B66] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#003882] transition-all"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Go to Investment Management</span>
                </Link>
              </div>
            ) : (
              filteredParents.map((parent) => {
                const isExpanded = !!expandedParentIds[parent.id];
                const projects = parent.projects || [];
                const hasParentSheet =
                  (parent.spreadsheet_data?.rows && parent.spreadsheet_data.rows.length > 0) ||
                  (parent.spreadsheet_data?.annual_reports && parent.spreadsheet_data.annual_reports.length > 0);
                const parentUploading = uploadingKey === `parent-${parent.id}`;

                return (
                  <div
                    key={parent.id}
                    id={`parent-card-${parent.id}`}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all hover:border-slate-300"
                  >
                    {/* Parent Group Header */}
                    <div className="p-5 bg-gradient-to-r from-slate-50/80 via-white to-blue-50/20 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Parent Info */}
                      <div className="flex items-start gap-3.5">
                        <button
                          onClick={() => toggleParentExpand(parent.id)}
                          className="mt-0.5 p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
                          title={isExpanded ? "Collapse Projects" : "Expand Projects"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#002B66]" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                              {parent.category?.name || "General Sector"}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                parent.status === "Published"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {parent.status}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              ID #{parent.id}
                            </span>
                          </div>

                          <h3
                            onClick={() => toggleParentExpand(parent.id)}
                            className="text-base font-black text-slate-900 hover:text-blue-700 transition-colors cursor-pointer flex items-center gap-2"
                          >
                            <span>{parent.name}</span>
                            <span className="text-xs font-bold text-slate-400">
                              ({projects.length} Project Location{projects.length === 1 ? "" : "s"})
                            </span>
                          </h3>

                          {/* Municipalities pills */}
                          {parent.municipalities_summary && parent.municipalities_summary.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span className="text-[10px] font-bold uppercase text-slate-400">
                                Locations:
                              </span>
                              {parent.municipalities_summary.map((muni, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="text-[10px] font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.2 rounded-md shadow-2xs"
                                >
                                  {muni}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Sector Annual Reports / Master Sheet Action & Link */}
                      <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                        {/* Parent Sheet Status Pill */}
                        {hasParentSheet ? (
                          <div className="text-right mr-1 hidden sm:block">
                            <span
                              className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 block truncate max-w-[160px]"
                              title={parent.spreadsheet_data?.filename || "Sector Sheet Uploaded"}
                            >
                              {parent.spreadsheet_data?.filename || "Annual Reports Attached"}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {parent.spreadsheet_data?.rows?.length || 0} rows / {parent.spreadsheet_data?.annual_reports?.length || 1} report(s)
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg mr-1 hidden sm:inline-block">
                            No Sector Sheet
                          </span>
                        )}

                        {/* Upload Sector Sheet Button */}
                        <label
                          title="Upload Sector Master Spreadsheet (.xlsx, .xls, .csv)"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-xs shadow-2xs transition-all cursor-pointer shrink-0"
                        >
                          {parentUploading ? (
                            <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          <span>{hasParentSheet ? "Replace Master Sheet" : "Upload Master Sheet"}</span>
                          <input
                            type="file"
                            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                            onChange={(e) => handleDirectUploadParent(parent, e)}
                            disabled={parentUploading}
                            className="hidden"
                          />
                        </label>

                        {/* View Sector Sheet Button */}
                        <button
                          onClick={() =>
                            setActiveSpreadsheet({
                              id: parent.id,
                              name: `${parent.name} - Sector Annual Reports`,
                              categoryName: parent.category?.name,
                              locationName: "Capiz Sector-wide",
                              isParentOpportunity: true,
                              initialYear: parent.data_year,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#002B66] hover:bg-[#003882] text-white font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Sheet</span>
                        </button>

                        {/* Manage in Investment Management Link */}
                        <Link
                          to={PATHS.APP.MANAGE_INVESTMENT_MANAGEMENT}
                          title="Open this group in Investment Management"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-700 rounded-lg transition-colors cursor-pointer border border-slate-200"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Collapsible Child Projects Section */}
                    {isExpanded && (
                      <div className="bg-slate-50/40 p-4 border-t border-slate-100">
                        {projects.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 text-xs rounded-xl bg-white border border-dashed border-slate-200 space-y-2">
                            <Building2 className="w-6 h-6 mx-auto text-slate-300" />
                            <p className="font-semibold text-slate-600">
                              No specific project locations added under {parent.name} yet.
                            </p>
                            <p className="text-[11px] text-slate-400">
                              You can add designated project locations (e.g. Roxas City, Panay) in Investment Management, or maintain the sector master sheet above.
                            </p>
                            <Link
                              to={PATHS.APP.MANAGE_INVESTMENT_MANAGEMENT}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 rounded-lg text-xs font-bold transition-all shadow-2xs"
                            >
                              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                              <span>Add Project Location in Investment Management</span>
                            </Link>
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                            <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Designated Project Locations ({projects.length})</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold normal-case">
                                Live Feasibility & Data Sheets
                              </span>
                            </div>

                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                                  <th className="p-3 pl-4">Project Location</th>
                                  <th className="p-3">Municipality</th>
                                  <th className="p-3">Land Area</th>
                                  <th className="p-3">Status</th>
                                  <th className="p-3 text-right pr-4">Location Data Sheet Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {projects.map((child) => {
                                  const hasChildSheet =
                                    child.spreadsheet_data?.rows &&
                                    child.spreadsheet_data.rows.length > 0;
                                  const childUploading = uploadingKey === `child-${child.id}`;

                                  return (
                                    <tr
                                      key={child.id}
                                      className="hover:bg-blue-50/30 transition-colors"
                                    >
                                      <td className="p-3 pl-4">
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-[#002B66]">
                                            <FileSpreadsheet className="w-3.5 h-3.5" />
                                          </div>
                                          <div>
                                            <span className="font-bold text-slate-900 block text-xs">
                                              {child.project_name}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                              ID #{child.id} • Child of {parent.name}
                                            </span>
                                          </div>
                                        </div>
                                      </td>

                                      <td className="p-3 text-slate-600">
                                        <div className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3 text-blue-500" />
                                          <span>{child.municipality?.name || child.location || "Capiz"}</span>
                                        </div>
                                      </td>

                                      <td className="p-3 font-bold text-slate-700">
                                        {child.land_area ? `${child.land_area} Ha` : "Flexible Lot"}
                                      </td>

                                      <td className="p-3">
                                        <span
                                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                            child.status === "Published"
                                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                              : child.status === "Closed"
                                              ? "bg-slate-100 text-slate-600 border-slate-200"
                                              : "bg-amber-50 text-amber-700 border-amber-200"
                                          }`}
                                        >
                                          {child.status}
                                        </span>
                                      </td>

                                      <td className="p-3 pr-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          {hasChildSheet ? (
                                            <div className="text-right mr-1 hidden lg:block">
                                              <span
                                                className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block truncate max-w-[130px]"
                                                title={child.spreadsheet_data?.filename || "Sheet Uploaded"}
                                              >
                                                {child.spreadsheet_data?.filename || "Uploaded"}
                                              </span>
                                              <span className="text-[9px] text-slate-400">
                                                {child.spreadsheet_data?.rows?.length || 0} records
                                              </span>
                                            </div>
                                          ) : (
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded mr-1 hidden lg:inline-block">
                                              No Sheet
                                            </span>
                                          )}

                                          {/* Direct File Upload button */}
                                          <label
                                            title="Upload Location Spreadsheet File (.xlsx, .xls, .csv)"
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-xs shadow-2xs transition-all cursor-pointer shrink-0"
                                          >
                                            {childUploading ? (
                                              <Loader2 className="w-3 h-3 text-emerald-600 animate-spin" />
                                            ) : (
                                              <Upload className="w-3 h-3 text-emerald-600" />
                                            )}
                                            <span>{hasChildSheet ? "Replace" : "Upload File"}</span>
                                            <input
                                              type="file"
                                              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                                              onChange={(e) => handleDirectUploadChild(child, e)}
                                              disabled={childUploading}
                                              className="hidden"
                                            />
                                          </label>

                                          {/* View Sheet Button */}
                                          <button
                                            onClick={() =>
                                              setActiveSpreadsheet({
                                                id: child.id,
                                                name: child.project_name,
                                                categoryName: child.category?.name || parent.category?.name,
                                                locationName: child.municipality?.name || child.location,
                                                isParentOpportunity: false,
                                              })
                                            }
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#002B66] hover:bg-[#003882] text-white font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer shrink-0"
                                          >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>View</span>
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Unassigned / Standalone Legacy Projects Section */}
            {standaloneOpportunities.length > 0 && (
              <div className="bg-amber-50/50 rounded-2xl border border-amber-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                        Unassigned / Standalone Projects ({standaloneOpportunities.length})
                      </h3>
                      <p className="text-[11px] text-amber-700">
                        These projects were created independently and are not yet linked to an Opportunity Group. You can upload spreadsheets for them or assign them to an Opportunity Group below.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsStandaloneExpanded(!isStandaloneExpanded)}
                    className="text-xs font-bold text-amber-800 hover:text-amber-900 cursor-pointer"
                  >
                    {isStandaloneExpanded ? "Collapse" : "Expand"}
                  </button>
                </div>

                {isStandaloneExpanded && (
                  <div className="bg-white rounded-xl border border-amber-200/80 overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                          <th className="p-3 pl-4">Standalone Project</th>
                          <th className="p-3">Sector</th>
                          <th className="p-3">Location</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {standaloneOpportunities.map((opp) => (
                          <tr key={opp.id} className="hover:bg-amber-50/30 transition-colors">
                            <td className="p-3 pl-4">
                              <span className="font-bold text-slate-900 block">{opp.project_name}</span>
                              <span className="text-[10px] text-slate-400">ID #{opp.id}</span>
                            </td>
                            <td className="p-3 text-slate-600 font-medium">
                              {opp.category?.name || "General"}
                            </td>
                            <td className="p-3 text-slate-600">
                              {opp.municipality?.name || opp.location || "Capiz"}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {opp.status}
                              </span>
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Assign to Parent Dropdown Toggle */}
                                {assigningChildId === opp.id ? (
                                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-blue-300 shadow-sm">
                                    <select
                                      value={selectedAssignParentId}
                                      onChange={(e) => setSelectedAssignParentId(e.target.value)}
                                      className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none font-medium"
                                    >
                                      <option value="">Select Opportunity Group...</option>
                                      {parentOpportunities.map((p) => (
                                        <option key={p.id} value={p.id}>
                                          {p.name} ({p.category?.name || "Group"})
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => handleAssignToParent(opp.id)}
                                      disabled={isAssigning || !selectedAssignParentId}
                                      className="px-2.5 py-1 bg-[#002B66] text-white text-xs font-bold rounded hover:bg-[#003882] transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                      {isAssigning ? "Moving..." : "Assign"}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setAssigningChildId(null);
                                        setSelectedAssignParentId("");
                                      }}
                                      className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setAssigningChildId(opp.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                                  >
                                    <MoveRight className="w-3 h-3" />
                                    <span>Assign to Group</span>
                                  </button>
                                )}

                                {/* Direct File Upload button */}
                                <label
                                  title="Upload Spreadsheet File"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-xs cursor-pointer shadow-2xs"
                                >
                                  {uploadingKey === `child-${opp.id}` ? (
                                    <Loader2 className="w-3 h-3 text-emerald-600 animate-spin" />
                                  ) : (
                                    <Upload className="w-3 h-3 text-emerald-600" />
                                  )}
                                  <span>Upload Sheet</span>
                                  <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={(e) => handleDirectUploadChild(opp, e)}
                                    className="hidden"
                                  />
                                </label>

                                {/* View Sheet Button */}
                                <button
                                  onClick={() =>
                                    setActiveSpreadsheet({
                                      id: opp.id,
                                      name: opp.project_name,
                                      categoryName: opp.category?.name,
                                      locationName: opp.municipality?.name || opp.location,
                                      isParentOpportunity: false,
                                    })
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#002B66] hover:bg-[#003882] text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View</span>
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
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 2: FLAT TABLE OF ALL PROJECT LOCATIONS                         */}
        {/* ========================================================================= */}
        {viewMode === "flat" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#002B66]" />
                <h2 className="text-sm font-bold text-slate-900">
                  All Synchronized Project Locations ({allChildProjects.length})
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Click any project to inspect its verified spreadsheet
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium">
                Loading synchronized investment projects...
              </div>
            ) : allChildProjects.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                <Building2 className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-600">No project locations match your filter.</p>
                <p className="text-[11px]">
                  Create new projects in Investment Management to manage their data spreadsheets.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                      <th className="p-3.5 pl-5">Project Name</th>
                      <th className="p-3.5">Opportunity Group / Sector</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Land Area</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right pr-5">Spreadsheet Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allChildProjects.map((child) => {
                      const hasSheet =
                        child.spreadsheet_data?.rows && child.spreadsheet_data.rows.length > 0;
                      const isUploading = uploadingKey === `child-${child.id}`;

                      return (
                        <tr
                          key={child.id}
                          className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                          onClick={() =>
                            setActiveSpreadsheet({
                              id: child.id,
                              name: child.project_name,
                              categoryName: child.category?.name,
                              locationName: child.municipality?.name || child.location,
                              isParentOpportunity: false,
                            })
                          }
                        >
                          <td className="p-3.5 pl-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-[#002B66] group-hover:text-white transition-colors">
                                <FileSpreadsheet className="w-4 h-4 text-[#002B66] group-hover:text-white" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors block text-xs">
                                  {child.project_name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  ID #{child.id} • Connected to Investment Management
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 font-medium text-slate-700">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-100/70 inline-block">
                              {child.parentName || "Standalone"}
                            </span>
                          </td>

                          <td className="p-3.5 text-slate-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-blue-500" />
                              <span>{child.municipality?.name || child.location || "Capiz"}</span>
                            </div>
                          </td>

                          <td className="p-3.5 font-bold text-slate-700">
                            {child.land_area ? `${child.land_area} Ha` : "Designated Lot"}
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                child.status === "Published"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : child.status === "Closed"
                                  ? "bg-slate-100 text-slate-600 border-slate-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {child.status}
                            </span>
                          </td>

                          <td className="p-3.5 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              {hasSheet ? (
                                <div className="text-right hidden xl:block mr-1">
                                  <span
                                    className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block truncate max-w-[140px]"
                                    title={child.spreadsheet_data?.filename || "Sheet Uploaded"}
                                  >
                                    {child.spreadsheet_data?.filename || "Uploaded"}
                                  </span>
                                  <span className="text-[9px] text-slate-400">
                                    {child.spreadsheet_data?.rows?.length || 0} records
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
                                {isUploading ? (
                                  <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                                ) : (
                                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                                <span>{hasSheet ? "Replace" : "Upload File"}</span>
                                <input
                                  type="file"
                                  accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                                  onChange={(e) => handleDirectUploadChild(child, e)}
                                  disabled={isUploading}
                                  className="hidden"
                                />
                              </label>

                              {/* View Sheet Button */}
                              <button
                                onClick={() =>
                                  setActiveSpreadsheet({
                                    id: child.id,
                                    name: child.project_name,
                                    categoryName: child.category?.name,
                                    locationName: child.municipality?.name || child.location,
                                    isParentOpportunity: false,
                                  })
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#002B66] hover:bg-[#003882] text-white font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer shrink-0"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Sheet</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SPREADSHEET MODAL (NON-EDITABLE UPLOAD-ONLY VIEWER)                      */}
        {/* ========================================================================= */}
        {activeSpreadsheet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-6xl h-[88vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <SpreadsheetGrid
                opportunityId={activeSpreadsheet.id}
                opportunityName={activeSpreadsheet.name}
                categoryName={activeSpreadsheet.categoryName}
                locationName={activeSpreadsheet.locationName}
                isAdmin={true}
                uploadOnly={true}
                isParentOpportunity={activeSpreadsheet.isParentOpportunity}
                initialYear={activeSpreadsheet.initialYear}
                onClose={() => setActiveSpreadsheet(null)}
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
