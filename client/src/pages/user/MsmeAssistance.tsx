import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import ClientMainLayout from "@/components/client-portal/ClientMainLayout";
import { MsmeService, type MsmeRequestData } from "@/services/MsmeService";
import { LoadingState } from "@/components/ui/LoadingState";
import { notify } from "@/util/notify";
import { downloadFileDirectly } from "@/util/fileDownload";
import { 
  Briefcase, 
  Plus, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  User, 
  HelpCircle, 
  X, 
  AlertCircle,
  ChevronRight,
  Loader2,
  Download,
  Search,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  Check,
  FileCheck2,
  FolderOpen
} from "lucide-react";

export const MsmeAssistance: React.FC = () => {
  const [searchParams] = useSearchParams();
  const clientUser = JSON.parse(localStorage.getItem("client_user") || "{}");
  const [requests, setRequests] = useState<MsmeRequestData[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MsmeRequestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  // Form Fields
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState(clientUser.fullname || "");
  const [email, setEmail] = useState(clientUser.email || "");
  const [phone, setPhone] = useState("");
  const [classification, setClassification] = useState<"Simple Transaction" | "Complex Transaction">("Simple Transaction");
  const [description, setDescription] = useState("");
  const [requestLetterFile, setRequestLetterFile] = useState<File | null>(null);
  const [otherDocsFile, setOtherDocsFile] = useState<File | null>(null);

  const requestLetterInputRef = useRef<HTMLInputElement>(null);
  const otherDocsInputRef = useRef<HTMLInputElement>(null);

  const removeRequestLetter = () => {
    setRequestLetterFile(null);
    if (requestLetterInputRef.current) {
      requestLetterInputRef.current.value = "";
    }
  };

  const removeOtherDocs = () => {
    setOtherDocsFile(null);
    if (otherDocsInputRef.current) {
      otherDocsInputRef.current.value = "";
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRequestLetterFile(null);
    setOtherDocsFile(null);
    if (requestLetterInputRef.current) requestLetterInputRef.current.value = "";
    if (otherDocsInputRef.current) otherDocsInputRef.current.value = "";
  };

  // Fetch Requests
  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await MsmeService.getAll();
      if (res.requests) {
        setRequests(res.requests);
        if (res.requests.length > 0) {
          const targetId = searchParams.get("id") || searchParams.get("request_id");
          const matched = targetId
            ? res.requests.find((r) => String(r.id) === String(targetId))
            : null;
          setSelectedRequest(matched || res.requests[0]);
          if (matched) {
            if (matched.status === "Completed" && statusFilter === "ACTIVE") {
              setStatusFilter("ALL");
            } else if (matched.status !== "Completed" && statusFilter === "COMPLETED") {
              setStatusFilter("ALL");
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to load MSME requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Synchronize selected request whenever searchParams or requests update
  useEffect(() => {
    const targetId = searchParams.get("id") || searchParams.get("request_id");
    if (targetId && requests.length > 0) {
      const matched = requests.find((r) => String(r.id) === String(targetId));
      if (matched) {
        setSelectedRequest(matched);
        setSearchQuery("");
        if (matched.status === "Completed" && statusFilter === "ACTIVE") {
          setStatusFilter("ALL");
        } else if (matched.status !== "Completed" && statusFilter === "COMPLETED") {
          setStatusFilter("ALL");
        }

        setTimeout(() => {
          const el = document.getElementById(`msme-request-card-${matched.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }, 100);
      }
    }
  }, [searchParams, requests]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactPerson.trim() || !email.trim() || !phone.trim() || !description.trim()) {
      notify.warning("Required Fields", "Please populate all request fields.");
      return;
    }
    if (!requestLetterFile) {
      notify.warning("Upload Required", "Please upload a Request Letter PDF or image.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("company_name", companyName.trim());
    formData.append("contact_person", contactPerson.trim());
    formData.append("email", email.trim());
    formData.append("phone", phone.trim());
    formData.append("classification", classification);
    formData.append("description", description.trim());
    formData.append("request_letter", requestLetterFile);
    if (otherDocsFile) {
      formData.append("other_docs", otherDocsFile);
    }

    try {
      await MsmeService.create(formData);
      setIsModalOpen(false);
      // Reset form
      setCompanyName("");
      setPhone("");
      setDescription("");
      setRequestLetterFile(null);
      setOtherDocsFile(null);
      if (requestLetterInputRef.current) requestLetterInputRef.current.value = "";
      if (otherDocsInputRef.current) otherDocsInputRef.current.value = "";
      
      // Reload requests
      fetchRequests();
    } catch (error) {
      console.error("Failed to submit MSME request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Submitted":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200/80",
          dot: "bg-blue-500",
          label: "Submitted"
        };
      case "Under Review":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200/80",
          dot: "bg-purple-500",
          label: "Under Review"
        };
      case "Endorsed":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200/80",
          dot: "bg-amber-500",
          label: "Endorsed to BDD"
        };
      case "Processing":
        return {
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
          dot: "bg-indigo-500",
          label: "Action in Progress"
        };
      case "Completed":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          dot: "bg-emerald-500",
          label: "Completed"
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
          label: status
        };
    }
  };

  // 5 Step definitions matching Citizen's Charter
  const steps = [
    {
      num: 1,
      title: "Submit & Verify",
      action: "Verification of documents & stamp received.",
      statusKey: "Submitted",
      time: "5 minutes",
      officer: "Administrative Officer II",
    },
    {
      num: 2,
      title: "LEDIP Officer Review",
      action: "Review request & requirements with LEDIP Officer.",
      statusKey: "Under Review",
      time: "15 minutes",
      officer: "Administrative Officer II",
    },
    {
      num: 3,
      title: "BDD Endorsement",
      action: "Endorse to the Business Development Division (BDD).",
      statusKey: "Endorsed",
      time: "15 minutes",
      officer: "LEDIP Officer",
    },
    {
      num: 4,
      title: "Action Plan",
      action: "Act on request & assemble business assistance bundle.",
      statusKey: "Processing",
      time: "Varies depending on nature of request",
      officer: "Supervising Administrative Officer",
    },
    {
      num: 5,
      title: "Completion",
      action: "Inform client/MSME of specific actions taken & deliver response.",
      statusKey: "Completed",
      time: "5 minutes",
      officer: "Supervising Administrative Officer",
    },
  ];

  const getCurrentStepIndex = (status: string) => {
    switch (status) {
      case "Submitted":
        return 0;
      case "Under Review":
        return 1;
      case "Endorsed":
        return 2;
      case "Processing":
        return 3;
      case "Completed":
        return 4;
      default:
        return -1;
    }
  };

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch = 
        req.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(req.id).includes(searchQuery);

      if (!matchesSearch) return false;

      const isCompleted = req.status === "Completed";
      if (statusFilter === "ACTIVE") return !isCompleted;
      if (statusFilter === "COMPLETED") return isCompleted;
      return true;
    });
  }, [requests, searchQuery, statusFilter]);

  // Statistics
  const totalCount = requests.length;
  const completedCount = requests.filter((r) => r.status === "Completed").length;
  const activeCount = totalCount - completedCount;

  return (
    <ClientMainLayout>
      <div className="space-y-6 text-left">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#002B66]">
                <Briefcase className="w-5 h-5 text-[#002B66]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#002B66] tracking-tight">
                  MSME Business Processing Assistance
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Apply for promotional and development support, and track your business assistance requests live.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#002B66] hover:bg-[#001D47] text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg transition-all duration-300 uppercase tracking-wider cursor-pointer w-fit shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Assistance</span>
          </button>
        </div>

        {/* Metric Highlights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-[#002B66]" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Requests</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900">{totalCount}</span>
                <span className="text-xs font-semibold text-slate-400">submitted</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active In Pipeline</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-amber-600">{activeCount}</span>
                <span className="text-xs font-semibold text-slate-400">in process</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Resolved Requests</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-emerald-600">{completedCount}</span>
                <span className="text-xs font-semibold text-slate-400">completed</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#002B66] to-[#0A3D82] text-white rounded-2xl p-4 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">Processing Fees</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-extrabold text-white">Free of Charge</span>
                <span className="text-[11px] font-medium text-blue-200">100% Gov Subsidized</span>
              </div>
            </div>
          </div>
        </div>

        {/* Division Summary & Guidelines Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Requests Registry + Service Guidelines */}
          <div className="lg:col-span-7 space-y-6">
            {/* Active Requests List */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
              {/* Header & Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Active Requests Dashboard
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live tracking of MSME promotional and developmental assistance requests.
                  </p>
                </div>

                {/* Filter Tabs */}
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

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by enterprise name, transaction details, or ID..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#002B66]/15 focus:border-[#002B66] transition-all"
                />
              </div>

              {/* List */}
              {isLoading ? (
                <LoadingState message="Loading assistance requests..." className="py-16" />
              ) : filteredRequests.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/60">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center mb-2">
                    <FileText className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-700">No Requests Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    {searchQuery 
                      ? "No records matched your search query. Try searching for a different keyword." 
                      : "You have not submitted any MSME assistance requests yet. Click \"Apply for Assistance\" to begin."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">
                  {filteredRequests.map((req) => {
                    const isSelected = selectedRequest?.id === req.id;
                    const statusInfo = getStatusBadge(req.status);

                    return (
                      <div
                        key={req.id}
                        id={`msme-request-card-${req.id}`}
                        onClick={() => setSelectedRequest(req)}
                        className={`group p-4 border rounded-2xl cursor-pointer transition-all duration-200 text-left relative overflow-hidden ${
                          isSelected
                            ? "bg-blue-50/50 border-[#002B66] shadow-sm ring-1 ring-[#002B66]/20"
                            : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60"
                        }`}
                      >
                        {/* Selected Indicator Bar */}
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#002B66] rounded-r-full" />
                        )}

                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 min-w-0 flex-1">
                            {/* Company Name & Status Pill */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-slate-500">
                                #REQ-{String(req.id).padStart(3, "0")}
                              </span>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide border ${statusInfo.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                                <span>{statusInfo.label}</span>
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
                                req.classification === "Simple Transaction"
                                  ? "bg-sky-50 text-sky-700 border border-sky-100"
                                  : "bg-purple-50 text-purple-700 border border-purple-100"
                              }`}>
                                {req.classification}
                              </span>
                            </div>

                            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#002B66] transition-colors truncate">
                              {req.company_name}
                            </h3>

                            <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                              {req.description}
                            </p>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium pt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{new Date(req.created_at || "").toLocaleDateString()}</span>
                              </span>
                              {req.admin_notes && (
                                <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Has Division Notes</span>
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

            {/* Assistance Workflow & Info Sheet */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#002B66]">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Service Guidelines & Citizen's Charter</h3>
                  <p className="text-[11px] text-slate-500">Official standards prescribed by the Provincial Government of Capiz</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-colors">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-[#002B66]" />
                    <span className="font-bold uppercase tracking-wider text-[10px]">Implementing Office</span>
                  </div>
                  <p className="font-extrabold text-slate-800">Business Development Division (PEDIPO)</p>
                </div>

                <div className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-colors">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Layers className="w-3.5 h-3.5 text-[#002B66]" />
                    <span className="font-bold uppercase tracking-wider text-[10px]">Classification</span>
                  </div>
                  <p className="font-extrabold text-slate-800">Simple / Complex Transaction</p>
                </div>

                <div className="p-3.5 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl border border-emerald-100/80 transition-colors">
                  <div className="flex items-center gap-2 text-emerald-700 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold uppercase tracking-wider text-[10px]">Fees to be Paid</span>
                  </div>
                  <p className="font-extrabold text-emerald-700">None (100% Free of Charge)</p>
                </div>

                <div className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-colors">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <User className="w-3.5 h-3.5 text-[#002B66]" />
                    <span className="font-bold uppercase tracking-wider text-[10px]">Availing Clients</span>
                  </div>
                  <p className="font-extrabold text-slate-800">Capiz Micro, Small, and Medium Enterprises</p>
                </div>
              </div>

              {/* Checklist */}
              <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-2">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Required Documents Checklist</span>
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>Formal Request Letter detailing the specific promotional, product development, or marketing assistance needed.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>Pertinent business credentials (Mayor’s/Business Permit, DTI Registration, or product photos).</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Stepper Timeline & Active Request Details */}
          <div className="lg:col-span-5 space-y-6">
            {selectedRequest ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5 sticky top-6">
                {/* Enterprise Header Banner */}
                <div className="bg-gradient-to-br from-slate-900 via-[#002B66] to-[#0A3D82] text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/5 rounded-full pointer-events-none blur-xl" />
                  
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-blue-200 uppercase tracking-widest">
                    <span>Enterprise Profile</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-xs font-mono font-bold text-white border border-white/20">
                      #REQ-{String(selectedRequest.id).padStart(3, "0")}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white mt-2 leading-snug">
                    {selectedRequest.company_name}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-xs text-blue-100">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-blue-300 block font-bold">Contact</span>
                      <p className="font-semibold text-white truncate">{selectedRequest.contact_person}</p>
                      {selectedRequest.phone && (
                        <p className="text-[10px] text-blue-200 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-blue-300" />
                          <span>{selectedRequest.phone}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-blue-300 block font-bold">Classification</span>
                      <p className="font-semibold text-white truncate">{selectedRequest.classification}</p>
                      {selectedRequest.email && (
                        <p className="text-[10px] text-blue-200 flex items-center gap-1 mt-0.5 truncate">
                          <Mail className="w-3 h-3 text-blue-300 shrink-0" />
                          <span className="truncate">{selectedRequest.email}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Overall Progress Indicator */}
                {(() => {
                  const currentIdx = getCurrentStepIndex(selectedRequest.status);
                  const isFullyDone = selectedRequest.status === "Completed";
                  const progressPercent = isFullyDone 
                    ? 100 
                    : Math.round(((currentIdx + 0.5) / steps.length) * 100);

                  return (
                    <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">
                          {isFullyDone ? "Assistance Cycle Completed" : `Processing Step ${currentIdx + 1} of ${steps.length}`}
                        </span>
                        <span className="font-extrabold text-[#002B66]">
                          {progressPercent}% Progress
                        </span>
                      </div>
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

                {/* Live Timeline Tracker */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#002B66]" />
                      <span>Live Processing Timeline</span>
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      5-Step Cycle
                    </span>
                  </div>

                  <div className="relative pl-6 space-y-5 text-left before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                    {steps.map((step, idx) => {
                      const currentIdx = getCurrentStepIndex(selectedRequest.status);
                      const isCompleted = idx < currentIdx || (selectedRequest.status === "Completed" && idx === 4);
                      const isActive = idx === currentIdx && !isCompleted;

                      return (
                        <div key={step.num} className="relative group">
                          {/* Bullet / Step Marker */}
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
                                  Current Action
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                                  ✓ Done
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                              {step.action}
                            </p>
                            
                            {/* Officer & SLA context when active */}
                            {isActive && (
                              <div className="mt-2.5 p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1.5 text-[11px] font-semibold text-slate-700 shadow-2xs">
                                <div className="flex items-center gap-1.5 text-slate-800">
                                  <User className="w-3.5 h-3.5 text-[#002B66] shrink-0" />
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

                {/* Documents Download */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-left">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4 text-[#002B66]" />
                      <span>Submitted Attachments</span>
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400">
                      {(selectedRequest.request_letter_path ? 1 : 0) + (selectedRequest.other_docs_path ? 1 : 0)} files
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedRequest.request_letter_path ? (
                      <button
                        type="button"
                        onClick={() => downloadFileDirectly(selectedRequest.request_letter_path, `Official_Request_Letter_${selectedRequest.company_name.trim().replace(/\s+/g, '_')}.pdf`)}
                        className="p-3 bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-200 rounded-xl text-xs font-bold text-slate-800 hover:text-[#002B66] flex items-center justify-between transition-all group shadow-2xs w-full text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="font-extrabold text-slate-900 truncate">Official Request Letter</p>
                            <p className="text-[10px] text-slate-400 font-medium">Letter of Intent / Application</p>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-white group-hover:bg-[#002B66] text-slate-500 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                          <Download className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        No request letter found.
                      </div>
                    )}

                    {selectedRequest.other_docs_path && (
                      <button
                        type="button"
                        onClick={() => downloadFileDirectly(selectedRequest.other_docs_path, `Pertinent_Documents_${selectedRequest.company_name.trim().replace(/\s+/g, '_')}`)}
                        className="p-3 bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-200 rounded-xl text-xs font-bold text-slate-800 hover:text-[#002B66] flex items-center justify-between transition-all group shadow-2xs w-full text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-[#002B66] flex items-center justify-center shrink-0">
                            <FolderOpen className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="font-extrabold text-slate-900 truncate">Pertinent Documents & Permits</p>
                            <p className="text-[10px] text-slate-400 font-medium">Supplementary Business Records</p>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-white group-hover:bg-[#002B66] text-slate-500 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                          <Download className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Division Feedback Notes */}
                {selectedRequest.admin_notes && (
                  <div className="pt-4 border-t border-slate-100 space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-blue-900">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                        <span>Division Feedback & Resolution</span>
                      </h4>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        Official Action
                      </span>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-blue-50/80 to-slate-50 border border-blue-200/80 rounded-2xl space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-[#002B66] text-white flex items-center justify-center text-[9px] font-extrabold">
                          B
                        </div>
                        <span>Business Development Division Note:</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 leading-relaxed pl-7">
                        "{selectedRequest.admin_notes}"
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
                <h3 className="text-sm font-extrabold text-slate-800">Select a Request</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Click on any MSME request from the dashboard to track its 5-step processing timeline and review official correspondence.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submission Modal Dialog */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200 border border-slate-100">
              {/* Modal Header */}
              <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-[#002B66] to-[#0A3D82] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                    <Briefcase className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      Apply for Business Assistance
                    </h3>
                    <p className="text-[11px] text-blue-200 font-medium">
                      Provincial Economic Development & Investment Promotion Office
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-1.5 hover:bg-white/10 text-white/80 hover:text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Element */}
              <form onSubmit={handleFormSubmit} className="divide-y divide-slate-100 text-left">
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Row 1: Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      MSME / Registered Enterprise Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Capiz Artisanal Seafoods Corp."
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#002B66]/15 focus:border-[#002B66] transition-all"
                    />
                  </div>

                  {/* Row 2: Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Contact Person <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="Owner or authorized officer"
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#002B66]/15 focus:border-[#002B66] transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Contact Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0917-XXX-XXXX"
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#002B66]/15 focus:border-[#002B66] transition-all"
                      />
                    </div>
                  </div>

                  {/* Row 3: Email & Classification */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="business@example.com"
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#002B66]/15 focus:border-[#002B66] transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Transaction Classification <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={classification}
                        onChange={(e) => setClassification(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#002B66]/15 focus:border-[#002B66] transition-all cursor-pointer"
                      >
                        <option value="Simple Transaction">Simple Transaction (Product promotion, trade fairs)</option>
                        <option value="Complex Transaction">Complex Transaction (Inter-agency, export assistance)</option>
                      </select>
                    </div>
                  </div>

                  {/* Nature of Request */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Nature of Assistance Needed <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the specific assistance or support needed for your enterprise..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#002B66]/15 focus:border-[#002B66] transition-all"
                    />
                  </div>

                  {/* File Upload fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Request Letter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Request Letter <span className="text-rose-500">*</span>
                      </label>
                      {requestLetterFile ? (
                        <div className="flex items-center justify-between p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl transition-all">
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#002B66] flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 text-left">
                              <p className="text-xs font-bold text-slate-800 truncate" title={requestLetterFile.name}>
                                {requestLetterFile.name}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">
                                {(requestLetterFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <label className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-[#002B66] rounded-lg transition-colors cursor-pointer text-[11px] font-bold border border-slate-200 shadow-2xs">
                              Change
                              <input
                                ref={requestLetterInputRef}
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                onChange={(e) => handleFileChange(e, setRequestLetterFile)}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={removeRequestLetter}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer border border-rose-200/60"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/70 hover:bg-blue-50/40 hover:border-blue-300 transition-colors text-center relative cursor-pointer group">
                          <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-600 mb-1.5 transition-colors" />
                          <span className="text-[11px] text-slate-700 font-bold block max-w-full truncate px-1 group-hover:text-blue-600 transition-colors">
                            Select Letter PDF / Doc
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Max size: 10MB</span>
                          <input
                            ref={requestLetterInputRef}
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                            onChange={(e) => handleFileChange(e, setRequestLetterFile)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Pertinent Docs */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Other Pertinent Documents <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      {otherDocsFile ? (
                        <div className="flex items-center justify-between p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-2xl transition-all">
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                              <FolderOpen className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 text-left">
                              <p className="text-xs font-bold text-slate-800 truncate" title={otherDocsFile.name}>
                                {otherDocsFile.name}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">
                                {(otherDocsFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <label className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 rounded-lg transition-colors cursor-pointer text-[11px] font-bold border border-slate-200 shadow-2xs">
                              Change
                              <input
                                ref={otherDocsInputRef}
                                type="file"
                                accept=".pdf,.zip,.rar,.doc,.docx,.png,.jpg,.jpeg"
                                onChange={(e) => handleFileChange(e, setOtherDocsFile)}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={removeOtherDocs}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer border border-rose-200/60"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/70 hover:bg-blue-50/40 hover:border-blue-300 transition-colors text-center relative cursor-pointer group">
                          <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-600 mb-1.5 transition-colors" />
                          <span className="text-[11px] text-slate-700 font-bold block max-w-full truncate px-1 group-hover:text-blue-600 transition-colors">
                            Select Zip / PDF File
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">DTI, Mayor's Permit, etc.</span>
                          <input
                            ref={otherDocsInputRef}
                            type="file"
                            accept=".pdf,.zip,.rar,.doc,.docx,.png,.jpg,.jpeg"
                            onChange={(e) => handleFileChange(e, setOtherDocsFile)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Modal Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-[#002B66] hover:bg-[#001D47] disabled:bg-slate-300 text-white text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg uppercase tracking-wider"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Submit Assistance Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ClientMainLayout>
  );
};

export default MsmeAssistance;
