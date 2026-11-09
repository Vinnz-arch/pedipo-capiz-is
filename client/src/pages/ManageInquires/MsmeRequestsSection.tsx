import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MsmeService, type MsmeRequestData } from "@/services/MsmeService";
import { LoadingState } from "@/components/ui/LoadingState";
import { notify } from "@/util/notify";
import { downloadFileDirectly } from "@/util/fileDownload";
import { 
  Store, 
  Clock, 
  Layers, 
  CheckCircle2, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  X, 
  Download, 
  FileText, 
  Loader2, 
  ShieldAlert, 
  Check,
  AlertTriangle,
  Building2,
  Phone,
  Mail
} from "lucide-react";

export const MsmeRequestsSection: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [requests, setRequests] = useState<MsmeRequestData[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MsmeRequestData | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<MsmeRequestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters State
  const [statusFilter, setStatusFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Fields for Review Modal
  const [editStatus, setEditStatus] = useState<MsmeRequestData["status"]>("Submitted");
  const [editNotes, setEditNotes] = useState("");

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await MsmeService.getAll();
      if (res.requests) {
        setRequests(res.requests);
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

  // Auto-select request if ID is provided in query params
  useEffect(() => {
    const id = searchParams.get("id");
    const tab = searchParams.get("tab");
    if (id && tab === "msme" && requests.length > 0) {
      const match = requests.find((r) => String(r.id) === String(id));
      if (match) {
        setSelectedRequest(match);
      }
    }
  }, [searchParams, requests]);

  useEffect(() => {
    if (selectedRequest) {
      setEditStatus(selectedRequest.status);
      setEditNotes(selectedRequest.admin_notes || "");
    }
  }, [selectedRequest]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !selectedRequest.id) return;

    setIsUpdating(true);
    try {
      const res = await MsmeService.update(selectedRequest.id, {
        status: editStatus,
        admin_notes: editNotes.trim() || undefined,
      });
      if (res.request) {
        setRequests((prev) =>
          prev.map((r) => (r.id === selectedRequest.id ? res.request : r))
        );
        setSelectedRequest(null);
        notify.success("Status Updated", "MSME assistance transaction updated successfully.");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      notify.error("Update Failed", "Could not update transaction status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deletingRequest?.id) return;

    setIsDeleting(true);
    try {
      await MsmeService.delete(deletingRequest.id);
      setRequests((prev) => prev.filter((r) => r.id !== deletingRequest.id));
      if (selectedRequest?.id === deletingRequest.id) {
        setSelectedRequest(null);
      }
      notify.success("Deleted", "MSME assistance request record removed.");
      setDeletingRequest(null);
    } catch (error) {
      console.error("Failed to delete request record:", error);
      notify.error("Delete Failed", "Could not remove request record.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to format request ID into dynamic format: #MSME-YYYY-XXX
  const getRequestNumber = (item: MsmeRequestData) => {
    const date = item.created_at ? new Date(item.created_at) : new Date();
    const year = date.getFullYear();
    const paddedId = String(item.id || "0").padStart(3, "0");
    return `#MSME-${year}-${paddedId}`;
  };

  // Workflow Status Badge Helper
  const getStatusBadge = (status: MsmeRequestData["status"]) => {
    switch (status) {
      case "Submitted":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Step 1: Submit & Verify
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Step 2: LEDIP Review
          </span>
        );
      case "Endorsed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            Step 3: BDD Endorsement
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
            Step 4: Action Plan
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Step 5: Completion
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            {status}
          </span>
        );
    }
  };

  // Workflow Filter Tabs
  const WORKFLOW_FILTER_TABS = [
    { label: "All", value: "All" },
    { label: "Step 1: Intake", value: "Submitted" },
    { label: "Active Pipeline", value: "Pipeline" },
    { label: "Step 2: Review", value: "Under Review" },
    { label: "Step 3: Endorsed", value: "Endorsed" },
    { label: "Step 4: Processing", value: "Processing" },
    { label: "Step 5: Completed", value: "Completed" },
  ];

  // Filter Logic
  const filteredRequests = requests.filter((r) => {
    let matchesStatus = statusFilter === "All";
    if (!matchesStatus) {
      if (statusFilter === "Submitted") {
        matchesStatus = r.status === "Submitted";
      } else if (statusFilter === "Pipeline") {
        matchesStatus = ["Under Review", "Endorsed", "Processing"].includes(r.status);
      } else {
        matchesStatus = r.status === statusFilter;
      }
    }

    const matchesClass = classFilter === "All" || r.classification === classFilter;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      getRequestNumber(r).toLowerCase().includes(query) ||
      r.company_name.toLowerCase().includes(query) ||
      r.contact_person.toLowerCase().includes(query) ||
      r.email.toLowerCase().includes(query) ||
      r.phone.toLowerCase().includes(query);

    return matchesStatus && matchesClass && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left font-sans">
      {/* 4 Interactive MSME Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests */}
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
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                TOTAL MSME REQUESTS
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {requests.length}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                All-time applications
              </p>
            </div>
          </div>
        </div>

        {/* Action Required: Step 1 Intake */}
        <div
          onClick={() => setStatusFilter("Submitted")}
          className={`bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all cursor-pointer border ${
            statusFilter === "Submitted"
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
                {requests.filter((r) => r.status === "Submitted").length}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Awaiting intake verification
              </p>
            </div>
          </div>
        </div>

        {/* In Active Pipeline */}
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
                  Steps 2–4
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-indigo-600 mt-0.5">
                {requests.filter((r) =>
                  ["Under Review", "Endorsed", "Processing"].includes(r.status)
                ).length}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                In review & action plan
              </p>
            </div>
          </div>
        </div>

        {/* Completed Assistance */}
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
                  COMPLETED ASSISTANCE
                </p>
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase">
                  Step 5
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">
                {requests.filter((r) => r.status === "Completed").length}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Assistance delivered & closed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table & Filter Controls Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div>
          {/* Header Controls: Filters & Search Box */}
          <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/40">
            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
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

            {/* Classification & Search Input */}
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              {/* Classification Selector */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] cursor-pointer w-full sm:w-auto"
                >
                  <option value="All">All Classifications</option>
                  <option value="Simple Transaction">Simple Transaction</option>
                  <option value="Complex Transaction">Complex Transaction</option>
                </select>
              </div>

              {/* Search Field */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search company, contact, or email..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                />
              </div>
            </div>
          </div>

          {/* Full-Width MSME Requests Registry Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">REQUEST #</th>
                  <th className="px-6 py-3.5">COMPANY & ENTITY</th>
                  <th className="px-4 py-3.5">CONTACT PERSON</th>
                  <th className="px-4 py-3.5">CLASSIFICATION</th>
                  <th className="px-4 py-3.5">DATE SUBMITTED</th>
                  <th className="px-4 py-3.5">WORKFLOW STATUS</th>
                  <th className="px-4 py-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <LoadingState message="Loading MSME assistance transactions..." className="py-6" />
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShieldAlert className="w-8 h-8 text-slate-300" />
                        <span className="text-xs font-bold text-slate-600">No MSME Requests Found</span>
                        <span className="text-[11px] text-slate-400">Try adjusting your status or classification filters.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedRequest(req)}
                    >
                      {/* Request Number */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-[#002B66] group-hover:underline">
                        {getRequestNumber(req)}
                      </td>

                      {/* Company Name & Email */}
                      <td className="px-6 py-4">
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {req.company_name}
                          </h4>
                          <p className="text-xs text-slate-400 font-medium truncate max-w-xs">
                            {req.email}
                          </p>
                        </div>
                      </td>

                      {/* Contact Person & Phone */}
                      <td className="px-4 py-4 text-slate-600 whitespace-nowrap text-xs">
                        <p className="font-semibold text-slate-800">{req.contact_person}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{req.phone || "No phone"}</p>
                      </td>

                      {/* Classification Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                            req.classification === "Simple Transaction"
                              ? "bg-sky-50 text-sky-700 border-sky-200/80"
                              : "bg-purple-50 text-purple-700 border-purple-200/80"
                          }`}
                        >
                          {req.classification}
                        </span>
                      </td>

                      {/* Date Submitted */}
                      <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap font-medium">
                        {req.created_at
                          ? new Date(req.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recent"}
                      </td>

                      {/* Workflow Status Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            title="Process / Review Request"
                            className="px-3 py-1.5 bg-[#002B66] text-white hover:bg-[#001D47] rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Process</span>
                          </button>
                          <button
                            onClick={() => setDeletingRequest(req)}
                            title="Delete Request Record"
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

      {/* Official MSME Processing & Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-[#002B66] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">Process MSME Assistance</h3>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-200 border border-blue-400/30">
                    {selectedRequest.classification}
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-0.5">
                  Request {getRequestNumber(selectedRequest)} &bull; Entity:{" "}
                  <span className="font-semibold text-white">{selectedRequest.company_name}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleUpdateStatus} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Company & Applicant Information Card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Applicant Information
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Enterprise Name</p>
                      <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        {selectedRequest.company_name}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Authorized Contact</p>
                      <p className="text-xs font-semibold text-slate-800">{selectedRequest.contact_person}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                      <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {selectedRequest.email}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Phone / Mobile</p>
                      <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {selectedRequest.phone || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assistance Description Card */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">
                    Assistance Needed Description
                  </span>
                  <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {selectedRequest.description || "No specific narrative provided."}
                  </div>
                </div>

                {/* Attached Documents */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Attached Supporting Documents
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => downloadFileDirectly(selectedRequest.request_letter_path, `Request_Letter_${selectedRequest.company_name.trim().replace(/\s+/g, '_')}.pdf`)}
                      className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between group transition-all cursor-pointer shadow-xs w-full text-left"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                            Request Letter
                          </p>
                          <p className="text-[10px] text-slate-400">Formal application letter</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 transition-colors" />
                    </button>

                    {selectedRequest.other_docs_path && (
                      <button
                        type="button"
                        onClick={() => downloadFileDirectly(selectedRequest.other_docs_path, `Pertinent_Docs_${selectedRequest.company_name.trim().replace(/\s+/g, '_')}`)}
                        className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between group transition-all cursor-pointer shadow-xs w-full text-left"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                              Pertinent Documents
                            </p>
                            <p className="text-[10px] text-slate-400">Additional attachments</p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 transition-colors" />
                      </button>
                    )}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Workflow Status & Notes */}
                <div className="space-y-4 pt-1">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Official Processing Decision
                  </h4>

                  {/* Status Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Advance Workflow Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                    >
                      <option value="Submitted">Step 1: Submit & Verify</option>
                      <option value="Under Review">Step 2: LEDIP Officer Review</option>
                      <option value="Endorsed">Step 3: BDD Endorsement</option>
                      <option value="Processing">Step 4: Action Plan</option>
                      <option value="Completed">Step 5: Completion & Notification</option>
                    </select>
                  </div>

                  {/* Official Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Division Review & Action Notes
                    </label>
                    <textarea
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="e.g. Endorsed to BDD, now evaluating packaging design requirements..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-[#002B66] hover:bg-[#001D47] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Decision...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Processing Action</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete MSME Assistance Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete the application for{" "}
                <span className="font-semibold text-slate-800">{deletingRequest.company_name}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRequest(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
