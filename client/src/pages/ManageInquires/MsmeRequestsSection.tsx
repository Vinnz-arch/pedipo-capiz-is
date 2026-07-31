import React, { useEffect, useState } from "react";
import { MsmeService, type MsmeRequestData } from "@/services/MsmeService";
import { 
  FileText, 
  Download, 
  Trash2, 
  Edit3, 
  Check, 
  Loader2, 
  Filter,
  X,
  ShieldAlert
} from "lucide-react";

export const MsmeRequestsSection: React.FC = () => {
  const [requests, setRequests] = useState<MsmeRequestData[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MsmeRequestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filters State
  const [statusFilter, setStatusFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");

  // Edit Fields
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
        admin_notes: editNotes,
      });
      if (res.request) {
        // Update local list
        setRequests(prev => prev.map(r => r.id === selectedRequest.id ? res.request : r));
        setSelectedRequest(res.request);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this MSME assistance request record?")) return;

    try {
      await MsmeService.delete(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("Failed to delete request record:", error);
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

  const filteredRequests = requests.filter(r => {
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    const matchesClass = classFilter === "All" || r.classification === classFilter;
    return matchesStatus && matchesClass;
  });

  const getFileUrl = (path?: string | null) => {
    if (!path) return "#";
    return path.startsWith("http") ? path : `http://localhost:8000${path}`;
  };

  return (
    <div className="space-y-6 text-left">
      {/* Filters Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filter MSME Transactions:</span>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Endorsed">Endorsed</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Class:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none"
            >
              <option value="All">All Classifications</option>
              <option value="Simple Transaction">Simple Transaction</option>
              <option value="Complex Transaction">Complex Transaction</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-9 h-9 text-[#002B66] animate-spin" />
              <p className="text-xs font-semibold text-slate-400">Loading assistance database...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center p-6 bg-slate-50/20">
              <ShieldAlert className="w-11 h-11 text-slate-300" />
              <p className="text-xs font-bold text-slate-500 mt-3">No Requests Match Filters</p>
              <p className="text-[11px] text-slate-400 mt-1">Try resetting the status or classification selectors.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Company Name</th>
                    <th className="px-5 py-3.5">Contact Person</th>
                    <th className="px-5 py-3.5">Classification</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={`cursor-pointer transition-colors ${
                        selectedRequest?.id === req.id ? "bg-slate-50/80" : "hover:bg-slate-50/30"
                      }`}
                    >
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {req.company_name}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 font-semibold">
                        {req.contact_person}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 font-bold uppercase text-[10px]">
                        {req.classification}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Edit / Process"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => req.id && handleDelete(req.id)}
                            className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                            title="Delete request record"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Sidebar Editor Panel */}
        <div className="space-y-6">
          {selectedRequest ? (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider truncate">
                  Process Request
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Details Sheet */}
              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Sender email</span>
                    <p className="font-bold text-slate-800 break-all">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Contact Phone</span>
                    <p className="font-bold text-slate-800">{selectedRequest.phone}</p>
                  </div>
                </div>

                <div className="text-left">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block mb-1">
                    Assistance Needed Description
                  </span>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 leading-relaxed font-semibold text-slate-600">
                    {selectedRequest.description}
                  </p>
                </div>

                {/* Attachment Downloads */}
                <div className="text-left space-y-1.5">
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Attachments</span>
                  <div className="flex flex-col gap-1.5">
                    <a
                      href={getFileUrl(selectedRequest.request_letter_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-[#002B66] flex items-center justify-between transition-all"
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-slate-400" />
                        Request Letter
                      </span>
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    {selectedRequest.other_docs_path && (
                      <a
                        href={getFileUrl(selectedRequest.other_docs_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-[#002B66] flex items-center justify-between transition-all"
                      >
                        <span className="truncate flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-slate-400" />
                          Pertinent Documents
                        </span>
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* State Advance Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Advance Workflow Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                  >
                    <option value="Submitted">Step 1: Submit & Verify</option>
                    <option value="Under Review">Step 2: LEDIP Officer Review</option>
                    <option value="Endorsed">Step 3: BDD Endorsement</option>
                    <option value="Processing">Step 4: Action Plan</option>
                    <option value="Completed">Step 5: Completion & Notification</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Division Review/Action Notes</label>
                  <textarea
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="e.g. Endorsed to BDD, now evaluating design requirements..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full bg-[#002B66] hover:bg-[#001D47] text-white py-3 rounded-xl font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating Transaction...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Update Status & Notes</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs text-center text-slate-400 text-xs italic">
              Select a submitted MSME request from the database list to inspect attachments and update the processing steps.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
