import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/Mainlayout";
import { 
  Search, 
  RefreshCw, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Eye, 
  Trash2, 
  X, 
  Send,
  AlertTriangle,
  FileText,
  FolderOpen,
  Briefcase,
  Layers
} from "lucide-react";
import { InquiryService, type InquiryData } from "@/services/InquiryService";
import { MsmeRequestsSection } from "./MsmeRequestsSection";
import { downloadFileDirectly } from "@/util/fileDownload";
import { LoadingState } from "@/components/ui/LoadingState";

export const ManageInquiries: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "msme" ? "msme" : "inquiries";

  const [inquiries, setInquiries] = useState<InquiryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"inquiries" | "msme">(initialTab);

  // Review Drawer / Modal State
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryData | null>(null);
  const [reviewStatus, setReviewStatus] = useState<InquiryData["status"]>("Pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [isSavingReview, setIsSavingReview] = useState(false);

  // Delete Modal State
  const [deletingInquiry, setDeletingInquiry] = useState<InquiryData | null>(null);

  // Helper to format inquiry ID into dynamic request number format: #IPS-YYYY-XXX
  const getRequestNumber = (item: InquiryData) => {
    const date = item.created_at ? new Date(item.created_at) : new Date();
    const year = date.getFullYear();
    const paddedId = String(item.id).padStart(3, "0");
    return `#IPS-${year}-${paddedId}`;
  };

  const loadInquiries = async () => {
    setIsLoading(true);
    try {
      const res = await InquiryService.getAll();
      if (res.inquiries) {
        setInquiries(res.inquiries);
      }
    } catch (error) {
      console.error("Failed to load inquiries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  // Sync tab with URL search parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "msme") {
      setActiveTab("msme");
    } else if (tab === "inquiries" || searchParams.get("type") === "inquiry") {
      setActiveTab("inquiries");
    }
  }, [searchParams]);

  // Open review modal if inquiry ID is provided in query params
  useEffect(() => {
    const id = searchParams.get("id");
    const tab = searchParams.get("tab");
    if (id && tab !== "msme" && inquiries.length > 0) {
      const match = inquiries.find((i) => String(i.id) === String(id));
      if (match) {
        openReviewModal(match);
      }
    }
  }, [searchParams, inquiries]);

  const openReviewModal = (inquiry: InquiryData) => {
    setSelectedInquiry(inquiry);
    // Normalize status to one of the workflow step values
    const normalizedStatus =
      inquiry.status === "Submitted"
        ? "Pending"
        : inquiry.status === "Approved" || inquiry.status === "Responded"
        ? "Completed"
        : inquiry.status;
    setReviewStatus(normalizedStatus);
    setAdminNotes(inquiry.admin_notes || "");
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    setIsSavingReview(true);
    try {
      const res = await InquiryService.updateReview(selectedInquiry.id, {
        status: reviewStatus,
        admin_notes: adminNotes.trim() || undefined,
      });

      setInquiries((prev) =>
        prev.map((item) => (item.id === selectedInquiry.id ? res.inquiry : item))
      );
      setSelectedInquiry(null);
    } catch (error) {
      console.error("Failed to update inquiry review:", error);
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deletingInquiry) return;

    try {
      await InquiryService.delete(deletingInquiry.id);
      setInquiries((prev) => prev.filter((item) => item.id !== deletingInquiry.id));
    } catch (error) {
      console.error("Failed to delete inquiry:", error);
    } finally {
      setDeletingInquiry(null);
    }
  };

  // Status Badge Helper directly aligned with Advance Workflow Status steps
  const getStatusBadge = (status: InquiryData["status"]) => {
    switch (status) {
      case "Pending":
      case "Submitted":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Step 1: Submit & Verify
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Step 2: LEDIP Review
          </span>
        );
      case "Endorsed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            Step 3: ISD Endorsement
          </span>
        );
      case "Assistance Identified":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
            Step 4: Assistance ID
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
            Step 5: Action Plan
          </span>
        );
      case "Completed":
      case "Approved":
      case "Responded":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Step 6: Completion
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            {status || "Pending"}
          </span>
        );
    }
  };

  // Helper to parse and render structured inquiry Markdown content
  // Helper to parse and render structured inquiry content from columns or markdown fallback
  const renderInquiryContent = (inquiry: InquiryData) => {
    // If the columns exist, render them directly!
    if (inquiry.contact_number || inquiry.address || inquiry.subject || inquiry.purpose) {
      return (
        <div className="space-y-4">
          {/* Investor Info Section */}
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Investor Information</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Representative Name</p>
                <p className="text-xs font-semibold text-slate-800">{inquiry.investor_name}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Company Name</p>
                <p className="text-xs font-semibold text-slate-800">{inquiry.company || "Not provided"}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Number</p>
                <p className="text-xs font-semibold text-slate-800">{inquiry.contact_number || "Not provided"}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                <p className="text-xs font-semibold text-slate-800">{inquiry.email}</p>
              </div>
              <div className="space-y-0.5 sm:col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Address</p>
                <p className="text-xs font-semibold text-slate-800 whitespace-pre-line">{inquiry.address || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Request Information Section */}
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Request Information</span>
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Subject of Inquiry</p>
                <p className="text-xs font-semibold text-slate-800">{inquiry.subject || "Not specified"}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Purpose of Inquiry</p>
                <p className="text-xs font-semibold text-[#002B66]">{inquiry.purpose || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Message</p>
                <p className="text-xs text-slate-700 italic bg-white p-3 rounded-lg border border-slate-200/60 whitespace-pre-line leading-relaxed">
                  {inquiry.message}
                </p>
              </div>
            </div>
          </div>

          {/* Attached Documents Section */}
          {(inquiry.letter_of_intent || inquiry.supporting_documents) && (
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attached Documents</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                {inquiry.letter_of_intent && (
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Letter of Intent</p>
                    <button 
                      type="button"
                      onClick={() => downloadFileDirectly(inquiry.letter_of_intent, `LOI_${inquiry.investor_name.trim().replace(/\s+/g, '_')}.pdf`)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Download LOI</span>
                    </button>
                  </div>
                )}
                {inquiry.supporting_documents && (
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Supporting Documents</p>
                    <button 
                      type="button"
                      onClick={() => downloadFileDirectly(inquiry.supporting_documents, `Supporting_Docs_${inquiry.investor_name.trim().replace(/\s+/g, '_')}.pdf`)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Download Documents</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Markdown legacy parser check
    const message = inquiry.message;
    if (message.includes("### Investor Information")) {
      const sections = message.split("### ");
      
      const getListItems = (sectionText: string) => {
        const lines = sectionText.split("\n");
        return lines
          .map(line => line.trim())
          .filter(line => line.startsWith("- **"))
          .map(line => {
            const match = line.match(/^-\s+\*\*(.*?):\*\*\s+(.*)$/);
            if (match) {
              return { label: match[1], value: match[2] };
            }
            return null;
          })
          .filter((item): item is { label: string; value: string } => item !== null);
      };

      const getOpportunityDescription = (sectionText: string) => {
        const parts = sectionText.split("- **Description / Message:**");
        if (parts.length > 1) {
          return parts[1].trim();
        }
        return "";
      };

      let investorInfo: { label: string; value: string }[] = [];
      let opportunityDetails: { label: string; value: string }[] = [];
      let attachedDocs: { label: string; value: string }[] = [];
      let opportunityDesc = "";

      sections.forEach(sec => {
        if (sec.startsWith("Investor Information")) {
          investorInfo = getListItems(sec);
        } else if (sec.startsWith("Opportunity Details")) {
          opportunityDetails = getListItems(sec);
          opportunityDesc = getOpportunityDescription(sec);
        } else if (sec.startsWith("Attached Documents")) {
          attachedDocs = getListItems(sec);
        }
      });

      return (
        <div className="space-y-4">
          {/* Investor Info Section */}
          {investorInfo.length > 0 && (
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Investor Information</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                {investorInfo.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</p>
                    <p className="text-xs font-semibold text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunity Details Section */}
          {(opportunityDetails.length > 0 || opportunityDesc) && (
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Opportunity Details</span>
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                {opportunityDetails.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {opportunityDetails.map((item, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</p>
                        <p className="text-xs font-semibold text-slate-800">{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}
                {opportunityDesc && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Description / Message</p>
                    <p className="text-xs text-slate-700 italic bg-white p-3 rounded-lg border border-slate-200/60 whitespace-pre-line leading-relaxed">
                      {opportunityDesc}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attached Documents Section */}
          {attachedDocs.length > 0 && (
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attached Documents</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                {attachedDocs.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</p>
                    <p className="text-xs font-semibold text-[#002B66]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Legacy fallback
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed font-normal text-left whitespace-pre-line">
        "{message}"
      </div>
    );
  };

  // Workflow Filter Tabs matching Advance Workflow Status
  const WORKFLOW_FILTER_TABS = [
    { label: "All", value: "All" },
    { label: "Step 1: Verify", value: "Pending" },
    { label: "Active Pipeline", value: "Pipeline" },
    { label: "Step 2: Review", value: "Under Review" },
    { label: "Step 3: Endorsed", value: "Endorsed" },
    { label: "Step 4: Assistance", value: "Assistance Identified" },
    { label: "Step 5: Processing", value: "Processing" },
    { label: "Step 6: Completed", value: "Completed" },
    { label: "Rejected", value: "Rejected" },
  ];

  // Filter Logic
  const filteredInquiries = inquiries.filter((item) => {
    let matchesStatus = statusFilter === "All";
    if (!matchesStatus) {
      if (statusFilter === "Pending") {
        matchesStatus = item.status === "Pending" || item.status === "Submitted";
      } else if (statusFilter === "Pipeline") {
        matchesStatus = [
          "Under Review",
          "Endorsed",
          "Assistance Identified",
          "Processing",
        ].includes(item.status);
      } else if (statusFilter === "Completed") {
        matchesStatus =
          item.status === "Completed" || item.status === "Approved" || item.status === "Responded";
      } else {
        matchesStatus = item.status === statusFilter;
      }
    }

    const matchesSearch =
      getRequestNumber(item).toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.investor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.company && item.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.opportunity?.project_name &&
        item.opportunity.project_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <MainLayout>
      <div className="space-y-6 pb-12 font-sans relative">
        {/* Top Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1.5">
              <span>Registry</span>
              <span className="text-muted-foreground/50">&rsaquo;</span>
              <span className="text-primary font-bold">Inquiry Management</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#0B2545] tracking-tight">
              Inquiry Management Registry
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Official administrative review workspace for investor inquiries, proposals, and feasibility requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadInquiries}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
              <span>Refresh Registry</span>
            </button>
          </div>
        </div>

        {/* Tab Picker */}
        <div className="border-b border-slate-200 flex gap-6">
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`pb-3 px-1 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "inquiries"
                ? "border-[#002B66] text-[#002B66]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Investment Inquiries ({inquiries.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("msme")}
            className={`pb-3 px-1 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "msme"
                ? "border-[#002B66] text-[#002B66]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>MSME Assistance Requests</span>
          </button>
        </div>

        {activeTab === "msme" ? (
          <MsmeRequestsSection />
        ) : (
          <>
            {/* 4 Executive Metric Pipeline Cards (Clickable Quick-Filters) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Inquiries */}
              <div
                onClick={() => setStatusFilter("All")}
                className={`bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all cursor-pointer border ${
                  statusFilter === "All"
                    ? "border-[#002B66] ring-2 ring-[#002B66]/15 shadow-md bg-blue-50/20"
                    : "border-slate-200/80 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      TOTAL INQUIRIES
                    </p>
                    <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                      {inquiries.length}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      All-time submissions
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Action Required / Pending Verification */}
              <div
                onClick={() => setStatusFilter("Pending")}
                className={`bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all cursor-pointer border ${
                  statusFilter === "Pending"
                    ? "border-amber-500 ring-2 ring-amber-500/15 shadow-md bg-amber-50/20"
                    : "border-slate-200/80 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        ACTION REQUIRED
                      </p>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 uppercase">
                        Step 1
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-amber-600 mt-0.5">
                      {inquiries.filter((i) => i.status === "Pending" || i.status === "Submitted").length}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Awaiting verification
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: In Active Pipeline */}
              <div
                onClick={() => setStatusFilter("Pipeline")}
                className={`bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all cursor-pointer border ${
                  statusFilter === "Pipeline"
                    ? "border-indigo-500 ring-2 ring-indigo-500/15 shadow-md bg-indigo-50/20"
                    : "border-slate-200/80 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        ACTIVE PIPELINE
                      </p>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 uppercase">
                        Steps 2–5
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-indigo-600 mt-0.5">
                      {inquiries.filter((i) =>
                        ["Under Review", "Endorsed", "Assistance Identified", "Processing"].includes(
                          i.status
                        )
                      ).length}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      In evaluation & planning
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4: Resolved & Completed */}
              <div
                onClick={() => setStatusFilter("Completed")}
                className={`bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all cursor-pointer border ${
                  statusFilter === "Completed"
                    ? "border-emerald-500 ring-2 ring-emerald-500/15 shadow-md bg-emerald-50/20"
                    : "border-slate-200/80 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        RESOLVED / COMPLETED
                      </p>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase">
                        Step 6
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">
                      {inquiries.filter((i) =>
                        i.status === "Completed" || i.status === "Approved" || i.status === "Responded"
                      ).length}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Officially endorsed & closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Table & Controls Section */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                {/* Header Controls: Status Filters & Search Box */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40">
                  {/* Status Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                    {WORKFLOW_FILTER_TABS.map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => setStatusFilter(tab.value)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          statusFilter === tab.value
                            ? "bg-[#002B66] text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Field */}
                  <div className="relative w-full md:w-72 shrink-0">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search investor, email, or project..."
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                    />
                  </div>
                </div>

                {/* Inquiries Registry Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-3.5">REQUEST #</th>
                        <th className="px-6 py-3.5">INVESTOR & ENTITY</th>
                        <th className="px-4 py-3.5 max-w-[190px]">CONTACT EMAIL</th>
                        <th className="px-4 py-3.5 max-w-[260px]">TARGET OPPORTUNITY</th>
                        <th className="px-4 py-3.5">DATE SUBMITTED</th>
                        <th className="px-4 py-3.5">WORKFLOW STATUS</th>
                        <th className="px-4 py-3.5 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {isLoading ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                            <LoadingState message="Loading inquiry registry..." className="py-6" />
                          </td>
                        </tr>
                      ) : filteredInquiries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                            No inquiries found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredInquiries.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                            onClick={() => openReviewModal(item)}
                          >
                            {/* Request Number */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-[#002B66] group-hover:underline">
                              {getRequestNumber(item)}
                            </td>

                            {/* Investor Name & Entity */}
                            <td className="px-6 py-4">
                              <div>
                                <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {item.investor_name}
                                </h4>
                                <p className="text-xs text-slate-400 font-medium">
                                  {item.company || "Individual Investor"}
                                </p>
                              </div>
                            </td>

                            {/* Email */}
                            <td
                              className="px-4 py-4 text-slate-600 font-medium text-xs truncate max-w-[190px]"
                              title={item.email}
                            >
                              {item.email}
                            </td>

                            {/* Opportunity */}
                            <td className="px-4 py-4 max-w-[260px]">
                              <span
                                title={item.opportunity?.project_name || "General Opportunity"}
                                className="inline-block bg-blue-50 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-blue-100 leading-snug line-clamp-2 break-words"
                              >
                                {item.opportunity?.project_name || "General Opportunity"}
                              </span>
                            </td>

                            {/* Date Submitted */}
                            <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">
                              {item.created_at
                                ? new Date(item.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "Recent"}
                            </td>

                            {/* Review Status */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              {getStatusBadge(item.status)}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-4 text-right whitespace-nowrap">
                              <div
                                className="flex items-center justify-end gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => openReviewModal(item)}
                                  title="Official Review"
                                  className="px-3 py-1.5 bg-[#002B66] text-white hover:bg-[#001D47] rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Review</span>
                                </button>
                                <button
                                  onClick={() => setDeletingInquiry(item)}
                                  title="Delete Inquiry"
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Official Review Modal */}
            {selectedInquiry && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
                  {/* Modal Header */}
                  <div className="bg-[#002B66] text-white px-6 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Official Administrative Review</h3>
                      <p className="text-xs text-blue-200 mt-0.5">
                        Request {getRequestNumber(selectedInquiry)} &bull; Received from{" "}
                        <span className="font-semibold text-white">{selectedInquiry.investor_name}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedInquiry(null)}
                      className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form Body */}
                  <form onSubmit={handleSaveReview} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 space-y-5 overflow-y-auto flex-1">
                      {/* Target Project Header */}
                      <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Target Opportunity Project
                          </span>
                          <h4 className="text-base font-bold text-[#002B66] mt-0.5">
                            {selectedInquiry.opportunity?.project_name || "General Investment Inquiry"}
                          </h4>
                          {selectedInquiry.opportunity?.location && (
                            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                              Location / Municipality: {selectedInquiry.opportunity.location}
                            </span>
                          )}
                        </div>
                        {selectedInquiry.opportunity?.category && (
                          <span className="bg-white text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                            {selectedInquiry.opportunity.category.name}
                          </span>
                        )}
                      </div>

                      {/* Request Information Details */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-700 block text-left">
                          Request Information Details
                        </span>
                        {renderInquiryContent(selectedInquiry)}
                      </div>

                      <hr className="border-slate-100" />

                      {/* Official Review Action Controls */}
                      <div className="space-y-4 pt-1">
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                          Official Decision & Action
                        </h4>

                        {/* Status Selection */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Advance Workflow Status</label>
                          <select
                            value={reviewStatus}
                            onChange={(e) => setReviewStatus(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                          >
                            <option value="Pending">Step 1: Submit & Verify</option>
                            <option value="Under Review">Step 2: LEDIP Officer Review</option>
                            <option value="Endorsed">Step 3: ISD Endorsement</option>
                            <option value="Assistance Identified">Step 4: Assistance Identification</option>
                            <option value="Processing">Step 5: Action Plan</option>
                            <option value="Completed">Step 6: Completion</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>

                        {/* Official Notes / Response */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Administrative Notes & Response Record
                          </label>
                          <textarea
                            rows={3}
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Log internal assessment details, meeting schedules, or official email responses..."
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedInquiry(null)}
                        className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingReview}
                        className="bg-[#002B66] hover:bg-[#001D47] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSavingReview ? "Saving Decision..." : "Save Review Decision"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingInquiry && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-6 space-y-4">
                  <div className="flex items-center gap-3 text-red-600">
                    <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Delete Inquiry</h3>
                      <p className="text-xs text-slate-500">Confirm inquiry removal</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Are you sure you want to delete the inquiry from <strong className="text-slate-900">{deletingInquiry.investor_name}</strong>? This action cannot be undone.
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeletingInquiry(null)}
                      className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteConfirmed}
                      className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ManageInquiries;
