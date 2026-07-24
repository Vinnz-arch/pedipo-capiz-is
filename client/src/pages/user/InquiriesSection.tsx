import React, { useEffect, useState } from "react";
import { InquiryService, type InquiryData } from "@/services/InquiryService";
import { 
  MessageSquare, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Download, 
  FolderOpen,
  ChevronRight,
  Loader2,
  MapPin
} from "lucide-react";

export const InquiriesSection: React.FC = () => {
  const [inquiries, setInquiries] = useState<InquiryData[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const res = await InquiryService.getAll();
      if (res.inquiries) {
        setInquiries(res.inquiries);
        if (res.inquiries.length > 0) {
          setSelectedInquiry(res.inquiries[0]);
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Under Review":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Approved":
      case "Responded":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const getRequestNumber = (item: InquiryData) => {
    const date = item.created_at ? new Date(item.created_at) : new Date();
    const year = date.getFullYear();
    const paddedId = String(item.id).padStart(3, "0");
    return `#IPS-${year}-${paddedId}`;
  };

  const getFileUrl = (path?: string | null) => {
    if (!path) return "#";
    return path.startsWith("http") ? path : `http://localhost:8000${path}`;
  };

  // timeline definitions for inquiry status (Investment Promotion Services)
  const steps = [
    {
      num: 1,
      title: "Submit & Verify",
      description: "Verification of documents & stamp received.",
      statusKey: "Submitted",
      time: "5 minutes",
      officer: "Administrative Officer II",
    },
    {
      num: 2,
      title: "LEDIP Officer Review",
      description: "Confer the request to the LEDIP Officer together with pertinent documents for review.",
      statusKey: "Under Review",
      time: "15 minutes",
      officer: "Administrative Officer II",
    },
    {
      num: 3,
      title: "ISD Endorsement",
      description: "Endorse to the Investment Services Division for appropriate action.",
      statusKey: "Endorsed",
      time: "15 minutes",
      officer: "LEDIP Officer",
    },
    {
      num: 4,
      title: "Assistance Identification",
      description: "Identify if the request is asking for securing licenses, identifying partners, manpower, or other.",
      statusKey: "Assistance Identified",
      time: "15 minutes",
      officer: "Administrative Officer II",
    },
    {
      num: 5,
      title: "Action Plan",
      description: "Act on the request.",
      statusKey: "Processing",
      time: "Varies depending on the nature of request",
      officer: "Administrative Officer II",
    },
    {
      num: 6,
      title: "Completion",
      description: "Inform the client/requester of the specific action taken/to be taken.",
      statusKey: "Completed",
      time: "5 minutes",
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

  return (
    <div className="space-y-6 text-left">
      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dashboard Registry */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
              Submitted Inquiries Dashboard
            </h2>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#002B66] animate-spin" />
                <p className="text-xs font-semibold text-slate-400">Loading inquiry database...</p>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/50">
                <MessageSquare className="w-10 h-10 text-slate-300" />
                <p className="text-xs font-bold text-slate-500 mt-3">No Investment Inquiries Found</p>
                <p className="text-[11px] text-slate-400 mt-1">Submit an inquiry on any target project from the Opportunities catalog.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiry(inq)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all flex items-start justify-between gap-3 text-left ${
                      selectedInquiry?.id === inq.id
                        ? "bg-slate-50/80 border-[#002B66] shadow-2xs"
                        : "bg-white border-slate-200 hover:bg-slate-50/30"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-black text-[#002B66] truncate hover:underline">
                          {getRequestNumber(inq)}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(inq.status)}`}>
                          {inq.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {inq.opportunity?.project_name || "General Opportunity Inquiry"}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{inq.subject}</p>
                      <div className="text-[10px] text-slate-400 font-semibold pt-0.5">
                        Submitted on {new Date(inq.created_at || "").toLocaleDateString()}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 self-center shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* General FAQs Info Card */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-black text-[#002B66] uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
              <HelpCircle className="w-4 h-4" />
              <span>Frequently Asked Questions</span>
            </h2>
            <div className="space-y-3.5 text-xs font-medium text-slate-600 leading-relaxed">
              <div>
                <h4 className="font-black text-slate-900">What is the next step after submitting an inquiry?</h4>
                <p className="text-slate-500 mt-1">
                  Your inquiry goes into active review. A BDD officer will verify the authenticity of your Letter of Intent (LOI) and gather feasibility studies or municipal datasets relevant to your project.
                </p>
              </div>
              <div>
                <h4 className="font-black text-slate-900">How long does an inquiry review take?</h4>
                <p className="text-slate-500 mt-1">
                  General inquires are processed within 1-3 business days. Complex requests involving multi-agency coordination or custom land-use checks may take longer. You will receive real-time notes updates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Stepper & Active Inquiry Info */}
        <div className="space-y-6">
          {selectedInquiry ? (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs space-y-5">
              {/* Opportunity Banner Card */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Target Opportunity
                </span>
                <h4 className="text-sm font-black text-[#002B66] mt-0.5">
                  {selectedInquiry.opportunity?.project_name || "General Investment Inquiry"}
                </h4>
                {selectedInquiry.opportunity?.location && (
                  <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedInquiry.opportunity.location}
                  </span>
                )}
              </div>

              {/* Stepper timeline */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Inquiry Processing Steps</span>
                </h4>

                <div className="relative pl-6 border-l border-slate-200 space-y-5 text-xs text-left">
                  {steps.map((step, idx) => {
                    const activeIdx = getActiveStepIndex(selectedInquiry.status);
                    const isCompleted = idx < activeIdx || (["Approved", "Responded", "Completed"].includes(selectedInquiry.status) && idx === 5);
                    const isActive = idx === activeIdx && !isCompleted;

                    return (
                      <div key={step.num} className="relative">
                        {/* Bullet dot */}
                        <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : isActive
                              ? "bg-white border-[#002B66] text-[#002B66] shadow-sm animate-pulse"
                              : "bg-white border-slate-300 text-slate-400"
                        }`}>
                          {isCompleted && <span className="text-[8px] font-bold">✓</span>}
                        </div>

                        <div className="space-y-0.5">
                          <p className={`font-black uppercase tracking-wider text-[9px] ${
                            isActive ? "text-[#002B66]" : isCompleted ? "text-slate-500" : "text-slate-400"
                          }`}>
                            Step {step.num}: {step.title}
                          </p>
                          <p className="font-bold text-slate-600 leading-relaxed">
                            {step.description}
                          </p>
                          {isActive && (
                            <div className="mt-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-[10px] font-semibold text-slate-500">
                              <div>
                                <span className="text-slate-400 font-bold">Responsible: </span>
                                <span>{step.officer}</span>
                              </div>
                              <div className="text-slate-400">
                                <span className="font-bold">Est: </span>
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
              <div className="pt-3 border-t border-slate-100 space-y-2 text-left">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Submitted Attachments</h4>
                <div className="flex flex-col gap-2">
                  {selectedInquiry.letter_of_intent && (
                    <a
                      href={getFileUrl(selectedInquiry.letter_of_intent)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-[#002B66] flex items-center justify-between transition-all"
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-slate-400" />
                        Letter of Intent (LOI)
                      </span>
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  {selectedInquiry.supporting_documents && (
                    <a
                      href={getFileUrl(selectedInquiry.supporting_documents)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-[#002B66] flex items-center justify-between transition-all"
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <FolderOpen className="w-4 h-4 text-slate-400" />
                        Supporting Portfolios
                      </span>
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Admin Feedback response notes */}
              {selectedInquiry.admin_notes && (
                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-left">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 text-slate-500">
                    <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                    <span>LEDIP / BDD Response Notes</span>
                  </h4>
                  <p className="p-3 bg-blue-50/40 border-l-4 border-blue-500 rounded-r-xl text-xs font-medium text-slate-700 leading-relaxed">
                    {selectedInquiry.admin_notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs text-center text-slate-400 text-xs italic">
              Select a registered inquiry from the registry list to track its live processing steps.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default InquiriesSection;
