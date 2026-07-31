import React, { useEffect, useState } from "react";
import ClientMainLayout from "@/components/client-portal/ClientMainLayout";
import { MsmeService, type MsmeRequestData } from "@/services/MsmeService";
import { notify } from "@/util/notify";
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
  Download
} from "lucide-react";

export const MsmeAssistance: React.FC = () => {
  const clientUser = JSON.parse(localStorage.getItem("client_user") || "{}");
  const [requests, setRequests] = useState<MsmeRequestData[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MsmeRequestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState(clientUser.fullname || "");
  const [email, setEmail] = useState(clientUser.email || "");
  const [phone, setPhone] = useState("");
  const [classification, setClassification] = useState<"Simple Transaction" | "Complex Transaction">("Simple Transaction");
  const [description, setDescription] = useState("");
  const [requestLetterFile, setRequestLetterFile] = useState<File | null>(null);
  const [otherDocsFile, setOtherDocsFile] = useState<File | null>(null);

  // Fetch Requests
  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await MsmeService.getAll();
      if (res.requests) {
        setRequests(res.requests);
        if (res.requests.length > 0) {
          setSelectedRequest(res.requests[0]);
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
      
      // Reload requests
      fetchRequests();
    } catch (error) {
      console.error("Failed to submit MSME request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Submitted":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Under Review":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "Endorsed":
        return "bg-orange-50 text-orange-700 border-orange-100";
      case "Processing":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  // 5 Step definitions matching photos
  const steps = [
    {
      num: 1,
      title: "Submit & Verify",
      action: "Verification of documents & stamp received",
      statusKey: "Submitted",
      time: "5 minutes",
      officer: "Administrative Officer II",
    },
    {
      num: 2,
      title: "LEDIP Officer Review",
      action: "Review request with LEDIP Officer",
      statusKey: "Under Review",
      time: "15 minutes",
      officer: "Administrative Officer II",
    },
    {
      num: 3,
      title: "BDD Endorsement",
      action: "Endorse to Business Development Division",
      statusKey: "Endorsed",
      time: "15 minutes",
      officer: "LEDIP Officer",
    },
    {
      num: 4,
      title: "Action Plan",
      action: "Act on request & compile assistance bundle",
      statusKey: "Processing",
      time: "Varies depending on nature of request",
      officer: "Supervising Administrative Officer",
    },
    {
      num: 5,
      title: "Completion",
      action: "Inform client of specific action taken",
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

  const getFileUrl = (path?: string | null) => {
    if (!path) return "#";
    return path.startsWith("http") ? path : `http://localhost:8000${path}`;
  };

  return (
    <ClientMainLayout>
      <div className="space-y-6 text-left">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-black text-[#002B66] tracking-tight flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-[#002B66]" />
              <span>MSME Business Processing Assistance</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Apply for promotional and development support, and track your business assistance requests live.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#002B66] hover:bg-[#001D47] text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 uppercase tracking-wider cursor-pointer w-fit shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Assistance</span>
          </button>
        </div>

        {/* Division Summary & Guidelines Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Active Requests List */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
                Active Requests Dashboard
              </h2>

              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-[#002B66] animate-spin" />
                  <p className="text-xs font-semibold text-slate-400">Loading assistance requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="py-12 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/50">
                  <FileText className="w-10 h-10 text-slate-300" />
                  <p className="text-xs font-bold text-slate-500 mt-3">No Assistance Requests Submitted</p>
                  <p className="text-[11px] text-slate-400 mt-1">Submit a request letter to initiate the online assistance cycle.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all flex items-start justify-between gap-3 text-left ${
                        selectedRequest?.id === req.id
                          ? "bg-slate-50/80 border-[#002B66] shadow-2xs"
                          : "bg-white border-slate-200 hover:bg-slate-50/30"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs font-black text-slate-900 truncate">
                            {req.company_name}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(req.status)}`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{req.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold pt-1">
                          <span>{req.classification}</span>
                          <span>•</span>
                          <span>{new Date(req.created_at || "").toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 self-center shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assistance Workflow & Info Sheet */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs space-y-4">
              <h2 className="text-xs font-black text-[#002B66] uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <HelpCircle className="w-4 h-4" />
                <span>Service Guidelines & Details</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">Implementing Office</span>
                  <p className="font-extrabold text-[#002B66]">Business Development Division (PEDIPO)</p>
                </div>
                <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">Classification</span>
                  <p className="font-extrabold text-[#002B66]">Simple Transaction / Complex Transaction</p>
                </div>
                <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">Fees to be Paid</span>
                  <p className="font-extrabold text-emerald-600">None (Free of Charge)</p>
                </div>
                <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">Availing Clients</span>
                  <p className="font-extrabold text-[#002B66]">Capiz Micro, Small, and Medium Enterprises</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Required Checklist:</h4>
                <ul className="text-xs text-slate-600 space-y-1.5 font-semibold">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Request Letter stating the specific development or promotional assistance needed.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Other pertinent documents (Business permit, DTI cert, or profile summaries).</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stepper Timeline & Active Request Details */}
          <div className="space-y-6">
            {selectedRequest ? (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider truncate">
                    {selectedRequest.company_name}
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-[11px] font-semibold text-slate-500">
                    <span>ID: #{selectedRequest.id}</span>
                    <span className="capitalize text-slate-400">{selectedRequest.classification}</span>
                  </div>
                </div>

                {/* Live Timeline Tracker */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Live Processing Timeline</span>
                  </h4>

                  <div className="relative pl-6 border-l border-slate-200 space-y-6 text-xs">
                    {steps.map((step, idx) => {
                      const currentIdx = getCurrentStepIndex(selectedRequest.status);
                      const isCompleted = idx < currentIdx;
                      const isActive = idx === currentIdx;

                      return (
                        <div key={step.num} className="relative text-left">
                          {/* Bullet marker */}
                          <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCompleted
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : isActive
                                ? "bg-white border-[#002B66] text-[#002B66] shadow-sm animate-pulse"
                                  : "bg-white border-slate-300 text-slate-400"
                          }`}>
                            {isCompleted && <span className="text-[8px] font-bold">✓</span>}
                          </div>

                          <div className="space-y-1">
                            <p className={`font-black uppercase tracking-wider text-[9px] ${
                              isActive ? "text-[#002B66]" : isCompleted ? "text-slate-500" : "text-slate-400"
                            }`}>
                              Step {step.num}: {step.title}
                            </p>
                            <p className={`font-bold ${isActive ? "text-slate-900" : "text-slate-600"}`}>
                              {step.action}
                            </p>
                            
                            {/* Extra metrics when active */}
                            {isActive && (
                              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-[10px] font-semibold text-slate-500">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span>{step.officer}</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                  <Clock className="w-3 h-3" />
                                  <span>Est: {step.time}</span>
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
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Submitted Attachments</h4>
                  <div className="flex flex-col gap-2">
                    <a
                      href={getFileUrl(selectedRequest.request_letter_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-[#002B66] flex items-center justify-between transition-all"
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-slate-400" />
                        Request Letter
                      </span>
                      <Download className="w-4 h-4" />
                    </a>
                    {selectedRequest.other_docs_path && (
                      <a
                        href={getFileUrl(selectedRequest.other_docs_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-[#002B66] flex items-center justify-between transition-all"
                      >
                        <span className="truncate flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-slate-400" />
                          Pertinent Documents
                        </span>
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Agency Notes */}
                {selectedRequest.admin_notes && (
                  <div className="pt-3 border-t border-slate-100 space-y-1.5">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 text-slate-500">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                      <span>Division Feedback Notes</span>
                    </h4>
                    <p className="p-3 bg-blue-50/40 border-l-4 border-blue-500 rounded-r-xl text-xs font-medium text-slate-700 leading-relaxed">
                      {selectedRequest.admin_notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs text-center text-slate-400 text-xs italic">
                Select an active request to view the processing pipeline details.
              </div>
            )}
          </div>
        </div>

        {/* Submission Modal Dialog */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4.5 h-4.5 text-[#002B66]" />
                  <span>Request Economic Assistance</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Form Element */}
              <form onSubmit={handleFormSubmit} className="divide-y divide-slate-100 text-left">
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Row 1: Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">MSME Company Name</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Capiz Food Processing Corp."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                    />
                  </div>

                  {/* Row 2: Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Contact Person</label>
                      <input
                        type="text"
                        required
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="Name of owner or representative"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Contact Number</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0917-XXX-XXXX"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                      />
                    </div>
                  </div>

                  {/* Row 3: Email & Classification */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Transaction Classification</label>
                      <select
                        value={classification}
                        onChange={(e) => setClassification(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                      >
                        <option value="Simple Transaction">Simple Transaction (Product promotion/subsidy)</option>
                        <option value="Complex Transaction">Complex Transaction (Inter-agency/export facilitation)</option>
                      </select>
                    </div>
                  </div>

                  {/* Nature of Request */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nature of Request / Assistance Needed</label>
                    <textarea
                      rows={3}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Briefly describe what assistance or resource is being requested..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                    />
                  </div>

                  {/* File Upload fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Request Letter */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Upload Request Letter <span className="text-red-500">*</span></label>
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-center relative">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500 font-bold block max-w-full truncate px-1">
                          {requestLetterFile ? requestLetterFile.name : "Select Letter PDF"}
                        </span>
                        <input
                          type="file"
                          required
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                          onChange={(e) => handleFileChange(e, setRequestLetterFile)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Pertinent Docs */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Other Documents (Optional)</label>
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-center relative">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500 font-bold block max-w-full truncate px-1">
                          {otherDocsFile ? otherDocsFile.name : "Select zip/pdf file"}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.zip,.rar,.doc,.docx,.png,.jpg,.jpeg"
                          onChange={(e) => handleFileChange(e, setOtherDocsFile)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Modal Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#002B66] hover:bg-[#001D47] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Request</span>
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
