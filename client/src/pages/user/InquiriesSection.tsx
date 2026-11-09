import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { InquiryService, type InquiryData } from "@/services/InquiryService";
import { LoadingState } from "@/components/ui/LoadingState";
import { downloadFileDirectly } from "@/util/fileDownload";
import { 
  MessageSquare, 
  FileText, 
  Clock, 
  AlertCircle, 
  HelpCircle, 
  Download, 
  FolderOpen,
  ChevronRight,
  MapPin,
  Search,
  CheckCircle2,
  Building2,
  Calendar,
  FileCheck2,
  Sparkles,
  ChevronDown
} from "lucide-react";

export const InquiriesSection: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [inquiries, setInquiries] = useState<InquiryData[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const res = await InquiryService.getAll();
      if (res.inquiries) {
        setInquiries(res.inquiries);
        if (res.inquiries.length > 0) {
          const targetId = searchParams.get("id") || searchParams.get("inquiry_id");
          const matched = targetId
            ? res.inquiries.find((i) => String(i.id) === String(targetId))
            : null;
          setSelectedInquiry(matched || res.inquiries[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load user inquiries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    const targetId = searchParams.get("id") || searchParams.get("inquiry_id");
    if (targetId && inquiries.length > 0) {
      const matched = inquiries.find((i) => String(i.id) === String(targetId));
      if (matched) {
        setSelectedInquiry(matched);
      }
    }
  }, [searchParams, inquiries]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
      case "Submitted":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200/80",
          dot: "bg-amber-500",
          label: status
        };
      case "Under Review":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200/80",
          dot: "bg-blue-500",
          label: "Under Review"
        };
      case "Endorsed":
      case "Assistance Identified":
      case "Processing":
        return {
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
          dot: "bg-indigo-500",
          label: status
        };
      case "Approved":
      case "Responded":
      case "Completed":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          dot: "bg-emerald-500",
          label: status === "Approved" || status === "Responded" ? "Completed" : status
        };
      case "Rejected":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200/80",
          dot: "bg-rose-500",
          label: "Declined"
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
          label: status
        };
    }
  };

  const getRequestNumber = (item: InquiryData) => {
    const date = item.created_at ? new Date(item.created_at) : new Date();
    const year = date.getFullYear();
    const paddedId = String(item.id).padStart(3, "0");
    return `#IPS-${year}-${paddedId}`;
  };

  // 6-step Citizen's Charter for Investment Inquiries
  const steps = [
    {
      num: 1,
      title: "Submit & Verify",
      description: "Verification of documents & official stamp received.",
      statusKey: "Submitted",
      time: "5 mins",
      officer: "Administrative Officer II",
    },
    {
      num: 2,
      title: "LEDIP Officer Review",
      description: "Confer the request to the LEDIP Officer together with pertinent documents for review.",
      statusKey: "Under Review",
      time: "15 mins",
      officer: "Administrative Officer II",
    },
    {
      num: 3,
      title: "ISD Endorsement",
      description: "Endorse to the Investment Services Division for appropriate action.",
      statusKey: "Endorsed",
      time: "15 mins",
      officer: "LEDIP Officer",
    },
    {
      num: 4,
      title: "Assistance Identification",
      description: "Identify requirements: licenses, business partners, manpower, or land data.",
      statusKey: "Assistance Identified",
      time: "15 mins",
      officer: "Administrative Officer II",
    },
    {
      num: 5,
      title: "Action Plan",
      description: "Execute actions & assemble project facilitation datasets.",
      statusKey: "Processing",
      time: "Turnaround varies by request scope",
      officer: "Administrative Officer II",
    },
    {
      num: 6,
      title: "Completion",
      description: "Inform requester with official provincial action & response notes.",
      statusKey: "Completed",
      time: "5 mins",
      officer: "Administrative Officer II",
    },
  ];

  const getActiveStepIndex = (status: string) => {
    switch (status) {
      case "Submitted":
      case "Pending":
        return 0;
      case "Under Review":
        return 1;
      case "Endorsed":
        return 2;
      case "Assistance Identified":
        return 3;
      case "Processing":
        return 4;
      case "Completed":
      case "Responded":
      case "Approved":
        return 5;
      default:
        return 0;
    }
  };

  // Filtered inquiries list
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesSearch = 
        (inq.opportunity?.project_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inq.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        getRequestNumber(inq).toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const isCompleted = ["Completed", "Responded", "Approved", "Rejected"].includes(inq.status);
      if (statusFilter === "ACTIVE") return !isCompleted;
      if (statusFilter === "COMPLETED") return isCompleted;
      return true;
    });
  }, [inquiries, searchQuery, statusFilter]);

  // Statistics calculation
  const totalCount = inquiries.length;
  const completedCount = inquiries.filter((i) => ["Completed", "Responded", "Approved"].includes(i.status)).length;
  const activeCount = totalCount - completedCount;

  const faqs = [
    {
      q: "What is the next step after submitting an inquiry?",
      a: "Your inquiry goes into active review under the LEDIP Citizens Charter. A BDD officer will verify the authenticity of your Letter of Intent (LOI) and gather feasibility studies, land inventories, or municipal datasets relevant to your target project."
    },
    {
      q: "How long does an inquiry review take?",
      a: "Standard investment inquiries are processed within 1 to 3 business days. Complex requests involving multi-agency coordination or custom land-use zoning checks may require inter-agency coordination. You will receive real-time updates directly on this portal."
    },
    {
      q: "Can I submit supplementary documents after submission?",
      a: "If the examining officer requests further credentials, you can provide updated files by replying to the official note or contacting the Provincial Economic Development and Investment Promotion Office directly."
    }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Metric Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6 text-[#002B66]" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Inquiries</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{totalCount}</span>
              <span className="text-xs font-semibold text-slate-400">logged</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">In Progress</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-amber-600">{activeCount}</span>
              <span className="text-xs font-semibold text-slate-400">under review</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Completed & Responded</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-emerald-600">{completedCount}</span>
              <span className="text-xs font-semibold text-slate-400">resolved</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#002B66] to-[#0A3D82] text-white rounded-2xl p-4 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">Charter Standard</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-extrabold text-white">1–3 Days</span>
              <span className="text-[11px] font-medium text-blue-200">guaranteed SLA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Inquiry Registry & FAQs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            {/* Header + Search/Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Submitted Inquiries Dashboard
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track status, official review milestones, and responses from the Investment Division.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    statusFilter === "ALL" 
                      ? "bg-white text-[#002B66] shadow-xs" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("ACTIVE")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    statusFilter === "ACTIVE" 
                      ? "bg-white text-[#002B66] shadow-xs" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Active ({activeCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("COMPLETED")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    statusFilter === "COMPLETED" 
                      ? "bg-white text-[#002B66] shadow-xs" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Completed ({completedCount})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by project name, tracking code (#IPS-...), or subject..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#002B66]/15 focus:border-[#002B66] transition-all"
              />
            </div>

            {/* List */}
            {isLoading ? (
              <LoadingState message="Loading inquiry database..." className="py-16" />
            ) : filteredInquiries.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/60">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center mb-2">
                  <MessageSquare className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-700">No Inquiries Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {searchQuery 
                    ? "No submitted inquiries matched your search criteria. Try a different keyword." 
                    : "You haven't submitted any inquiries yet. Browse the Opportunities catalog to submit a Letter of Intent."}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">
                {filteredInquiries.map((inq) => {
                  const isSelected = selectedInquiry?.id === inq.id;
                  const statusInfo = getStatusBadge(inq.status);

                  return (
                    <div
                      key={inq.id}
                      onClick={() => setSelectedInquiry(inq)}
                      className={`group p-4 border rounded-2xl cursor-pointer transition-all duration-200 text-left relative overflow-hidden ${
                        isSelected
                          ? "bg-blue-50/50 border-[#002B66] shadow-sm ring-1 ring-[#002B66]/20"
                          : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      {/* Selected Left Bar */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#002B66] rounded-r-full" />
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          {/* Ref code + Badge */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-[#002B66] tracking-wide font-mono">
                              {getRequestNumber(inq)}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide border ${statusInfo.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                              <span>{statusInfo.label}</span>
                            </span>
                            {inq.opportunity?.location && (
                              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {inq.opportunity.location}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#002B66] transition-colors truncate">
                            {inq.opportunity?.project_name || "General Investment Inquiry"}
                          </h3>

                          {/* Subject / Message Snippet */}
                          <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                            {inq.subject || inq.message || "No subject specified"}
                          </p>

                          {/* Metadata Bottom */}
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium pt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>Submitted {new Date(inq.created_at || "").toLocaleDateString()}</span>
                            </span>
                            {inq.admin_notes && (
                              <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                                <AlertCircle className="w-3 h-3" />
                                <span>Has Officer Notes</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center self-center shrink-0 pl-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                            isSelected ? "bg-[#002B66] text-white" : "bg-slate-100 text-slate-400 group-hover:text-slate-600"
                          }`}>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Citizen's Charter FAQs */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#002B66]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Frequently Asked Questions</h3>
                <p className="text-[11px] text-slate-500">Citizens charter guidelines for Investment Promotion Services (IPS)</p>
              </div>
            </div>

            <div className="space-y-2">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200/70 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-3.5 flex items-center justify-between text-left gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-extrabold text-slate-800">
                        {faq.q}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-[#002B66]" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="p-3.5 pt-1 text-xs font-medium text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Stepper & Detailed Milestone Tracker (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {selectedInquiry ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5 sticky top-6">
              {/* Target Opportunity Header Banner */}
              <div className="bg-gradient-to-br from-slate-900 via-[#002B66] to-[#0A3D82] text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/5 rounded-full pointer-events-none blur-xl" />
                
                <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-blue-200 uppercase tracking-widest">
                  <span>Target Opportunity</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-xs font-mono font-bold text-white border border-white/20">
                    {getRequestNumber(selectedInquiry)}
                  </span>
                </div>

                <h3 className="text-base font-black text-white mt-2 leading-snug">
                  {selectedInquiry.opportunity?.project_name || "General Investment Inquiry"}
                </h3>

                {selectedInquiry.opportunity?.location && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-100/90 font-medium mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                    <span>{selectedInquiry.opportunity.location}</span>
                  </div>
                )}

                {selectedInquiry.subject && (
                  <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-200/90 font-medium line-clamp-2">
                    <span className="text-blue-300 font-semibold">Subject: </span>
                    {selectedInquiry.subject}
                  </div>
                )}
              </div>

              {/* Overall Progress Indicator */}
              {(() => {
                const activeIdx = getActiveStepIndex(selectedInquiry.status);
                const isFullyDone = ["Approved", "Responded", "Completed"].includes(selectedInquiry.status);
                const progressPercent = isFullyDone 
                  ? 100 
                  : Math.round(((activeIdx + 0.5) / steps.length) * 100);

                return (
                  <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">
                        {isFullyDone ? "Processing Completed" : `Milestone ${activeIdx + 1} of ${steps.length}`}
                      </span>
                      <span className="font-extrabold text-[#002B66]">
                        {progressPercent}% Complete
                      </span>
                    </div>
                    {/* Progress Track */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                          isFullyDone ? "bg-emerald-500" : "bg-[#002B66]"
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Stepper Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#002B66]" />
                    <span>Inquiry Processing Steps</span>
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Capiz IPS Charter
                  </span>
                </div>

                <div className="relative pl-6 space-y-5 text-left before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                  {steps.map((step, idx) => {
                    const activeIdx = getActiveStepIndex(selectedInquiry.status);
                    const isCompleted = idx < activeIdx || (["Approved", "Responded", "Completed"].includes(selectedInquiry.status) && idx === 5);
                    const isActive = idx === activeIdx && !isCompleted;

                    return (
                      <div key={step.num} className="relative group">
                        {/* Bullet / Check Icon */}
                        <div className={`absolute -left-[30px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow-xs z-10 ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : isActive
                              ? "bg-[#002B66] border-[#002B66] text-white ring-4 ring-blue-100 animate-pulse"
                              : "bg-white border-slate-300 text-slate-400"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <span className="text-[10px] font-extrabold">{step.num}</span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`font-black text-xs ${
                              isActive ? "text-[#002B66]" : isCompleted ? "text-slate-800" : "text-slate-500"
                            }`}>
                              Step {step.num}: {step.title}
                            </p>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-[#002B66] uppercase tracking-wider">
                                In Progress
                              </span>
                            )}
                            {isCompleted && (
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                                ✓ Done
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {step.description}
                          </p>

                          {/* Active Step Context Box */}
                          {isActive && (
                            <div className="mt-2.5 p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1.5 text-[11px] font-semibold text-slate-700 shadow-2xs">
                              <div className="flex items-center gap-1.5 text-slate-800">
                                <Building2 className="w-3.5 h-3.5 text-[#002B66] shrink-0" />
                                <span className="font-extrabold text-[#002B66]">Responsible: </span>
                                <span>{step.officer}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-bold text-slate-600">Standard Duration: </span>
                                <span>{step.time}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submitted Files */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-[#002B66]" />
                    <span>Submitted Attachments</span>
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">
                    {(selectedInquiry.letter_of_intent ? 1 : 0) + (selectedInquiry.supporting_documents ? 1 : 0)} files
                  </span>
                </div>

                {!selectedInquiry.letter_of_intent && !selectedInquiry.supporting_documents ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium">
                    No supplementary attachments uploaded with this inquiry.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedInquiry.letter_of_intent && (
                      <button
                        type="button"
                        onClick={() => downloadFileDirectly(selectedInquiry.letter_of_intent, `LOI_${(selectedInquiry.subject || selectedInquiry.investor_name).trim().replace(/\s+/g, '_')}.pdf`)}
                        className="p-3 bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-200 rounded-xl text-xs font-bold text-slate-800 hover:text-[#002B66] flex items-center justify-between transition-all group shadow-2xs w-full text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="font-extrabold text-slate-900 truncate">Letter of Intent (LOI)</p>
                            <p className="text-[10px] text-slate-400 font-medium">Official Investor Document</p>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-white group-hover:bg-[#002B66] text-slate-500 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                          <Download className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    )}

                    {selectedInquiry.supporting_documents && (
                      <button
                        type="button"
                        onClick={() => downloadFileDirectly(selectedInquiry.supporting_documents, `Supporting_Docs_${(selectedInquiry.subject || selectedInquiry.investor_name).trim().replace(/\s+/g, '_')}.pdf`)}
                        className="p-3 bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-200 rounded-xl text-xs font-bold text-slate-800 hover:text-[#002B66] flex items-center justify-between transition-all group shadow-2xs w-full text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-[#002B66] flex items-center justify-center shrink-0">
                            <FolderOpen className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="font-extrabold text-slate-900 truncate">Supporting Portfolios / Profiles</p>
                            <p className="text-[10px] text-slate-400 font-medium">Supplementary Files</p>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-white group-hover:bg-[#002B66] text-slate-500 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                          <Download className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Official Provincial / LEDIP Response Notes */}
              {selectedInquiry.admin_notes && (
                <div className="pt-4 border-t border-slate-100 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-blue-900">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span>Official LEDIP / BDD Response</span>
                    </h4>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      Provincial Action
                    </span>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50/80 to-slate-50 border border-blue-200/80 rounded-2xl space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-[#002B66] text-white flex items-center justify-center text-[9px] font-extrabold">
                        P
                      </div>
                      <span>Provincial Economic Development Officer Note:</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed pl-7">
                      "{selectedInquiry.admin_notes}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">Select an Inquiry</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Choose an inquiry from the dashboard registry to review its live timeline, responsible officers, and official resolution notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiriesSection;
