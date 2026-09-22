import React, { useState, useEffect } from "react";
import ClientMainLayout from "@/components/client-portal/ClientMainLayout";
import { 
  Building2, 
  Search, 
  MapPin, 
  Send, 
  X,
  Info,
  ArrowUpRight,
  RefreshCw,
  Check,
  ArrowLeft,
  ArrowRight,
  FileText,
  FolderOpen,
  Upload,
  Trash2,
  MessageSquare,
  FileDown,
  FileSpreadsheet,
  Paperclip,
  Download,
  Eye,
  ChevronLeft,
  Layers
} from "lucide-react";
import { notify } from "@/util/notify";
import { InquiryService } from "@/services/InquiryService";
import { InquiriesSection } from "./InquiriesSection";
import { 
  exportOpportunitiesToPdf, 
  exportSingleOpportunityPdf 
} from "@/util/opportunitiesPdfExport";
import { SpreadsheetGrid } from "@/components/spreadsheet/SpreadsheetGrid";
import { DocumentViewerModal } from "@/components/documents/DocumentViewerModal";
import { 
  OpportunityService,
  type OpportunityDocumentData,
  type ParentOpportunityDocumentData,
  type ParentOpportunityData,
  type OpportunityData,
  type CategoryData,
  formatDocFileSize,
  resolveDocUrl 
} from "@/services/OpportunityService";

