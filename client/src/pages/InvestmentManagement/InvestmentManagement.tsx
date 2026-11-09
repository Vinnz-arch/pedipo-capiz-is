import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/Mainlayout";
import { LoadingState } from "@/components/ui/LoadingState";
import { 
  Globe,
  Eye, 
  PlusCircle, 
  RefreshCw, 
  X, 
  UploadCloud, 
  Upload,
  Pencil, 
  Trash2, 
  AlertTriangle, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Loader2, 
  Paperclip,
  ChevronLeft,
  MapPin,
  Building2,
  Layers,
  Search,
  Database
} from "lucide-react";
import { notify } from "@/util/notify";
import { 
  OpportunityService, 
  type OpportunityData, 
  type ParentOpportunityData,
  type CategoryData,
  type OpportunityDocumentData,
  type ParentOpportunityDocumentData,
  formatDocFileSize,
  downloadAnnualReportBlob,
  downloadDocumentBlob,
  resolveAnnualReportUrl
} from "@/services/OpportunityService";
import { SpreadsheetGrid } from "@/components/spreadsheet/SpreadsheetGrid";
import { DocumentViewerModal } from "@/components/documents/DocumentViewerModal";

export const InvestmentManagement: React.FC = () => {
  // Data State
  const [parentOpportunities, setParentOpportunities] = useState<ParentOpportunityData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>("Just now");

  // Filter & Drilldown State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [activeParentView, setActiveParentView] = useState<ParentOpportunityData | null>(null);

  // Parent Modal State (Create / Edit)
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [editingParentId, setEditingParentId] = useState<number | string | null>(null);
  const [parentName, setParentName] = useState("");
  const [parentDescription, setParentDescription] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<number>(1);
  const [parentStatus, setParentStatus] = useState<"Draft" | "Published" | "Closed">("Published");
  const [isSavingParent, setIsSavingParent] = useState(false);
  const [deletingParent, setDeletingParent] = useState<ParentOpportunityData | null>(null);

  // Child Project Modal State (Create / Edit - ONLY 8 PRIMARY FIELDS)
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [editingChildId, setEditingChildId] = useState<number | string | null>(null);
  const [childParentId, setChildParentId] = useState<number | string | null>(null);

  // 8 Required Child Fields
  const [childProjectName, setChildProjectName] = useState("");
  const [childCategoryId, setChildCategoryId] = useState<number>(1);
  const [childLandArea, setChildLandArea] = useState("");
  const [childStatus, setChildStatus] = useState<"Draft" | "Published" | "Closed">("Published");
  const [childMunicipalityId, setChildMunicipalityId] = useState<number | string>("");
  const [childLocation, setChildLocation] = useState("");
  const [childDescription, setChildDescription] = useState("");
  const [childImageFile, setChildImageFile] = useState<File | null>(null);
  const [childImagePreview, setChildImagePreview] = useState<string | null>(null);
  const [isSavingChild, setIsSavingChild] = useState(false);
  const [deletingChild, setDeletingChild] = useState<OpportunityData | null>(null);

  // Child Project Full View Modal State
  const [viewingChildProject, setViewingChildProject] = useState<OpportunityData | null>(null);

  // Spreadsheet & Document Viewer Modals
  const [spreadsheetModalProject, setSpreadsheetModalProject] = useState<OpportunityData | null>(null);
  const [previewingDoc, setPreviewingDoc] = useState<OpportunityDocumentData | null>(null);

  // Overall Number of Operators and Production Modal State
  const [operatorsModalParent, setOperatorsModalParent] = useState<ParentOpportunityData | null>(null);
  const [operatorsAnnualReports, setOperatorsAnnualReports] = useState<any[]>([]);
  const [isUploadingAnnualReport, setIsUploadingAnnualReport] = useState(false);
  const [isDeletingAnnualReportId, setIsDeletingAnnualReportId] = useState<string | null>(null);
  const [operatorsDocuments, setOperatorsDocuments] = useState<ParentOpportunityDocumentData[]>([]);
  const [isUploadingOperatorsDoc, setIsUploadingOperatorsDoc] = useState(false);
  const [isDeletingOperatorsDocId, setIsDeletingOperatorsDocId] = useState<string | number | null>(null);
  const [operatorsDocTitle, setOperatorsDocTitle] = useState("");
  const [operatorsSelectedDocFile, setOperatorsSelectedDocFile] = useState<File | null>(null);
  const [previewingParentDoc, setPreviewingParentDoc] = useState<ParentOpportunityDocumentData | null>(null);

  const resolveImageUrl = (path?: string) => {
    if (!path) return "/images/seafood_hub.png";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
      return path;
    }
    return `http://localhost:8000${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await OpportunityService.getAllParents();
      if (res.categories && res.categories.length > 0) {
        setCategories(res.categories);
      }
      if (res.municipalities && res.municipalities.length > 0) {
        setMunicipalities(res.municipalities);
      }
      if (res.parent_opportunities) {
        setParentOpportunities(res.parent_opportunities);

        // Keep active drilldown parent updated with fresh children
        if (activeParentView) {
          const updatedActive = res.parent_opportunities.find(
            (p) => String(p.id) === String(activeParentView.id)
          );
          if (updatedActive) {
            setActiveParentView(updatedActive);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load parent opportunities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncPortal = async () => {
    setIsSyncing(true);
    try {
      await OpportunityService.syncPortal();
      await loadData();
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncedTime(timeStr);

      try {
        const channel = new BroadcastChannel("pedipo_portal_sync");
        channel.postMessage({ type: "SYNC_PORTAL", timestamp: new Date().toISOString() });
        channel.close();
      } catch (err) {
        console.warn("BroadcastChannel error:", err);
      }
    } catch (error) {
      console.error("Sync portal error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // -------------------------------------------------------------
  // Parent Opportunity Modals & Handlers
  // -------------------------------------------------------------
  const openCreateParentModal = () => {
    setEditingParentId(null);
    setParentName("");
    setParentDescription("");
    setParentCategoryId(categories[0]?.id || 1);
    setParentStatus("Published");
    setIsParentModalOpen(true);
  };

  const openEditParentModal = (parent: ParentOpportunityData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingParentId(parent.id);
    setParentName(parent.name);
    setParentDescription(parent.description || "");
    setParentCategoryId(parent.category_id || categories[0]?.id || 1);
    setParentStatus(parent.status);
    setIsParentModalOpen(true);
  };

  const handleSaveParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim()) return;

    setIsSavingParent(true);
    try {
      const payload = {
        name: parentName.trim(),
        description: parentDescription.trim(),
        category_id: parentCategoryId,
        status: parentStatus,
      };

      if (editingParentId) {
        await OpportunityService.updateParent(editingParentId, payload);
      } else {
        await OpportunityService.createParent(payload);
      }

      setIsParentModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Failed to save parent opportunity:", error);
    } finally {
      setIsSavingParent(false);
    }
  };

  const handleDeleteParent = async () => {
    if (!deletingParent) return;
    try {
      await OpportunityService.deleteParent(deletingParent.id);
      setDeletingParent(null);
      if (activeParentView?.id === deletingParent.id) {
        setActiveParentView(null);
      }
      await loadData();
    } catch (error) {
      console.error("Failed to delete parent opportunity:", error);
    }
  };

  // -------------------------------------------------------------
  // Child Project Modals & Handlers (Strictly 8 Fields)
  // -------------------------------------------------------------
  const openCreateChildModal = (parent: ParentOpportunityData) => {
    setEditingChildId(null);
    setChildParentId(parent.id);
    setChildProjectName("");
    setChildCategoryId(parent.category_id || categories[0]?.id || 1);
    setChildLandArea("");
    setChildStatus("Published");
    setChildMunicipalityId(municipalities[0]?.id || 1);
    setChildLocation("");
    setChildDescription("");
    setChildImageFile(null);
    setChildImagePreview(null);
    setIsChildModalOpen(true);
  };

  const openEditChildModal = (child: OpportunityData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingChildId(child.id);
    setChildParentId(child.parent_opportunity_id || activeParentView?.id || null);
    setChildProjectName(child.project_name);
    setChildCategoryId(child.category_id);
    setChildLandArea(child.land_area ? String(child.land_area) : "");
    setChildStatus(child.status);
    setChildMunicipalityId(child.municipality_id || municipalities[0]?.id || 1);
    setChildLocation(child.location || "");
    setChildDescription(child.description || "");
    setChildImageFile(null);
    setChildImagePreview(resolveImageUrl(child.image_path));
    setIsChildModalOpen(true);
  };

  const handleSaveChildProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childProjectName.trim()) return;

    setIsSavingChild(true);
    try {
      const formData = new FormData();
      formData.append("project_name", childProjectName.trim());
      formData.append("category_id", String(childCategoryId));
      if (childLandArea.trim()) {
        formData.append("land_area", childLandArea.trim());
      }
      formData.append("status", childStatus);
      if (childMunicipalityId) {
        formData.append("municipality_id", String(childMunicipalityId));
      }
      if (childLocation.trim()) {
        formData.append("location", childLocation.trim());
      }
      if (childDescription.trim()) {
        formData.append("description", childDescription.trim());
      }
      if (childImageFile) {
        formData.append("image", childImageFile);
      }

      if (editingChildId) {
        await OpportunityService.updateChildProject(editingChildId, formData);
      } else if (childParentId) {
        await OpportunityService.addChildProject(childParentId, formData);
      }

      setIsChildModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Failed to save child project:", error);
    } finally {
      setIsSavingChild(false);
    }
  };

  const handleDeleteChildProject = async () => {
    if (!deletingChild) return;
    try {
      await OpportunityService.deleteChildProject(deletingChild.id);
      setDeletingChild(null);
      if (viewingChildProject?.id === deletingChild.id) {
        setViewingChildProject(null);
      }
      await loadData();
    } catch (error) {
      console.error("Failed to delete child project:", error);
    }
  };

  // -------------------------------------------------------------
  // Overall Number of Operators & Production Handlers
  // -------------------------------------------------------------
  const openOperatorsModal = async (parent: ParentOpportunityData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    openEditParentModal(parent, e);
    setIsParentModalOpen(false);
    setOperatorsModalParent(parent);

    try {
      const res = await OpportunityService.getParentOperatorsAndProduction(parent.id);
      setOperatorsDocuments(res.documents || []);
      const reports = res.annual_reports || (res.spreadsheet_data?.annual_reports) || (
        res.spreadsheet_data?.filename ? [{
          id: 'legacy',
          filename: res.spreadsheet_data.filename,
          file_path: res.spreadsheet_data.file_path,
          file_size: res.spreadsheet_data.file_size,
          uploaded_at: res.spreadsheet_data.uploaded_at,
        }] : []
      );
      setOperatorsAnnualReports(reports);
    } catch (err) {
      console.error("Failed to load operators & production data:", err);
    }
  };

  const handleUploadAnnualReports = async (files: FileList | File[]) => {
    if (!operatorsModalParent || !files || files.length === 0) return;
    const fileArray = Array.from(files);
    const oversizedFiles = fileArray.filter((f) => f.size > 50 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      notify.error(
        "File Too Large",
        `Each annual report file must be 50MB or smaller. (${oversizedFiles.map((f) => f.name).join(", ")})`
      );
      return;
    }

    setIsUploadingAnnualReport(true);
    try {
      const res = await OpportunityService.uploadParentOperatorsSpreadsheet(
        operatorsModalParent.id,
        fileArray
      );

      const updated = res.annual_reports || (res.spreadsheet_data?.annual_reports) || [];
      setOperatorsAnnualReports(updated);
      notify.success("Annual Reports Uploaded", `Successfully uploaded ${fileArray.length} file(s).`);
      await loadData();
    } catch (error) {
      console.error("Failed to upload annual reports:", error);
      notify.error("Upload Failed", "Could not upload annual report file(s).");
    } finally {
      setIsUploadingAnnualReport(false);
    }
  };

  const handleDeleteAnnualReportFile = async (reportId: string) => {
    if (!operatorsModalParent) return;
    setIsDeletingAnnualReportId(reportId);
    try {
      const res = await OpportunityService.deleteParentOperatorsSpreadsheetFile(
        operatorsModalParent.id,
        reportId
      );
      setOperatorsAnnualReports(res.annual_reports || []);
      notify.success("File Removed", "Annual report file has been removed.");
      await loadData();
    } catch (error) {
      console.error("Failed to remove annual report file:", error);
      notify.error("Delete Failed", "Could not remove annual report file.");
    } finally {
      setIsDeletingAnnualReportId(null);
    }
  };

  const handleDownloadAnnualReportFile = async (report: any) => {
    if (!report) return;
    if (operatorsModalParent) {
      try {
        const filename = await downloadAnnualReportBlob(operatorsModalParent.id, report);
        notify.success("Download Complete", `Downloaded ${filename}`);
        return;
      } catch (err: any) {
        console.warn("Direct blob download failed, trying fallback url:", err);
        if (report.file_path) {
          const url = resolveAnnualReportUrl(operatorsModalParent.id, report);
          window.open(url, "_blank");
          return;
        }
      }
    }

    if (report.file_path) {
      const url = report.file_path.startsWith("http")
        ? report.file_path
        : `http://localhost:8000${report.file_path.startsWith("/") ? "" : "/"}${report.file_path}`;
      window.open(url, "_blank");
      return;
    }

    if (report.headers && report.headers.length > 0) {
      let csv = report.headers.map((h: string) => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";
      (report.rows || []).forEach((row: string[]) => {
        const line = report.headers
          .map((_: any, colIdx: number) => `"${(row[colIdx] || "").replace(/"/g, '""')}"`)
          .join(",");
        csv += line + "\n";
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", report.filename || "Annual_Report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleUploadOperatorsDoc = async () => {
    if (!operatorsModalParent || !operatorsSelectedDocFile || !operatorsDocTitle.trim()) return;

    if (operatorsSelectedDocFile.size > 50 * 1024 * 1024) {
      notify.error("File Too Large", "Selected document exceeds the 50MB limit.");
      return;
    }

    setIsUploadingOperatorsDoc(true);
    try {
      const formData = new FormData();
      formData.append("title", operatorsDocTitle.trim());
      formData.append("document", operatorsSelectedDocFile);

      const res = await OpportunityService.uploadParentDocument(operatorsModalParent.id, formData);
      setOperatorsDocuments(res.documents || []);
      setOperatorsDocTitle("");
      setOperatorsSelectedDocFile(null);
      const input = document.getElementById("parentDocFileInput") as HTMLInputElement;
      if (input) input.value = "";
      await loadData();
    } catch (error) {
      console.error("Failed to upload parent document:", error);
    } finally {
      setIsUploadingOperatorsDoc(false);
    }
  };

  const handleDeleteOperatorsDoc = async (docId: string | number) => {
    if (!operatorsModalParent) return;

    setIsDeletingOperatorsDocId(docId);
    try {
      const res = await OpportunityService.deleteParentDocument(operatorsModalParent.id, docId);
      setOperatorsDocuments(res.documents || []);
      await loadData();
    } catch (error) {
      console.error("Failed to delete parent document:", error);
    } finally {
      setIsDeletingOperatorsDocId(null);
    }
  };

  // -------------------------------------------------------------
  // Filtering & Computed Metrics
  // -------------------------------------------------------------
  const filteredParents = parentOpportunities.filter((parent) => {
    const matchesCategory =
      selectedCategoryFilter === "All" ||
      parent.category?.name === selectedCategoryFilter ||
      parent.name === selectedCategoryFilter;

    const matchesSearch =
      searchQuery.trim() === "" ||
      parent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (parent.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.municipalities_summary.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (parent.projects &&
        parent.projects.some(
          (p) =>
            p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.municipality?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
        ));

    return matchesCategory && matchesSearch;
  });

  const totalPublishedProjects = parentOpportunities.reduce(
    (acc, p) =>
      acc + (p.projects ? p.projects.filter((c) => c.status === "Published").length : 0),
    0
  );

  const getStatusBadge = (status: "Published" | "Draft" | "Closed") => {
    switch (status) {
      case "Published":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Published
          </span>
        );
      case "Draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
            Draft
          </span>
        );
      case "Closed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            Closed
          </span>
        );
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-12 font-sans relative">
        {/* Top Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1.5">
              <span>Registry</span>
              <span className="text-muted-foreground/50">&rsaquo;</span>
              <span className="text-primary font-bold">Investment Management</span>
              {activeParentView && (
                <>
                  <span className="text-muted-foreground/50">&rsaquo;</span>
                  <span className="text-blue-700 font-bold">{activeParentView.name}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#0B2545] tracking-tight">
              {activeParentView ? activeParentView.name : "Investment Management"}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              {activeParentView
                ? activeParentView.description || "Manage child investment projects and locations for this opportunity."
                : "Manage broader investment opportunity groups and individual municipal projects across Capiz."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {lastSyncedTime && (
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/60 px-2.5 py-1.5 rounded-xl">
                Last Synced: <strong className="text-slate-700">{lastSyncedTime}</strong>
              </span>
            )}

            {activeParentView ? (
              <>
                <button
                  onClick={() => setActiveParentView(null)}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer border border-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>All Opportunities</span>
                </button>
                <button
                  onClick={() => openCreateChildModal(activeParentView)}
                  className="flex items-center gap-2 bg-[#002B66] hover:bg-[#001D47] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Add Project</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={openCreateParentModal}
                  className="flex items-center gap-2 bg-[#002B66] hover:bg-[#001D47] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Create Opportunity</span>
                </button>
                <button 
                  onClick={handleSyncPortal}
                  disabled={isSyncing}
                  className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-70"
                >
                  <RefreshCw className={`w-4 h-4 text-slate-500 ${isSyncing ? "animate-spin text-blue-600" : ""}`} />
                  <span>{isSyncing ? "Syncing..." : "Sync Portal"}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                OPPORTUNITY GROUPS
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {parentOpportunities.length}
              </h3>
            </div>
          </div>



          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                PUBLISHED PROJECTS
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {totalPublishedProjects}
              </h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                LGUS COVERED
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {Array.from(new Set(parentOpportunities.flatMap(p => p.municipalities_summary || []))).length} / 17
              </h3>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* VIEW A: PARENT OPPORTUNITY MAIN LISTING (ONE CARD PER OPPORTUNITY) */}
        {/* ------------------------------------------------------------------- */}
        {!activeParentView && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <button
                  onClick={() => setSelectedCategoryFilter("All")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    selectedCategoryFilter === "All"
                      ? "bg-[#002B66] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                      selectedCategoryFilter === cat.name
                        ? "bg-[#002B66] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72 shrink-0">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search opportunities or locations..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Parent Opportunities Grid */}
            {isLoading ? (
              <LoadingState variant="card" message="Loading investment opportunity groups..." />
            ) : filteredParents.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                <Layers className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Opportunities Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "+ Create Opportunity" above to establish a new investment grouping.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredParents.map((parent) => (
                  <div
                    key={parent.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Parent Card Header Banner */}
                      <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                              {parent.category?.name || "Investment Sector"}
                            </span>
                            {getStatusBadge(parent.status)}
                          </div>
                          <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors mt-1">
                            {parent.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link
                            to={`/app/dataEntry?parent=${parent.id}`}
                            onClick={(e) => e.stopPropagation()}
                            title="Open in Data Entry Module"
                            className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#002B66] font-bold text-xs flex items-center gap-1.5 border border-blue-200/80 transition-all cursor-pointer shadow-2xs shrink-0"
                          >
                            <Database className="w-3.5 h-3.5 text-blue-600" />
                            <span>Data Entry</span>
                          </Link>
                          <button
                            onClick={(e) => openOperatorsModal(parent, e)}
                            title="Overview & Reports"
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-200/80 transition-all cursor-pointer shadow-2xs group/btn shrink-0"
                          >
                            <Layers className="w-3.5 h-3.5 text-emerald-600 group-hover/btn:scale-110 transition-transform" />
                            <span>Overview & Reports</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingParent(parent);
                            }}
                            title="Delete Parent Opportunity"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Parent Description */}
                      <div className="p-5 space-y-4">
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {parent.description || "Comprehensive investment opportunity portfolio in Capiz."}
                        </p>

                        {/* Projects & Land Area Pill Highlights */}
                        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                              PROJECTS / LOCATIONS
                            </span>
                            <span className="text-sm font-black text-[#002B66] mt-0.5 block">
                              {parent.projects_count || 0} Project{(parent.projects_count || 0) === 1 ? "" : "s"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                              TOTAL LAND AREA
                            </span>
                            <span className="text-sm font-black text-[#002B66] mt-0.5 block">
                              {parent.total_land_area ? `${parent.total_land_area} Ha` : "Flexible"}
                            </span>
                          </div>
                        </div>

                        {/* Municipalities Summary Pills */}
                        {parent.municipalities_summary && parent.municipalities_summary.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                              MUNICIPALITIES COVERED
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {parent.municipalities_summary.slice(0, 3).map((muni, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-2xs"
                                >
                                  {muni}
                                </span>
                              ))}
                              {parent.municipalities_summary.length > 3 && (
                                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                                  +{parent.municipalities_summary.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openCreateChildModal(parent)}
                        className="py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span>Add Project</span>
                      </button>

                      <button
                        onClick={() => setActiveParentView(parent)}
                        className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-[#002B66] to-[#003399] hover:from-[#003399] hover:to-[#002B7F] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span>View Details</span>
                        <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* VIEW B: PARENT DETAILS VIEW (PROJECTS & LOCATIONS LISTING)          */}
        {/* ------------------------------------------------------------------- */}
        {activeParentView && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Parent Summary Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    {activeParentView.category?.name || "General Sector"}
                  </span>
                  {getStatusBadge(activeParentView.status)}
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  {activeParentView.name}
                </h2>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  {activeParentView.description || "Portfolio of strategic municipal investment opportunities."}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                  <span>
                    <strong>{activeParentView.projects?.length || 0}</strong> Active Projects
                  </span>
                  <span>•</span>
                  <span>
                    <strong>{activeParentView.total_land_area || 0} Ha</strong> Total Combined Area
                  </span>
                  <span>•</span>
                  <span>
                    <strong>{activeParentView.municipalities_summary?.length || 0}</strong> Municipalities
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => openOperatorsModal(activeParentView)}
                  title="Overview & Reports"
                  className="px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-2xs group"
                >
                  <Layers className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>Overview & Reports</span>
                </button>
                <button
                  onClick={() => openCreateChildModal(activeParentView)}
                  className="px-4 py-2.5 rounded-xl bg-[#002B66] hover:bg-[#001D47] text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Add Project</span>
                </button>
              </div>
            </div>

            {/* Child Projects Grid / List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    PROJECTS / LOCATIONS
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeParentView.projects?.length || 0} Projects registered under {activeParentView.name}
                  </p>
                </div>
              </div>

              {(!activeParentView.projects || activeParentView.projects.length === 0) ? (
                <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                  <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700">No Child Projects Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Click "+ Add Project" above to create the first municipal investment facility under this opportunity.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeParentView.projects.map((child) => (
                    <div
                      key={child.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Project Image Banner */}
                        <div 
                          onClick={() => setViewingChildProject(child)}
                          className="w-full h-44 relative overflow-hidden bg-slate-100 cursor-pointer"
                        >
                          <img
                            src={resolveImageUrl(child.image_path)}
                            alt={child.project_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg shadow-xs">
                            {child.municipality?.name || child.location || "Capiz"}
                          </div>
                          <div className="absolute top-3 right-3">
                            {getStatusBadge(child.status)}
                          </div>
                          {child.documents && child.documents.length > 0 && (
                            <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Paperclip className="w-3 h-3 text-blue-300" />
                              <span>{child.documents.length} Docs</span>
                            </div>
                          )}
                        </div>

                        {/* Project Details */}
                        <div className="p-5 space-y-3">
                          <div>
                            <h4 
                              onClick={() => setViewingChildProject(child)}
                              className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors cursor-pointer text-sm line-clamp-1"
                              title={child.project_name}
                            >
                              {child.project_name}
                            </h4>
                            <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                              {child.location || child.municipality?.name || "Roxas City, Capiz"}
                            </p>
                          </div>

                          <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-xl border border-blue-100/60 text-xs">
                            <span className="text-slate-500 font-bold">Land Area</span>
                            <span className="font-extrabold text-[#002B66]">
                              {child.land_area ? `${child.land_area} Ha` : "Flexible Lot"}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {child.description || "No specific project description added yet."}
                          </p>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-1.5">
                        <button
                          onClick={() => setViewingChildProject(child)}
                          className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={(e) => openEditChildModal(child, e)}
                          title="Edit Project"
                          className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingChild(child);
                          }}
                          title="Delete Project"
                          className="p-2 rounded-xl bg-white hover:bg-red-50 border border-slate-200 text-slate-600 hover:text-red-600 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MODAL 1: CREATE / EDIT PARENT OPPORTUNITY                          */}
        {/* ------------------------------------------------------------------- */}
        {isParentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#002B66] flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {editingParentId ? "Edit Opportunity Group" : "Create Opportunity Group"}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Parent entity that encompasses multiple municipal projects
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsParentModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveParent} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Opportunity Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="e.g. Aquaculture, Renewable Energy, Tourism, Agro-Industrial"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sector Category
                    </label>
                    <select
                      value={parentCategoryId}
                      onChange={(e) => setParentCategoryId(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      value={parentStatus}
                      onChange={(e) => setParentStatus(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    General Description
                  </label>
                  <textarea
                    rows={3}
                    value={parentDescription}
                    onChange={(e) => setParentDescription(e.target.value)}
                    placeholder="e.g. Aquaculture investment opportunities across multiple municipalities in Capiz."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsParentModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingParent}
                    className="px-5 py-2.5 rounded-xl bg-[#002B66] hover:bg-[#001D47] text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-70"
                  >
                    {isSavingParent ? "Saving..." : editingParentId ? "Update Group" : "Create Opportunity"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MODAL 2: ADD / EDIT CHILD PROJECT (STRICTLY 8 PRIMARY FIELDS)       */}
        {/* ------------------------------------------------------------------- */}
        {isChildModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#002B66] flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {editingChildId ? "Edit Child Project" : "Add Child Project"}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Location-specific project belonging to {activeParentView?.name || "Parent Opportunity"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChildModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Strictly 8 Fields */}
              <form onSubmit={handleSaveChildProject} className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* 1. Project Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={childProjectName}
                    onChange={(e) => setChildProjectName(e.target.value)}
                    placeholder="e.g. Roxas City Aquaculture Association"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                  />
                </div>

                {/* 2. Category & 3. Land Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={childCategoryId}
                      onChange={(e) => setChildCategoryId(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Land Area (Hectares)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={childLandArea}
                      onChange={(e) => setChildLandArea(e.target.value)}
                      placeholder="e.g. 1610.85"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                    />
                  </div>
                </div>

                {/* 4. Status & 5. Municipality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      value={childStatus}
                      onChange={(e) => setChildStatus(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Municipality <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={childMunicipalityId}
                      onChange={(e) => setChildMunicipalityId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                    >
                      {municipalities.map((muni) => (
                        <option key={muni.id} value={muni.id}>
                          {muni.name} ({muni.class})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 6. Specific Location / Site Details (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specific Location / Site Details <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={childLocation}
                    onChange={(e) => setChildLocation(e.target.value)}
                    placeholder="e.g. Pueblo de Panay Township, Barangay San Vicente, Ferrer Avenue, Roxas City"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                  />
                </div>

                {/* 7. Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={childDescription}
                    onChange={(e) => setChildDescription(e.target.value)}
                    placeholder="Detailed description of this specific child investment project, infrastructure, or facility..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                  />
                </div>

                {/* 8. Upload Image */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Project Image
                  </label>
                  <div className="flex items-center gap-4">
                    {childImagePreview ? (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 relative shrink-0">
                        <img
                          src={childImagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setChildImageFile(file);
                            setChildImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WEBP up to 5MB.</p>
                    </div>
                  </div>
                </div>

                {/* Form Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsChildModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingChild}
                    className="px-5 py-2.5 rounded-xl bg-[#002B66] hover:bg-[#001D47] text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-70"
                  >
                    {isSavingChild ? "Saving..." : editingChildId ? "Save Project" : "Save Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MODAL 3: VIEW CHILD PROJECT DETAILS (FULL 8 FIELDS + DOCS + SHEET) */}
        {/* ------------------------------------------------------------------- */}
        {viewingChildProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    {viewingChildProject.category?.name || "Project"}
                  </span>
                  {getStatusBadge(viewingChildProject.status)}
                </div>
                <button
                  onClick={() => setViewingChildProject(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Image Banner */}
                <div className="w-full h-52 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100">
                  <img
                    src={resolveImageUrl(viewingChildProject.image_path)}
                    alt={viewingChildProject.project_name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {viewingChildProject.project_name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{viewingChildProject.location || viewingChildProject.municipality?.name || "Roxas City, Capiz"}</span>
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      LAND AREA
                    </span>
                    <span className="text-sm font-black text-[#002B66] mt-0.5 block">
                      {viewingChildProject.land_area ? `${viewingChildProject.land_area} Ha` : "Flexible"}
                    </span>
                  </div>

                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      MUNICIPALITY
                    </span>
                    <span className="text-sm font-black text-[#002B66] mt-0.5 block truncate">
                      {viewingChildProject.municipality?.name || "Capiz"}
                    </span>
                  </div>

                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      CATEGORY
                    </span>
                    <span className="text-sm font-black text-[#002B66] mt-0.5 block truncate">
                      {viewingChildProject.category?.name || "Sector"}
                    </span>
                  </div>
                </div>

                {/* Specific Location Details */}
                {viewingChildProject.location && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-700 block">
                      Specific Location / Site Details
                    </span>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                      {viewingChildProject.location}
                    </p>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">
                    Description
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {viewingChildProject.description || "No specific project description available."}
                  </p>
                </div>

                {/* Overall Sector Documents (Inherited from Parent Opportunity) */}
                {(() => {
                  const parentGroup = activeParentView || parentOpportunities.find(
                    p => String(p.id) === String(viewingChildProject.parent_opportunity_id) ||
                         p.projects?.some(c => String(c.id) === String(viewingChildProject.id))
                  );
                  const parentDocs = parentGroup?.documents || [];
                  if (parentDocs.length === 0) return null;
                  return (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">
                        Overall Sector Documents ({parentDocs.length})
                      </span>
                      <div className="space-y-1.5">
                        {parentDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="font-bold text-slate-800 truncate">{doc.title}</span>
                              <span className="text-[10px] text-slate-400">({formatDocFileSize(doc.file_size)})</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewingDoc(doc as any)}
                                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-blue-700 hover:bg-blue-50 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadDocumentBlob(doc)}
                                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                                title="Download Document"
                              >
                                <Download className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSpreadsheetModalProject(viewingChildProject)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>View Spreadsheet</span>
                  </button>
                  <Link
                    to={`/app/dataEntry?opp=${viewingChildProject.id}`}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#002B66] border border-blue-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>Open in Data Entry</span>
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const child = viewingChildProject;
                      setViewingChildProject(null);
                      openEditChildModal(child);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingChildProject(null)}
                    className="px-4 py-2 rounded-xl bg-[#002B66] text-white font-bold text-xs hover:bg-[#001D47] cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MODAL 4: DELETE PARENT CONFIRMATION                                */}
        {/* ------------------------------------------------------------------- */}
        {deletingParent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Remove Opportunity Group
                  </h3>
                  <p className="text-xs text-slate-400">
                    Are you sure you want to remove this group?
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                You are about to remove <strong>"{deletingParent.name}"</strong>. Any child projects inside will be safely unlinked rather than deleted.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeletingParent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteParent}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Confirm Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MODAL 6: DELETE CHILD PROJECT CONFIRMATION                         */}
        {/* ------------------------------------------------------------------- */}
        {deletingChild && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Delete Child Project
                  </h3>
                  <p className="text-xs text-slate-400">
                    Permanently delete this project record
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete <strong>"{deletingChild.project_name}"</strong>? This action cannot be undone.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeletingChild(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteChildProject}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* SPREADSHEET MODAL (DATA ENTRY MODULE INTEGRATION)                   */}
        {/* ------------------------------------------------------------------- */}
        {spreadsheetModalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden w-full max-w-6xl h-[90vh]">
              <SpreadsheetGrid
                opportunityId={spreadsheetModalProject.id}
                opportunityName={spreadsheetModalProject.project_name}
                categoryName={spreadsheetModalProject.category?.name || "Priority Project"}
                locationName={spreadsheetModalProject.location || spreadsheetModalProject.municipality?.name || "Capiz"}
                sheetTitle="Feasibility & Project Data Sheet"
                isAdmin={true}
                uploadOnly={true}
                onClose={() => setSpreadsheetModalProject(null)}
                onSaved={() => {
                  loadData();
                }}
              />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* MODAL: OVERALL NUMBER OF OPERATORS AND PRODUCTION                  */}
        {/* ------------------------------------------------------------------- */}
        {operatorsModalParent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden w-full max-w-6xl h-[92vh]">
              {/* Modal Top Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-[#002B66] to-[#003882] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300 font-bold shrink-0">
                    <Layers className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full">
                        {operatorsModalParent.category?.name || "Priority Sector"}
                      </span>
                      <span className="text-xs text-blue-200 font-medium">
                        • {operatorsModalParent.projects_count || 0} Project Locations
                      </span>
                    </div>
                    <h2 className="text-base font-extrabold tracking-tight mt-0.5">
                      Overview & Reports: {operatorsModalParent.name}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/app/dataEntry?parent=${operatorsModalParent.id}`}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5"
                    title="Open in Data Entry Module"
                  >
                    <Database className="w-3.5 h-3.5 text-blue-200" />
                    <span>Open in Data Entry</span>
                  </Link>
                  <button
                    onClick={() => setOperatorsModalParent(null)}
                    className="p-2 bg-white/10 hover:bg-rose-500/80 border border-white/20 rounded-xl text-white transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Container without Tabs */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
                {/* 1. Annual Reports (Multiple File Uploads - NO Year Data Created - NO Spreadsheet Grid) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-900">Annual Reports</h3>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {operatorsAnnualReports.length} {operatorsAnnualReports.length === 1 ? "File" : "Files"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Upload official annual operators and production spreadsheet reports (.xlsx, .xls, .csv) for {operatorsModalParent.name}.
                      </p>
                    </div>

                    {/* Upload Files Button in Header */}
                    <div>
                      <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs">
                        {isUploadingAnnualReport ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>Upload Annual Reports</span>
                        <input
                          type="file"
                          multiple
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleUploadAnnualReports(e.target.files);
                            }
                            e.target.value = "";
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Uploaded Annual Reports Grid */}
                  {operatorsAnnualReports.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {operatorsAnnualReports.map((report, idx) => (
                        <div
                          key={report.id || report.filename || idx}
                          className="p-4 bg-emerald-50/30 border border-emerald-200/70 rounded-2xl flex items-center justify-between gap-3 hover:border-emerald-300 transition-all shadow-2xs group"
                        >
                          <div className="flex items-start gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                              <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <div className="overflow-hidden">
                              <h4
                                className="text-xs font-bold text-slate-900 truncate"
                                title={report.filename}
                              >
                                {report.filename}
                              </h4>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {report.file_size ? formatDocFileSize(report.file_size) : "Spreadsheet File"}
                                {report.uploaded_at && (
                                  <span> • {new Date(report.uploaded_at).toLocaleDateString()}</span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Download Button */}
                            <button
                              type="button"
                              onClick={() => handleDownloadAnnualReportFile(report)}
                              title="Download Report File"
                              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-white rounded-xl transition cursor-pointer shadow-2xs border border-transparent hover:border-slate-200"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            {/* Delete File Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteAnnualReportFile(report.id || report.filename)}
                              disabled={isDeletingAnnualReportId === (report.id || report.filename)}
                              title="Delete Report File"
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer disabled:opacity-50"
                            >
                              {isDeletingAnnualReportId === (report.id || report.filename) ? (
                                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Clean File Upload Dropzone when empty */
                    <div className="p-8 bg-slate-50/70 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:border-emerald-400 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">No Annual Reports Uploaded Yet</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 max-w-md">
                          Select one or multiple Excel spreadsheets (.xlsx, .xls) or CSV files containing the annual operators and production metrics.
                        </p>
                      </div>

                      <label className="mt-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-2 transition-all">
                        {isUploadingAnnualReport ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>Browse & Upload Multiple Sheet Files</span>
                        <input
                          type="file"
                          multiple
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleUploadAnnualReports(e.target.files);
                            }
                            e.target.value = "";
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* 2. Overall Documents */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-blue-600" />
                      <span>Overall Documents ({operatorsDocuments.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Provincial sector studies, feasibility reports, and baseline documentation inherited by all project locations.
                    </p>
                  </div>

                  {/* Upload Box */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-blue-600" />
                        <span>Upload Overall Sector Document / Feasibility Report</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Attach provincial census, sector masterplan, feasibility study, or production statistics (PDF, DOCX, XLSX, max 50MB).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Document Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={operatorsDocTitle}
                          onChange={(e) => setOperatorsDocTitle(e.target.value)}
                          placeholder="e.g. 2025 Capiz Aquaculture Annual Production Report"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Select Document File <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="parentDocFileInput"
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
                          onChange={(e) => setOperatorsSelectedDocFile(e.target.files?.[0] || null)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleUploadOperatorsDoc}
                        disabled={isUploadingOperatorsDoc || !operatorsDocTitle.trim() || !operatorsSelectedDocFile}
                        className="px-4 py-2 bg-[#002B66] hover:bg-[#001D47] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingOperatorsDoc ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        <span>Upload Document</span>
                      </button>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Attached Documents ({operatorsDocuments.length})
                    </h4>

                    {operatorsDocuments.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-xs font-semibold">No overall documents attached yet.</p>
                        <p className="text-[11px] text-slate-400">Upload reports above to make them accessible for sector profiling.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {operatorsDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl shadow-2xs hover:border-blue-200 transition-all flex items-start justify-between gap-3 group"
                          >
                            <div className="flex items-start gap-3 overflow-hidden">
                              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="overflow-hidden">
                                <h5 className="text-xs font-bold text-slate-800 truncate" title={doc.title}>
                                  {doc.title}
                                </h5>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                  {doc.file_name} • {formatDocFileSize(doc.file_size)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewingParentDoc(doc)}
                                title="View Document"
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadDocumentBlob(doc)}
                                title="Download Document"
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteOperatorsDoc(doc.id)}
                                disabled={isDeletingOperatorsDocId === doc.id}
                                title="Delete Document"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                {isDeletingOperatorsDocId === doc.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Group Profile */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Pencil className="w-4 h-4 text-indigo-600" />
                      <span>Group Profile</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure high-level sectoral metadata, classification, and status for this opportunity group.
                    </p>
                  </div>

                  <div className="max-w-2xl space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Opportunity Group Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="e.g. Aquaculture"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#002B66]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Sector Category
                      </label>
                      <select
                        value={parentCategoryId}
                        onChange={(e) => setParentCategoryId(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#002B66]"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Status
                      </label>
                      <select
                        value={parentStatus}
                        onChange={(e) => setParentStatus(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#002B66]"
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={parentDescription}
                        onChange={(e) => setParentDescription(e.target.value)}
                        placeholder="High-level description of this sector opportunity group..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#002B66]"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleSaveParent}
                        disabled={isSavingParent}
                        className="px-5 py-2.5 bg-[#002B66] hover:bg-[#001D47] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {isSavingParent ? "Updating..." : "Save Group Profile"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* IN-BROWSER DOCUMENT VIEWER MODAL (DOCX, PDF, IMAGES)                */}
        {/* ------------------------------------------------------------------- */}
        {previewingDoc && (
          <DocumentViewerModal
            document={previewingDoc}
            onClose={() => setPreviewingDoc(null)}
          />
        )}

        {previewingParentDoc && (
          <DocumentViewerModal
            document={previewingParentDoc}
            onClose={() => setPreviewingParentDoc(null)}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default InvestmentManagement;
