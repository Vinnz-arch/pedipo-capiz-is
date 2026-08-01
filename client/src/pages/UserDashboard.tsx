import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Briefcase, 
  TrendingUp, 
  Scale, 
  Building,
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Sparkles,
  Loader2,
  ShieldCheck,
  FileText
} from "lucide-react";
import ClientMainLayout from "@/components/client-portal/ClientMainLayout";
import { MsmeService, type MsmeRequestData } from "@/services/MsmeService";
import { OpportunityService, type OpportunityData } from "@/services/OpportunityService";
import { PATHS } from "@/routes/paths";

const UserDashboard: React.FC = () => {
  const clientUser = JSON.parse(localStorage.getItem("client_user") || "{}");
  
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [msmeRequests, setMsmeRequests] = useState<MsmeRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [oppRes, msmeRes] = await Promise.all([
          OpportunityService.getAll(),
          MsmeService.getAll()
        ]);
        
        if (oppRes.opportunities) {
          setOpportunities(oppRes.opportunities);
        }
        if (msmeRes.requests) {
          setMsmeRequests(msmeRes.requests);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Compute metrics
  const totalOpps = opportunities.length;
  const highRoiOpps = opportunities.filter(o => Number(o.roi_estimate || 0) >= 14).slice(0, 2);
  const totalMsmeRequests = msmeRequests.length;
  const completedRequests = msmeRequests.filter(r => r.status === "Completed").length;
  const pendingRequests = totalMsmeRequests - completedRequests;

  return (
    <ClientMainLayout>
      <div className="space-y-8 pb-12 text-left">
        
        {/* Premium Welcome Header Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#091535] via-[#0E204E] to-[#0A173D] text-white p-8 rounded-3xl border border-white/5 shadow-xl">
          {/* Subtle background decoration */}
          <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 bottom-0 -mb-20 w-80 h-80 bg-[#E2B714]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold bg-[#E2B714]/10 text-[#E2B714] border border-[#E2B714]/25 uppercase tracking-widest">
                <Sparkles className="w-3 h-3 animate-pulse" />
                <span>PEDIPO Investor Portal</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Welcome back, {clientUser.fullname || "User"}!
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
                Analyze LGU performance records, check strategic infrastructure layouts, or process business assistance requests seamlessly.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-1.5 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#E2B714]" />
                <span>Verified Account Profile</span>
              </div>
              <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Building className="w-4 h-4 text-blue-400" />
                <span>Capiz Economic District</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-9 h-9 text-[#002B66] animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Synchronizing portal metrics...</p>
          </div>
        ) : (
          <>
            {/* KPI Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-400">
              
              {/* Opportunities Card */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5.5 h-5.5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Investments</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 block">{totalOpps}</span>
                  <span className="text-xs font-bold text-slate-500 block mt-0.5">Active Opportunities</span>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed font-medium">
                    Priority LGU projects open for private and institutional investment.
                  </p>
                </div>
                <Link 
                  to={PATHS.PORTAL.INVESTOR_PORTAL}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#002B66] hover:underline pt-2 w-fit"
                >
                  <span>Explore opportunities</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* MSME Assistance Card */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Briefcase className="w-5.5 h-5.5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Assistance</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 block">{totalMsmeRequests}</span>
                  <span className="text-xs font-bold text-slate-500 block mt-0.5">Assistance Requests</span>
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pendingRequests} Processing</span>
                    <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3 h-3" /> {completedRequests} Completed</span>
                  </div>
                </div>
                <Link 
                  to={PATHS.PORTAL.MSME_ASSISTANCE}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#002B66] hover:underline pt-2 w-fit"
                >
                  <span>View requests folder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Comparison Tool Card */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 bg-amber-50 text-[#746006] rounded-2xl flex items-center justify-center shrink-0">
                    <Scale className="w-5.5 h-5.5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Comparison</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 block">LGU Engine</span>
                  <span className="text-xs font-bold text-slate-500 block mt-0.5">Municipal Data Comparison</span>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed font-medium">
                    Compare Capiz towns dynamically based on live PSA and DTI indicators.
                  </p>
                </div>
                <Link 
                  to={PATHS.PORTAL.COMPARISON_TOOL}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#746006] hover:underline pt-2 w-fit"
                >
                  <span>Launch comparison engine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

            {/* Split Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
              
              {/* Left Panel: Featured Opportunities */}
              <div className="lg:col-span-6 bg-white border border-slate-200/60 rounded-3xl p-6 space-y-4.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Featured High-Yield Projects</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Opportunities with estimated ROI ≥ 14%</p>
                  </div>
                  <Link to={PATHS.PORTAL.INVESTOR_PORTAL} className="text-xs font-bold text-[#002B66] hover:underline inline-flex items-center gap-1">
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-3.5">
                  {highRoiOpps.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
                      No featured high-ROI opportunities registered yet.
                    </div>
                  ) : (
                    highRoiOpps.map((opp) => (
                      <div 
                        key={opp.id} 
                        className="flex items-start gap-4 p-3.5 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                          {opp.image_path ? (
                            <img 
                              src={opp.image_path.startsWith("http") ? opp.image_path : `http://localhost:8000${opp.image_path}`}
                              alt={opp.project_name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                              <Building className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 w-full min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-slate-900 text-xs truncate leading-snug">{opp.project_name}</h4>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-black shrink-0 border border-emerald-100">
                              {opp.roi_estimate}% ROI
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-450 line-clamp-2 leading-relaxed">
                            {opp.description}
                          </p>
                          <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider pt-1">
                            <span className="text-[#746006]">{opp.category?.name || "Agri-Industrial"}</span>
                            <span>•</span>
                            <span>{opp.location || "Capiz"}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Panel: Recent MSME Requests */}
              <div className="lg:col-span-6 bg-white border border-slate-200/60 rounded-3xl p-6 space-y-4.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Recent Assistance Folder</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Your business requests submission history</p>
                  </div>
                  <Link to={PATHS.PORTAL.MSME_ASSISTANCE} className="text-xs font-bold text-[#002B66] hover:underline inline-flex items-center gap-1">
                    <span>File New Request</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {msmeRequests.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center p-6 text-slate-450">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-bold mt-2">No Assistance Requests Filed</p>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] text-center">
                        Need regulatory clearances or LGU endorsement? Submit a request file now.
                      </p>
                    </div>
                  ) : (
                    msmeRequests.slice(0, 3).map((req) => (
                      <div 
                        key={req.id} 
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all text-xs"
                      >
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-900 line-clamp-1">{req.company_name}</p>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase">
                            <span>{req.classification}</span>
                            <span>•</span>
                            <span>{req.created_at ? new Date(req.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 border ${
                          req.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : req.status === "Submitted"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-indigo-50 text-indigo-700 border-indigo-100"
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Profile Detail Block */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-4 animate-in fade-in duration-500">
              <div className="border-b border-slate-100 pb-3.5">
                <h3 className="text-base font-extrabold text-slate-900">Account Credentials</h3>
                <p className="text-[10px] text-slate-400 font-medium">Verify your registered economic profile data</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-xs text-left">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Full Name</span>
                  <span className="font-extrabold text-slate-900 text-sm block">{clientUser.fullname}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Email Address</span>
                  <span className="font-extrabold text-slate-900 text-sm block truncate">{clientUser.email}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Portal User ID</span>
                  <span className="font-extrabold text-slate-900 text-sm block">#{clientUser.id}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Account Role</span>
                  <span className="font-extrabold text-[#E2B714] text-sm block uppercase tracking-widest">{clientUser.role || "User"}</span>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </ClientMainLayout>
  );
};

export default UserDashboard;