export const InvestorPortal: React.FC = () => {
  const [parentOpportunities, setParentOpportunities] = useState<ParentOpportunityData[]>([]);
  const [activeParentView, setActiveParentView] = useState<ParentOpportunityData | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"opportunities" | "inquiries">("opportunities");

  // Inquiry Modal State & Wizard
  const [inquiryModalProject, setInquiryModalProject] = useState<OpportunityData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Investor Info
  const [investorName, setInvestorName] = useState("");
  const [investorEmail, setInvestorEmail] = useState("");
  const [investorCompany, setInvestorCompany] = useState("");
  const [investorPhone, setInvestorPhone] = useState("");
  const [investorAddress, setInvestorAddress] = useState("");

  // Step 2: Opportunity Details
  const [investorSubject, setInvestorSubject] = useState("");
  const [inquiryPurpose, setInquiryPurpose] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");

  // Step 3: Document Uploads (Simulated in local state)
  const [letterOfIntentFile, setLetterOfIntentFile] = useState<File | null>(null);
  const [supportingDocsFile, setSupportingDocsFile] = useState<File | null>(null);

  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [viewingSpreadsheetOpp, setViewingSpreadsheetOpp] = useState<OpportunityData | null>(null);
  const [viewingDetailsOpp, setViewingDetailsOpp] = useState<OpportunityData | null>(null);
  const [previewingDoc, setPreviewingDoc] = useState<OpportunityDocumentData | ParentOpportunityDocumentData | null>(null);

  // Overall Number of Operators and Production Modal State for Parent Opportunities
  const [viewingParentOperators, setViewingParentOperators] = useState<ParentOpportunityData | null>(null);
  const [parentOperatorsTab, setParentOperatorsTab] = useState<"annual_reports" | "documents">("annual_reports");
  const [parentOperatorsDocList, setParentOperatorsDocList] = useState<ParentOpportunityDocumentData[]>([]);
  const [parentAnnualReports, setParentAnnualReports] = useState<any[]>([]);
  const [isLoadingParentOperators, setIsLoadingParentOperators] = useState<boolean>(false);

  const openParentOperatorsModal = async (parent: ParentOpportunityData) => {
    setViewingParentOperators(parent);
    setParentOperatorsTab("annual_reports");
    setParentOperatorsDocList(parent.documents || []);
    setParentAnnualReports([]);
    setIsLoadingParentOperators(true);
    try {
      const res = await OpportunityService.getParentOperatorsAndProduction(parent.id);
      if (res) {
        if (res.documents) {
          setParentOperatorsDocList(res.documents);
        }
        const reports = res.annual_reports || (res.spreadsheet_data?.annual_reports) || (
          res.spreadsheet_data?.filename ? [{
            id: 'legacy',
            filename: res.spreadsheet_data.filename,
            file_path: res.spreadsheet_data.file_path,
            file_size: res.spreadsheet_data.file_size,
            uploaded_at: res.spreadsheet_data.uploaded_at,
          }] : []
        );
        setParentAnnualReports(reports);
      }
    } catch (err) {
      console.error("Failed to load operators & production for parent:", err);
    } finally {
      setIsLoadingParentOperators(false);
    }
  };

  const handleExportPdf = () => {
    if (filteredOpportunities.length === 0) {
      notify.warning("No Opportunities", "There are no opportunities to export with current filters.");
      return;
    }
    setIsExportingPdf(true);
    try {
      exportOpportunitiesToPdf(filteredOpportunities, {
        category: selectedCategory,
        search: searchQuery
      });
      notify.success("PDF Exported", "Capiz Investment Opportunities Catalog downloaded successfully.");
    } catch (error) {
      console.error("PDF export error:", error);
      notify.error("Export Failed", "Could not generate PDF catalog. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadSingleFactSheet = (opp: OpportunityData) => {
    try {
      exportSingleOpportunityPdf(opp);
      notify.success("Fact Sheet Downloaded", `Downloaded fact sheet for ${opp.project_name}.`);
    } catch (error) {
      console.error("Single PDF export error:", error);
      notify.error("Export Failed", "Could not generate project fact sheet.");
    }
  };

  const getParentForOpportunity = (opp: OpportunityData | null): ParentOpportunityData | undefined => {
    if (!opp) return undefined;
    if (activeParentView && (
      String(activeParentView.id) === String(opp.parent_opportunity_id) ||
      activeParentView.projects?.some((child) => String(child.id) === String(opp.id))
    )) {
      return activeParentView;
    }
    return parentOpportunities.find(
      (p) => String(p.id) === String(opp.parent_opportunity_id) ||
             p.projects?.some((child) => String(child.id) === String(opp.id))
    );
  };

  const resolveImageUrl = (path?: string) => {
    if (!path) return "/images/seafood_hub.png";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
      return path;
    }
    return `http://localhost:8000${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const loadPublishedOpportunities = async () => {
    setIsLoading(true);
    try {
      const res = await OpportunityService.getPublicParents();
      if (res.parent_opportunities) {
        setParentOpportunities(res.parent_opportunities);
        const allChildren = res.parent_opportunities.flatMap((p) => p.projects || []);
        setOpportunities(allChildren);

        if (activeParentView) {
          const updated = res.parent_opportunities.find(
            (p) => String(p.id) === String(activeParentView.id)
          );
          if (updated) setActiveParentView(updated);
        }
      }
      if (res.categories) {
        setCategories(res.categories);
      }
    } catch (error) {
      console.error("Failed to load investor portal opportunities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPublishedOpportunities();

    // Listen for real-time Sync Portal broadcasts from Admin Portal
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("pedipo_portal_sync");
      channel.onmessage = (event) => {
        if (event.data?.type === "SYNC_PORTAL") {
          loadPublishedOpportunities();
          notify.info("Portal Refreshed", "Latest investment opportunities synchronized from Admin.");
        }
      };
    } catch (err) {
      console.warn("BroadcastChannel error:", err);
    }

    const handleFocus = () => {
      loadPublishedOpportunities();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const openInquiryModal = (opp: OpportunityData) => {
    setInquiryModalProject(opp);
    setCurrentStep(1);
    const clientUser = JSON.parse(localStorage.getItem("client_user") || "{}");
    setInvestorName(clientUser.fullname || "");
    setInvestorEmail(clientUser.email || "");
    setInvestorCompany("");
    setInvestorPhone("");
    setInvestorAddress("");
    setInvestorSubject(`Inquiry on ${opp.project_name}`);
    setInquiryPurpose("Partners, Suppliers & Sites");
    setInquiryMessage(`Hello, I am interested in exploring investment opportunities for ${opp.project_name}. Please send further project proposals and feasibility data.`);
    setLetterOfIntentFile(null);
    setSupportingDocsFile(null);
  };

  const isStepValid = (stepNum: number) => {
    if (stepNum === 1) {
      return (
        investorName.trim().length > 0 &&
        investorEmail.trim().length > 0 &&
        investorEmail.includes("@") &&
        investorPhone.trim().length > 0 &&
        investorAddress.trim().length > 0
      );
    }
    if (stepNum === 2) {
      return (
        investorSubject.trim().length > 0 &&
        inquiryPurpose.trim().length > 0 &&
        inquiryMessage.trim().length > 0
      );
    }
    // Step 3 (documents) is optional
    return true;
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      return;
    }
    if (!isStepValid(1) || !isStepValid(2)) {
      notify.error("Validation Error", "Please fill in all required fields before submitting.");
      return;
    }

    setIsSubmittingInquiry(true);
    try {
      const formData = new FormData();
      if (inquiryModalProject?.id) {
        formData.append("opportunity_id", String(inquiryModalProject.id));
      }
      formData.append("investor_name", investorName.trim());
      formData.append("email", investorEmail.trim());
      if (investorCompany.trim()) {
        formData.append("company", investorCompany.trim());
      }
      formData.append("contact_number", investorPhone.trim());
      formData.append("address", investorAddress.trim());
      formData.append("subject", investorSubject.trim());
      formData.append("purpose", inquiryPurpose);
      formData.append("message", inquiryMessage.trim());

      if (letterOfIntentFile) {
        formData.append("letter_of_intent", letterOfIntentFile);
      }
      if (supportingDocsFile) {
        formData.append("supporting_documents", supportingDocsFile);
      }

      const res = await InquiryService.submit(formData);
      
      const date = res.inquiry.created_at ? new Date(res.inquiry.created_at) : new Date();
      const year = date.getFullYear();
      const paddedId = String(res.inquiry.id).padStart(3, "0");
      const requestNum = `#IPS-${year}-${paddedId}`;
      
      notify.success("Inquiry Submitted", `Investment inquiry submitted successfully! Reference: ${requestNum}`);
      setInquiryModalProject(null);
    } catch (error) {
      console.error("Failed to submit inquiry:", error);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  // Filter Logic for Parent Opportunities
  const filteredParents = parentOpportunities.filter((parent) => {
    const matchesCategory =
      selectedCategory === "All" ||
      parent.category?.name === selectedCategory ||
      parent.name === selectedCategory;

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

  // Filter Logic for Child Projects (when drilled into a parent)
  const filteredChildProjects = (activeParentView?.projects || []).filter((child) => {
    const matchesCategory =
      selectedCategory === "All" ||
      child.category?.name === selectedCategory;

    const matchesSearch =
      searchQuery.trim() === "" ||
      child.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (child.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (child.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (child.municipality?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Flat list for PDF catalog export
  const filteredOpportunities = opportunities.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category?.name === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.municipality?.name && item.municipality.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <ClientMainLayout>
      <div className="space-y-8 pb-12 font-sans text-left">
        {/* Title Header */}
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-black text-[#002B66] tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#002B66]" />
            <span>Capiz Opportunities & Inquiries</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse high-yield investment programs, verify local economic profiles, and track submitted letters of intent.
          </p>
        </div>

        {/* Tab Picker */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("opportunities")}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "opportunities"
                ? "border-[#002B66] text-[#002B66]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Browse Opportunities</span>
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "inquiries"
                ? "border-[#002B66] text-[#002B66]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>My Inquiries</span>
          </button>
        </div>

        {activeTab === "opportunities" ? (
          <>
            {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === "All"
                  ? "bg-[#002B66] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.name
                    ? "bg-[#002B66] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box & Refresh */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search investment projects..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
              />
            </div>
            <button
              onClick={loadPublishedOpportunities}
              disabled={isLoading}
              title="Refresh Portal Listings"
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer shrink-0 border border-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isLoading || filteredOpportunities.length === 0 || isExportingPdf}
              title="Export Opportunities Catalog to Official PDF"
              className="flex items-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-[#002B66] to-[#003399] hover:from-[#003399] hover:to-[#002B7F] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs active:scale-95 disabled:opacity-50"
            >
              <FileDown className={`w-4 h-4 ${isExportingPdf ? "animate-bounce" : ""}`} />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>

        {/* Opportunities / Parent Groups Grid */}
        {isLoading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 font-medium">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
            <span>Loading investment opportunity portfolio...</span>
          </div>
        ) : activeParentView ? (
          /* Drilldown View: Child Projects belonging to Active Parent Opportunity */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Active Parent Header Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    {activeParentView.category?.name || "Priority Sector"}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {activeParentView.projects?.length || 0} Project Locations in Capiz
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {activeParentView.name}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeParentView.description || "Portfolio of verified investment locations in Capiz."}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 pt-1">
                  <span>
                    Total Combined Area: <strong>{activeParentView.total_land_area || 0} Ha</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Municipalities: <strong>{activeParentView.municipalities_summary?.join(", ") || "Capiz"}</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
                <button
                  onClick={() => openParentOperatorsModal(activeParentView)}
                  className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-2xs group"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>Annual Reports</span>
                </button>
                <button
                  onClick={() => setActiveParentView(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>All Opportunities</span>
                </button>
              </div>
            </div>

            {/* Child Projects Grid */}
            {filteredChildProjects.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Projects Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No projects under {activeParentView.name} match your search or filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChildProjects.map((opp) => (
                  <div
                    key={opp.id}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Header with Municipality Badge */}
                      <div 
                        onClick={() => setViewingDetailsOpp(opp)}
                        className="w-full h-48 relative overflow-hidden bg-slate-100 cursor-pointer"
                      >
                        <img
                          src={resolveImageUrl(opp.image_path)}
                          alt={opp.project_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-[#002B66]/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
                          {opp.municipality?.name || opp.location || "Capiz"}
                        </div>
                        {(() => {
                          const parent = activeParentView || getParentForOpportunity(opp);
                          const parentDocs = parent?.documents || [];
                          if (parentDocs.length === 0) return null;
                          return (
                            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                              <Paperclip className="w-3 h-3 text-blue-300" />
                              <span>{parentDocs.length} Doc{parentDocs.length > 1 ? "s" : ""}</span>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Card Content */}
                      <div className="p-6 space-y-4">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            <span>{opp.municipality?.name || opp.location || "Roxas City, Capiz"}</span>
                          </div>
                          <h3 
                            onClick={() => setViewingDetailsOpp(opp)}
                            className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-1"
                            title={opp.project_name}
                          >
                            {opp.project_name}
                          </h3>
                        </div>

                        {/* Key Project Metrics */}
                        <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/60">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              LAND AREA
                            </span>
                            <span className="text-base font-extrabold text-[#002B66]">
                              {opp.land_area ? `${opp.land_area} Ha` : "Designated Lot"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              CATEGORY
                            </span>
                            <span className="text-sm font-extrabold text-[#002B66] truncate block">
                              {opp.category?.name || "Priority"}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {opp.description || opp.incentive_package || "No detailed description provided."}
                        </p>
                      </div>
                    </div>

                    {/* View Details & Documents Button */}
                    <div className="px-6 pb-3">
                      <button
                        onClick={() => setViewingDetailsOpp(opp)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-200 text-[#002B66] text-xs font-bold transition-all flex items-center justify-between cursor-pointer group/details"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Project Overview & Documents</span>
                        </span>
                        {(() => {
                          const parent = activeParentView || getParentForOpportunity(opp);
                          const parentDocs = parent?.documents || [];
                          return parentDocs.length > 0 ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              {parentDocs.length} File{parentDocs.length > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/details:translate-x-0.5 transition-transform" />
                          );
                        })()}
                      </button>
                    </div>

                    {/* Card Footer / Actions */}
                    <div className="p-6 pt-0 flex items-center gap-2">
                      <button
                        onClick={() => openInquiryModal(opp)}
                        className="flex-1 relative overflow-hidden group/btn bg-gradient-to-r from-[#002B66] to-[#003399] hover:from-[#003399] hover:to-[#002B7F] text-white py-3 px-3 rounded-xl font-extrabold text-xs shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="relative z-10">Inquire Now</span>
                        <ArrowUpRight className="w-4 h-4 relative z-10 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </button>
                      <button
                        onClick={() => setViewingSpreadsheetOpp(opp)}
                        title="View Verified Project Data Sheet"
                        className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 rounded-xl transition-all cursor-pointer border border-emerald-200 shrink-0 flex items-center gap-1.5 font-bold text-xs"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span className="hidden sm:inline">Data Sheet</span>
                      </button>
                      <button
                        onClick={() => handleDownloadSingleFactSheet(opp)}
                        title="Download Project Fact Sheet (PDF)"
                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#002B66] rounded-xl transition-all cursor-pointer border border-slate-200 shrink-0"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : filteredParents.length === 0 ? (
          /* Empty Parents State */
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Opportunities Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no published opportunities matching your search criteria. Check back soon for synchronized updates.
            </p>
          </div>
        ) : (
          /* Top-Level Catalog: Parent Opportunities (One card per investment opportunity) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParents.map((parent) => (
              <div
                key={parent.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-blue-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header Badges */}
                  <div className="p-6 pb-0 flex items-center justify-between gap-3">
                    <span className="bg-[#002B66] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-xs tracking-wider">
                      {parent.category?.name || "Priority Sector"}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>{parent.projects_count || 0} Project{(parent.projects_count || 0) === 1 ? "" : "s"}</span>
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 
                        onClick={() => setActiveParentView(parent)}
                        className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {parent.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {parent.description || "Portfolio of strategic municipal investment opportunities in Capiz."}
                      </p>
                    </div>

                    {/* Metric Pair */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/60">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          PROJECTS / LOCATIONS
                        </span>
                        <span className="text-base font-extrabold text-[#002B66]">
                          {parent.projects_count || 0} Locations
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          TOTAL LAND AREA
                        </span>
                        <span className="text-sm font-extrabold text-[#002B66] truncate block">
                          {parent.total_land_area ? `${parent.total_land_area} Ha` : "Flexible"}
                        </span>
                      </div>
                    </div>

                    {/* Municipalities Summary Tags */}
                    {parent.municipalities_summary && parent.municipalities_summary.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          MUNICIPALITIES COVERED
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {parent.municipalities_summary.slice(0, 3).map((muni, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg"
                            >
                              {muni}
                            </span>
                          ))}
                          {parent.municipalities_summary.length > 3 && (
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                              +{parent.municipalities_summary.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-6 pt-0 space-y-2">
                  <button
                    onClick={() => openParentOperatorsModal(parent)}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group/ops"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 group-hover/ops:scale-110 transition-transform" />
                    <span>Annual Reports</span>
                  </button>
                  <button
                    onClick={() => setActiveParentView(parent)}
                    className="w-full bg-gradient-to-r from-[#002B66] to-[#003399] hover:from-[#003399] hover:to-[#002B7F] text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-between cursor-pointer group/btn"
                  >
                    <span>View Opportunities ({parent.projects_count || 0})</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    ) : (
      <InquiriesSection />
    )}

        {/* Investment Inquiry Wizard Modal */}
        {inquiryModalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col transition-all">
              {/* Wizard Header */}
              <div className="bg-slate-50/80 border-b border-slate-200/80 px-6 py-4 flex flex-col relative">
                <button
                  type="button"
                  onClick={() => setInquiryModalProject(null)}
                  className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-slate-800">Investment Inquiry Wizard</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Step-by-step registration for the PEDIPO Investment Registry.
                  </p>
                </div>

                {/* Progress Stepper Bar */}
                <div className="relative flex items-center justify-between w-full max-w-xl mx-auto mt-6 mb-2">
                  <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -translate-y-1/2" />
                  <div 
                    className="absolute left-0 top-1/2 h-0.5 bg-[#002B66] -translate-y-1/2 transition-all duration-300" 
                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                  />

                  {[
                    { step: 1, label: "Investor Info" },
                    { step: 2, label: "Request Information" },
                    { step: 3, label: "Upload" },
                    { step: 4, label: "Review" }
                  ].map((item) => {
                    const isCompleted = currentStep > item.step;
                    const isActive = currentStep === item.step;

                    return (
                      <div key={item.step} className="relative z-10 flex flex-col items-center">
                        <button
                          type="button"
                          disabled={item.step > currentStep && !isStepValid(currentStep)}
                          onClick={() => {
                            if (item.step < currentStep || isStepValid(currentStep)) {
                              setCurrentStep(item.step);
                            }
                          }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 cursor-pointer ${
                            isCompleted 
                              ? "bg-[#002B66] border-[#002B66] text-white" 
                              : isActive 
                                ? "bg-[#002B66] border-[#002B66] text-white shadow-md shadow-[#002B66]/25" 
                                : "bg-slate-50 border-slate-200 text-slate-400"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-4 h-4 text-white stroke-[3px]" />
                          ) : (
                            <span>{item.step}</span>
                          )}
                        </button>
                        <span 
                          className={`text-[10px] font-bold mt-1.5 transition-all duration-300 ${
                            isActive || isCompleted ? "text-[#002B66]" : "text-slate-400"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleInquirySubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {/* Step 1: Investor Info */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <span className="bg-blue-50 text-[#002B66] font-bold text-xs px-2.5 py-1 rounded-md">Step 1</span>
                        <h4 className="text-sm font-bold text-slate-800">Investor Information</h4>
                      </div>
                      
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={investorName}
                          onChange={(e) => setInvestorName(e.target.value)}
                          placeholder="Juan Dela Cruz"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Company Name (Optional)</label>
                          <input
                            type="text"
                            value={investorCompany}
                            onChange={(e) => setInvestorCompany(e.target.value)}
                            placeholder="Example Corporation"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Contact Number <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={investorPhone}
                            onChange={(e) => setInvestorPhone(e.target.value)}
                            placeholder="+63 9XX XXX XXXX"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-700">Email Address <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          required
                          value={investorEmail}
                          onChange={(e) => setInvestorEmail(e.target.value)}
                          placeholder="juan@example.com"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-700">Address <span className="text-red-500">*</span></label>
                        <textarea
                          rows={3}
                          required
                          value={investorAddress}
                          onChange={(e) => setInvestorAddress(e.target.value)}
                          placeholder="Street, City, Province, Zip Code"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Opportunity Details */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <span className="bg-blue-50 text-[#002B66] font-bold text-xs px-2.5 py-1 rounded-md">Step 2</span>
                        <h4 className="text-sm font-bold text-slate-800">Request Information</h4>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-700">Subject of Inquiry <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={investorSubject}
                          onChange={(e) => setInvestorSubject(e.target.value)}
                          placeholder="e.g. Partnership Request for Processing Hub"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-700">Purpose of Inquiry <span className="text-red-500">*</span></label>
                        <select
                          value={inquiryPurpose}
                          onChange={(e) => setInquiryPurpose(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                        >
                          <option value="Licenses & Permits">Licenses & Permits</option>
                          <option value="Partners, Suppliers & Sites">Partners, Suppliers & Sites</option>
                          <option value="Manpower & Services">Manpower & Services</option>
                          <option value="Business Concerns">Business Concerns</option>
                          <option value="Other Requests">Other Requests</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-700">Message <span className="text-red-500">*</span></label>
                        <textarea
                          rows={4}
                          required
                          value={inquiryMessage}
                          onChange={(e) => setInquiryMessage(e.target.value)}
                          placeholder="Brief message detailing your inquiry..."
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Document Upload */}
                  {currentStep === 3 && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <span className="bg-blue-50 text-[#002B66] font-bold text-xs px-2.5 py-1 rounded-md">Step 3</span>
                        <h4 className="text-sm font-bold text-slate-800">Document Upload</h4>
                      </div>

                      {/* Letter of Intent */}
                      <div className="space-y-2 text-left">
                        <label className="text-xs font-bold text-slate-700 block">Letter of Intent</label>
                        {letterOfIntentFile ? (
                          <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                            <div className="flex items-center gap-3">
                              <FileText className="w-8 h-8 text-[#002B66]" />
                              <div className="text-left">
                                <p className="text-xs font-bold text-slate-800 truncate max-w-[240px] md:max-w-[320px]">{letterOfIntentFile.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{(letterOfIntentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setLetterOfIntentFile(null)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label 
                            htmlFor="loi-file"
                            className="flex items-center justify-between p-4 border-2 border-dashed border-slate-200 hover:border-[#002B66] rounded-xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/10 transition-all group"
                          >
                            <input 
                              id="loi-file"
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setLetterOfIntentFile(e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                            <div className="flex items-center gap-3.5">
                              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100/60 transition-colors">
                                <FileText className="w-6 h-6 text-[#002B66]" />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-bold text-slate-800 group-hover:text-[#002B66] transition-colors">Letter of Intent</p>
                                <p className="text-[10px] text-slate-400 font-medium">Formal signed letter (PDF, Max 10MB)</p>
                              </div>
                            </div>
                            <div className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg border border-slate-200/80">
                              <Upload className="w-4 h-4 text-slate-600" />
                            </div>
                          </label>
                        )}
                      </div>

                      {/* Supporting Documents */}
                      <div className="space-y-2 text-left">
                        <label className="text-xs font-bold text-slate-700 block">Supporting Documents</label>
                        {supportingDocsFile ? (
                          <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                            <div className="flex items-center gap-3">
                              <FolderOpen className="w-8 h-8 text-[#002B66]" />
                              <div className="text-left">
                                <p className="text-xs font-bold text-slate-800 truncate max-w-[240px] md:max-w-[320px]">{supportingDocsFile.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{(supportingDocsFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setSupportingDocsFile(null)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label 
                            htmlFor="supporting-file"
                            className="flex items-center justify-between p-4 border-2 border-dashed border-slate-200 hover:border-[#002B66] rounded-xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/10 transition-all group"
                          >
                            <input 
                              id="supporting-file"
                              type="file"
                              accept=".pdf,.zip,.rar"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setSupportingDocsFile(e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                            <div className="flex items-center gap-3.5">
                              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100/60 transition-colors">
                                <FolderOpen className="w-6 h-6 text-[#002B66]" />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-bold text-slate-800 group-hover:text-[#002B66] transition-colors">Supporting Documents</p>
                                <p className="text-[10px] text-slate-400 font-medium">Permits, IDs, etc (ZIP/PDF, Max 25MB)</p>
                              </div>
                            </div>
                            <div className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg border border-slate-200/80">
                              <Upload className="w-4 h-4 text-slate-600" />
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Review your Inquiry */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <span className="bg-blue-50 text-[#002B66] font-bold text-xs px-2.5 py-1 rounded-md">Step 4</span>
                        <h4 className="text-sm font-bold text-slate-800">Review your Inquiry</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
                        {/* Investor Info Panel */}
                        <div className="space-y-3.5 border-r border-slate-200/80 pr-4 text-left">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">INVESTOR INFO</span>
                          <div>
                            <p className="font-extrabold text-slate-800 text-sm">{investorName}</p>
                            <p className="text-slate-500 font-medium mt-0.5">{investorCompany || "No company provided"}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-400 text-[10px] uppercase">Contact Number</p>
                            <p className="font-semibold text-slate-700">{investorPhone}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-400 text-[10px] uppercase">Email Address</p>
                            <p className="font-semibold text-slate-700">{investorEmail}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-400 text-[10px] uppercase">Address</p>
                            <p className="font-semibold text-slate-700 whitespace-pre-line leading-relaxed">{investorAddress}</p>
                          </div>
                        </div>

                        {/* Investment Details Panel */}
                        <div className="space-y-4 text-left">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">INVESTMENT DETAILS</span>
                          <div>
                            <p className="font-semibold text-slate-400 text-[10px] uppercase">Subject of Inquiry</p>
                            <p className="font-extrabold text-slate-800 text-xs">{investorSubject}</p>
                          </div>

                          <div>
                            <p className="font-semibold text-slate-400 text-[10px] uppercase">Purpose of Inquiry</p>
                            <p className="font-extrabold text-[#002B66] text-xs leading-relaxed">{inquiryPurpose}</p>
                          </div>

                          <div>
                            <p className="font-semibold text-slate-400 text-[10px] uppercase">Message</p>
                            <p className="text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-line leading-relaxed">
                              {inquiryMessage || "No message provided."}
                            </p>
                          </div>
                          {(letterOfIntentFile || supportingDocsFile) && (
                            <div className="space-y-1.5">
                              <p className="font-semibold text-slate-400 text-[10px] uppercase">Documents</p>
                              <div className="text-[10px] font-bold space-y-1 text-[#002B66]">
                                {letterOfIntentFile && (
                                  <div className="flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>LOI: {letterOfIntentFile.name}</span>
                                  </div>
                                )}
                                {supportingDocsFile && (
                                  <div className="flex items-center gap-1.5">
                                    <FolderOpen className="w-3.5 h-3.5" />
                                    <span>Supporting: {supportingDocsFile.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Warning/Certification Bar */}
                      <div className="bg-[#002B66] border border-blue-800 rounded-xl p-3 flex items-start gap-2.5 text-xs text-white leading-relaxed text-left shadow-xs">
                        <Info className="w-4.5 h-4.5 text-blue-200 shrink-0 mt-0.5 animate-pulse" />
                        <span>
                          By submitting, you certify that all information is accurate. Process takes 3-5 business days.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-3 shrink-0">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setInquiryModalProject(null)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}

                   {currentStep < 4 ? (
                    <button
                      key="next-btn"
                      type="button"
                      disabled={!isStepValid(currentStep)}
                      onClick={() => {
                        if (isStepValid(currentStep)) {
                          setCurrentStep((prev) => prev + 1);
                        }
                      }}
                      className="bg-[#002B66] hover:bg-[#001D47] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      key="submit-btn"
                      type="submit"
                      disabled={isSubmittingInquiry}
                      className="bg-[#746006] hover:bg-[#604f05] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70 active:scale-[0.98]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingInquiry ? "Submitting Final Inquiry..." : "Submit Final Inquiry"}</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Read-Only Investor Data Spreadsheet Modal */}
        {viewingSpreadsheetOpp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden border border-slate-200 flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    {viewingSpreadsheetOpp.project_name} - Verified Project Data Sheet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official verified project metrics, site specifications, and economic indicators (Investor View-Only)
                  </p>
                </div>
                <button
                  onClick={() => setViewingSpreadsheetOpp(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden p-4">
                <SpreadsheetGrid
                  opportunityId={viewingSpreadsheetOpp.id}
                  opportunityName={viewingSpreadsheetOpp.project_name}
                  categoryName={viewingSpreadsheetOpp.category?.name || "Priority Project"}
                  locationName={viewingSpreadsheetOpp.municipality?.name || viewingSpreadsheetOpp.location || "Capiz"}
                  isAdmin={false}
                  onClose={() => setViewingSpreadsheetOpp(null)}
                />
              </div>
            </div>
          </div>
        )}
        {/* Project Details & Documents Modal */}
        {viewingDetailsOpp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#002B66]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                      {viewingDetailsOpp.project_name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>{viewingDetailsOpp.municipality?.name || viewingDetailsOpp.location || "Capiz"}</span>
                      <span>•</span>
                      <span className="font-bold text-[#002B66]">{viewingDetailsOpp.category?.name || "Priority Sector"}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDetailsOpp(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Hero Image */}
                <div className="w-full h-56 rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-100 shadow-inner">
                  <img
                    src={resolveImageUrl(viewingDetailsOpp.image_path)}
                    alt={viewingDetailsOpp.project_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4">
                    <div className="text-white">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-600/90 tracking-wider">
                        {viewingDetailsOpp.status || "Open for Investment"}
                      </span>
                      <h4 className="text-lg font-black mt-1 text-white drop-shadow-sm">
                        {viewingDetailsOpp.project_name}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Land Area
                    </span>
                    <span className="text-base font-extrabold text-[#002B66]">
                      {viewingDetailsOpp.land_area ? `${viewingDetailsOpp.land_area} Ha` : "Designated Lot"}
                    </span>
                  </div>
                  <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Municipality / LGU
                    </span>
                    <span className="text-sm font-extrabold text-[#002B66] truncate block">
                      {viewingDetailsOpp.municipality?.name || "Capiz Province"}
                    </span>
                  </div>
                  <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Priority Sector
                    </span>
                    <span className="text-sm font-extrabold text-[#002B66] truncate block">
                      {viewingDetailsOpp.category?.name || "Agri-Industrial"}
                    </span>
                  </div>
                </div>

                {/* Project Overview */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Project Overview & Strategic Scope
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    {viewingDetailsOpp.description || viewingDetailsOpp.incentive_package || "This priority investment opportunity is designated by the Provincial Economic Development and Investment Promotion Office (PEDIPO) of Capiz."}
                  </p>
                </div>

                {/* Official Documents & Downloads Section (Inherited from Parent Opportunity Overall Documents) */}
                {(() => {
                  const parent = activeParentView || getParentForOpportunity(viewingDetailsOpp);
                  const parentDocs = parent?.documents || [];
                  const parentName = parent?.name || viewingDetailsOpp.category?.name || "Priority Sector";
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                            <span>Overall Sector Documentation & Prospectus</span>
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Verified sector feasibility reports, macro production data, and masterplans for {parentName}.
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">
                          {parentDocs.length} File{parentDocs.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      {parentDocs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {parentDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-[10px] uppercase shrink-0">
                                  {doc.file_type || "PDF"}
                                </div>
                                <div className="overflow-hidden">
                                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate" title={doc.title}>
                                    {doc.title}
                                  </h5>
                                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                    {doc.file_name}
                                  </p>
                                  <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    {formatDocFileSize(doc.file_size)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setPreviewingDoc(doc as any)}
                                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#002B66] to-[#003399] hover:from-[#003399] hover:to-[#002B7F] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Document</span>
                                </button>
                                <a
                                  href={resolveDocUrl(doc.file_path, doc)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  title="Download copy"
                                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#002B66] font-bold text-xs transition-colors flex items-center justify-center cursor-pointer border border-slate-200 shrink-0"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center space-y-2">
                          <FolderOpen className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-xs font-bold text-slate-600">No Overall Documents Uploaded Yet</p>
                          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                            Official sector prospectus decks for {parentName} are currently being finalized. Inquire now to receive masterplanning documents directly from the PEDIPO team.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const opp = viewingDetailsOpp;
                      setViewingDetailsOpp(null);
                      setViewingSpreadsheetOpp(opp);
                    }}
                    className="p-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Open Data Sheet</span>
                  </button>
                  <button
                    onClick={() => handleDownloadSingleFactSheet(viewingDetailsOpp)}
                    className="p-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-slate-500" />
                    <span>Fact Sheet PDF</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingDetailsOpp(null)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const opp = viewingDetailsOpp;
                      setViewingDetailsOpp(null);
                      openInquiryModal(opp);
                    }}
                    className="bg-gradient-to-r from-[#002B66] to-[#003399] hover:from-[#003399] hover:to-[#002B7F] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Inquire Now</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overall Number of Operators and Production Modal for Investor Portal */}
        {viewingParentOperators && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] h-[850px] overflow-hidden border border-slate-200 flex flex-col">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 tracking-wider">
                        Annual Reports
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {viewingParentOperators.category?.name || "Priority Sector"}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight mt-0.5">
                      Annual Reports - {viewingParentOperators.name}
                    </h3>
                    <p className="text-xs text-slate-500 hidden sm:block">
                      Provincial annual metrics, municipal operator distribution, and verified official documentation.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingParentOperators(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-4 shrink-0">
                <button
                  onClick={() => setParentOperatorsTab("annual_reports")}
                  className={`py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
                    parentOperatorsTab === "annual_reports"
                      ? "border-[#002B66] text-[#002B66]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Annual Reports ({parentAnnualReports.length})</span>
                </button>
                <button
                  onClick={() => setParentOperatorsTab("documents")}
                  className={`py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
                    parentOperatorsTab === "documents"
                      ? "border-[#002B66] text-[#002B66]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Paperclip className="w-4 h-4" />
                  <span>Overall Documents & Attachments ({parentOperatorsDocList.length})</span>
                </button>
              </div>

              {/* Modal Tab Body */}
              <div className="flex-1 overflow-hidden p-4 sm:p-6 bg-slate-50/50">
                {parentOperatorsTab === "annual_reports" ? (
                  <div className="h-full overflow-y-auto bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>Annual Reports for {viewingParentOperators.name}</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Official annual operators and production reports released for download.
                      </p>
                    </div>

                    {isLoadingParentOperators ? (
                      <div className="p-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                        <span className="text-xs font-medium">Loading annual reports...</span>
                      </div>
                    ) : parentAnnualReports.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {parentAnnualReports.map((report, idx) => {
                          const downloadUrl = report.file_path?.startsWith("http")
                            ? report.file_path
                            : `http://localhost:8000${report.file_path?.startsWith("/") ? "" : "/"}${report.file_path || ""}`;
                          return (
                            <div
                              key={report.id || report.filename || idx}
                              className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                                  <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <div className="overflow-hidden">
                                  <h5
                                    className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate"
                                    title={report.filename}
                                  >
                                    {report.filename}
                                  </h5>
                                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                    {report.file_size ? formatDocFileSize(report.file_size) : "Spreadsheet File"}
                                  </p>
                                  {report.uploaded_at && (
                                    <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                      {new Date(report.uploaded_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="pt-2 border-t border-slate-200/60">
                                <a
                                  href={downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={report.filename}
                                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download Report</span>
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-12 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                        <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">No Annual Reports Available</p>
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                          Official annual reports and production sheets will be available for download here once uploaded.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-blue-600" />
                        <span>Verified Overall Documentation for {viewingParentOperators.name}</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Official sector studies, annual production reports, and baseline operator registries released by PEDIPO Capiz.
                      </p>
                    </div>

                    {isLoadingParentOperators ? (
                      <div className="p-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                        <span className="text-xs font-medium">Loading documents...</span>
                      </div>
                    ) : parentOperatorsDocList.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {parentOperatorsDocList.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-100/70 border border-blue-200 flex items-center justify-center text-blue-800 font-black text-xs uppercase shrink-0">
                                {doc.file_type || "PDF"}
                              </div>
                              <div className="overflow-hidden">
                                <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate" title={doc.title}>
                                  {doc.title}
                                </h5>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                  {doc.file_name}
                                </p>
                                <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                  {formatDocFileSize(doc.file_size)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                              <button
                                type="button"
                                onClick={() => setPreviewingDoc(doc)}
                                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#002B66] to-[#003399] hover:from-[#003399] hover:to-[#002B7F] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Document</span>
                              </button>
                              <a
                                href={resolveDocUrl(doc.file_path, doc)}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                title="Download copy"
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#002B66] font-bold text-xs transition-colors flex items-center justify-center cursor-pointer border border-slate-200 shrink-0"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                        <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">No Overall Documents Uploaded</p>
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                          Official sector reports and operator lists will appear here once verified by PEDIPO administrators.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <div className="text-xs text-slate-500 font-medium">
                  Source: Provincial Economic Development and Investment Promotion Office (PEDIPO)
                </div>
                <button
                  onClick={() => setViewingParentOperators(null)}
                  className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inline Document Previewer Modal (DOCX, PDF, Images) */}
        {previewingDoc && (
          <DocumentViewerModal
            document={previewingDoc}
            onClose={() => setPreviewingDoc(null)}
          />
        )}
      </div>
    </ClientMainLayout>
  );
};

export default InvestorPortal;
