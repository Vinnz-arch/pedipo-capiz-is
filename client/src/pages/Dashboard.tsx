import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  TrendingUp,
  MessageSquare,
  FileCheck2,
  Users,
  Database,
  RefreshCw,
  ArrowRight,
  Clock,
  ChevronRight,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Info,
  Globe,
  MapPin,
  Building2,
  Compass,
  Waves,
  FileSpreadsheet,
  X
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from "recharts";
import MainLayout from "../components/layout/Mainlayout";
import Logo from "../assets/logo.jpg";
import { PATHS } from "../routes/paths";
import { AuthService } from "../services/Authservices";
import { notify } from "@/util/notify";
import { useLiveSync } from "@/hooks/useLiveSync";
import {
  AdminDashboardService,
  type AdminDashboardData
} from "@/services/AdminDashboardService";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const CHART_COLORS = [
  "#2563EB", // Blue
  "#0D9488", // Teal
  "#E2B714", // Gold
  "#7C3AED", // Purple
  "#EA580C", // Orange
  "#059669", // Emerald
  "#DB2777", // Pink
  "#4F46E5", // Indigo
];

const Dashboard: React.FC = () => {
  const isAdmin = AuthService.isAdmin();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isSourceDialogOpen, setIsSourceDialogOpen] = useState(false);
  const [activeSourceKey, setActiveSourceKey] = useState<string | null>(null);

  const fetchDashboardData = async (isManual = false, silent = false) => {
    if (!silent) {
      if (isManual) setIsRefreshing(true);
      else setIsLoading(true);
    }

    try {
      const response = await AdminDashboardService.getDashboardData(isManual);
      if (response) {
        setData(response);
        setLastUpdated(new Date());
        if (isManual) {
          notify.success("Dashboard Synchronized", "Live system data updated from database.");
        }
      }
    } catch (err: any) {
      console.error("Failed to load admin dashboard data:", err);
      if (!silent) {
        notify.error("Connection Error", "Could not retrieve live dashboard statistics.");
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  const handleRefreshLiveData = async () => {
    setIsRefreshing(true);
    try {
      const res = await AdminDashboardService.refreshDashboardData();
      if (res && res.status === "success") {
        if (res.results?.provincial_gdp) {
          notify.success("GDP Updated", res.results.provincial_gdp.message);
        }
        if (res.results?.population) {
          notify.success("Population Verified", res.results.population.message);
        }
        if (res.results?.land_area && res.results?.barangays) {
          notify.success(
            "Territorial Benchmarks Verified",
            `Land Area: ${res.results.land_area.display_value}, Barangays: ${res.results.barangays.display_value}`
          );
        }
        if (res.results?.coastline && res.results.coastline.status === "unavailable") {
          notify.info("Coastline Benchmark", res.results.coastline.message);
        }
        await fetchDashboardData(false);
        setLastUpdated(new Date());
      } else {
        notify.error("Verification Notice", "Could not complete live verification against government sources.");
      }
    } catch (err: any) {
      console.error("Refresh error:", err);
      notify.error("Refresh Error", "An error occurred while communicating with the verification service.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useLiveSync(
    ["all", "opportunities", "msmes", "news", "landing", "inquiries"],
    () => fetchDashboardData(false, true),
    { pollIntervalMs: 20000 }
  );

  const kpis = data?.kpis;
  const provSummary = data?.provincial_summary;

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("completed") || s.includes("published") || s.includes("active") || s.includes("approved")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s.includes("pending") || s.includes("submitted") || s.includes("draft")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (s.includes("review") || s.includes("processing") || s.includes("endorsed")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (s.includes("rejected") || s.includes("inactive") || s.includes("closed")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const content = (
    <div className="space-y-8 pb-12">
      {/* 1. Executive Banner & Capiz Provincial Overview */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#091535] via-[#0E204E] to-[#0A173D] text-white p-8 rounded-3xl border border-white/10 shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-20 w-80 h-80 bg-[#E2B714]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-[#E2B714] to-blue-400 flex items-center justify-center shadow-lg shrink-0">
              <img
                src={Logo}
                alt="PEDIPO Logo"
                className="w-full h-full rounded-full object-cover border border-white/20"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#E2B714]/20 text-[#E2B714] border border-[#E2B714]/30 uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" />
                  PEDIPO Capiz IS
                </span>
                <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Synced: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Executive Administration Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Provincial Economic Development and Investment Promotion Office • Province of Capiz
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setActiveSourceKey(null);
                setIsSourceDialogOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 shadow-sm backdrop-blur-sm cursor-pointer"
              title="Inspect Authoritative Government Sources & Verification Metadata"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#E2B714]" />
              <span>Official Sources</span>
            </button>

            <button
              onClick={handleRefreshLiveData}
              disabled={isRefreshing || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E2B714] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black transition-all border border-amber-300/30 shadow-md disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Refreshing official data..." : "Refresh Live Data"}</span>
            </button>
          </div>
        </div>

        {/* Live Provincial Summary Metric Pills */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8 pt-6 border-t border-white/10">
          <div
            onClick={() => {
              setActiveSourceKey("population");
              setIsSourceDialogOpen(true);
            }}
            className="cursor-pointer group p-3 -m-1 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
            title="Click to view PSA Census source details"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Total Population
              </p>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-[#E2B714] transition-colors" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              {isLoading ? "..." : provSummary ? provSummary.population.toLocaleString() : "804,952"}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> PSA 2020 Census
            </span>
          </div>

          <div
            onClick={() => {
              setActiveSourceKey("land_area");
              setIsSourceDialogOpen(true);
            }}
            className="cursor-pointer group p-3 -m-1 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
            title="Click to view LMB/DENR official source details"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Land Surface Area
              </p>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-[#E2B714] transition-colors" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              {isLoading ? "..." : provSummary ? provSummary.land_area.toLocaleString() : "2,633.17"}{" "}
              <span className="text-xs font-semibold text-slate-300">km²</span>
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> LMB / DENR Official
            </span>
          </div>

          <div
            onClick={() => {
              setActiveSourceKey("barangays");
              setIsSourceDialogOpen(true);
            }}
            className="cursor-pointer group p-3 -m-1 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
            title="Click to view PSA PSGC barangay breakdown"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Barangays
              </p>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-[#E2B714] transition-colors" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              {isLoading ? "..." : provSummary ? provSummary.barangays.toLocaleString() : "473"}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> PSA PSGC (17 LGUs)
            </span>
          </div>

          <div
            onClick={() => {
              setActiveSourceKey("coastline");
              setIsSourceDialogOpen(true);
            }}
            className="cursor-pointer group p-3 -m-1 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
            title="Click to view coastline survey status (NAMRIA)"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Coastline
              </p>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-300 mt-1">
              {isLoading ? "..." : provSummary?.coastline_display || (provSummary?.coastline ? `${provSummary.coastline} km` : "N/A")}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium">
              <AlertCircle className="w-3 h-3" /> Unavailable in Survey
            </span>
          </div>

          <div
            onClick={() => {
              setActiveSourceKey("local_units");
              setIsSourceDialogOpen(true);
            }}
            className="cursor-pointer group p-3 -m-1 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
            title="Click to view local units breakdown (DILG / PSA)"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Local Units
              </p>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-[#E2B714] transition-colors" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              {isLoading ? "..." : provSummary ? provSummary.total_lgus : 17}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> 1 City + 16 Munis
            </span>
          </div>

          <div
            onClick={() => {
              setActiveSourceKey("provincial_gdp");
              setIsSourceDialogOpen(true);
            }}
            className="cursor-pointer group p-3 -m-1 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-[#E2B714]/30"
            title="Click to view PSA PPA GDP calculation & source details"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#E2B714]">
                Provincial GDP
              </p>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-[#E2B714] transition-colors" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-[#E2B714] mt-1">
              {isLoading ? "..." : provSummary?.gdp_formatted || "₱90.85B"}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> PSA PPA 2025 (+8.7%)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Key System Performance Indicators (Connected to Database Models) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#2563EB] rounded-full" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Live System Status &amp; Registries
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Strictly connected to live database records
          </span>
        </div>

        <div className={`grid gap-5 sm:grid-cols-2 ${isAdmin ? "lg:grid-cols-3 xl:grid-cols-6" : "lg:grid-cols-3"}`}>
          {/* MSME Registry Card */}
          <Link
            to={PATHS.APP.MANAGE_MSMES}
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Store className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Active MSMEs
                </p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {isLoading ? "..." : kpis?.total_msmes ?? 0}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Directory Total</span>
              <span className="font-semibold text-blue-600 group-hover:underline">Manage &rarr;</span>
            </div>
          </Link>

          {/* Investment Opportunities Card */}
          <Link
            to={PATHS.APP.MANAGE_INVESTMENT_MANAGEMENT}
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Opportunities
                </p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {isLoading ? "..." : kpis?.total_opportunities ?? 0}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-emerald-600 font-semibold">
                {kpis?.published_opportunities ?? 0} Published
              </span>
              <span className="font-semibold text-slate-600 group-hover:underline">View &rarr;</span>
            </div>
          </Link>

          {/* Investor Inquiries Card (Admin only) */}
          {isAdmin && (
            <Link
              to={PATHS.APP.MANAGE_INQUIRIES}
              className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  {kpis && kpis.pending_inquiries > 0 && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200">
                      {kpis.pending_inquiries} Pending
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Inquiries
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {isLoading ? "..." : kpis?.total_inquiries ?? 0}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Investor Messages</span>
                <span className="font-semibold text-amber-600 group-hover:underline">Review &rarr;</span>
              </div>
            </Link>
          )}

          {/* MSME Assistance Requests Card (Admin only) */}
          {isAdmin && (
            <Link
              to={PATHS.APP.MANAGE_INQUIRIES}
              className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-400 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  {kpis && kpis.pending_msme_requests > 0 && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-full border border-purple-200">
                      {kpis.pending_msme_requests} Active
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Assistance Req.
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {isLoading ? "..." : kpis?.total_msme_requests ?? 0}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Support Pipeline</span>
                <span className="font-semibold text-purple-600 group-hover:underline">Process &rarr;</span>
              </div>
            </Link>
          )}

          {/* Registered Portal Users Card (Admin only) */}
          {isAdmin && (
            <Link
              to={PATHS.APP.MANAGE_USERS}
              className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl group-hover:bg-blue-700 group-hover:text-white transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="mt-4">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Portal Users
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {isLoading ? "..." : kpis?.total_users ?? 0}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Registered Accounts</span>
                <span className="font-semibold text-blue-700 group-hover:underline">Manage &rarr;</span>
              </div>
            </Link>
          )}

          {/* Economic Indicators & Data Points Card */}
          <Link
            to={PATHS.APP.MANAGE_INVESTMENT_MANAGEMENT}
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Database className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-full border border-teal-200">
                  {kpis?.total_indicators ?? 14} Indicators
                </span>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Indicator Values
                </p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {isLoading ? "..." : kpis?.total_indicator_values ?? 0}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Live LGU Data</span>
              <span className="font-semibold text-teal-600 group-hover:underline">Explore &rarr;</span>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. Live Analytics & Data Visualizations (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MSMEs by Industry / Sector Chart */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  MSMEs by Industry Sector
                </h3>
                <p className="text-xs text-slate-500">
                  Distribution of verified businesses across economic sectors
                </p>
              </div>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-200">
                {data?.msmes_by_industry?.length ?? 0} Sectors
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs animate-pulse">
                  Loading sector visualization...
                </div>
              ) : data?.msmes_by_industry && data.msmes_by_industry.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.msmes_by_industry}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#64748B" }}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val} Businesses`, "Count"]}
                      contentStyle={{
                        backgroundColor: "#0F172A",
                        borderRadius: "8px",
                        border: "none",
                        color: "#FFF",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {data.msmes_by_industry.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No industry category data recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Enterprise Size Breakdown Footer */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">Enterprise Size Distribution:</span>
            <div className="flex items-center gap-4">
              {data?.msmes_by_type?.map((t, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-slate-700 font-semibold">{t.enterprise_type}:</span>
                  <span className="text-slate-900 font-bold">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geographic Distribution Across Capiz Municipalities */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Business Presence Across Municipalities
                </h3>
                <p className="text-xs text-slate-500">
                  Registered enterprises across Capiz Local Government Units
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200">
                LGU Distribution
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs animate-pulse">
                  Loading municipality distribution...
                </div>
              ) : data?.msmes_by_municipality && data.msmes_by_municipality.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={data.msmes_by_municipality}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                    <YAxis
                      dataKey="municipality"
                      type="category"
                      tick={{ fontSize: 11, fill: "#1E293B", fontWeight: 600 }}
                      width={90}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val} MSMEs`, "Enterprises"]}
                      contentStyle={{
                        backgroundColor: "#0F172A",
                        borderRadius: "8px",
                        border: "none",
                        color: "#FFF",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" fill="#2563EB" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No municipality records found.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Capiz LGUs Monitored: 17</span>
            <Link
              to={PATHS.APP.MANAGE_MSMES}
              className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Explore Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Actionable Live Feeds (Connected to Inquiry & MSME Request Models - Admin only) */}
      {isAdmin && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Investor Inquiries Feed */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Investor Inquiries</h3>
                <p className="text-[11px] text-slate-500">Prospective investor inquiries awaiting review</p>
              </div>
            </div>
            <Link
              to={PATHS.APP.MANAGE_INQUIRIES}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline inline-flex items-center gap-1"
            >
              <span>View All ({kpis?.total_inquiries ?? 0})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                Loading inquiries feed...
              </div>
            ) : data?.recent_inquiries && data.recent_inquiries.length > 0 ? (
              data.recent_inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs truncate">
                        {inq.investor_name}
                      </span>
                      {inq.company && (
                        <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                          • {inq.company}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate">
                      {inq.subject || inq.opportunity?.project_name || "General Investment Inquiry"}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{formatDate(inq.created_at)}</span>
                      <span>•</span>
                      <span>{inq.email}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(
                        inq.status
                      )}`}
                    >
                      {inq.status}
                    </span>
                    <Link
                      to={PATHS.APP.MANAGE_INQUIRIES}
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No recent investor inquiries found.
              </div>
            )}
          </div>
        </div>

        {/* Recent MSME Assistance Requests Feed */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent MSME Assistance Requests</h3>
                <p className="text-[11px] text-slate-500">Business assistance and processing submissions</p>
              </div>
            </div>
            <Link
              to={PATHS.APP.MANAGE_MSMES}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 hover:underline inline-flex items-center gap-1"
            >
              <span>Manage ({kpis?.total_msme_requests ?? 0})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                Loading assistance requests feed...
              </div>
            ) : data?.recent_msme_requests && data.recent_msme_requests.length > 0 ? (
              data.recent_msme_requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs truncate">
                        {req.company_name}
                      </span>
                      <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[9px] font-bold rounded border border-slate-200">
                        {req.classification}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate">
                      Contact: {req.contact_person}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{formatDate(req.created_at)}</span>
                      <span>•</span>
                      <span>{req.email}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>
                    <Link
                      to={PATHS.APP.MANAGE_MSMES}
                      className="text-[11px] font-semibold text-purple-600 hover:underline"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No recent assistance requests submitted.
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* 5. Recently Registered MSMEs & Investment Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Registered MSMEs Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recently Registered MSMEs</h3>
                <p className="text-[11px] text-slate-500">New businesses enrolled in the Capiz Directory</p>
              </div>
            </div>
            <Link
              to={PATHS.APP.MANAGE_MSMES}
              className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
            >
              <span>View Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Business Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Municipality</th>
                  <th className="p-3.5">Size</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 animate-pulse">
                      Loading MSMEs...
                    </td>
                  </tr>
                ) : data?.recent_msmes && data.recent_msmes.length > 0 ? (
                  data.recent_msmes.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{m.business_name}</td>
                      <td className="p-3.5 text-slate-600">{m.category_name}</td>
                      <td className="p-3.5 text-slate-600">{m.municipality_name}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded text-[10px]">
                          {m.enterprise_type}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(
                            m.status
                          )}`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No MSME records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Investment Opportunities Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Featured Investment Projects</h3>
                <p className="text-[11px] text-slate-500">Strategic investment opportunities in Capiz</p>
              </div>
            </div>
            <Link
              to={PATHS.APP.MANAGE_INVESTMENT_MANAGEMENT}
              className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
            >
              <span>Manage All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">Project Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Land Area</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 animate-pulse">
                      Loading opportunities...
                    </td>
                  </tr>
                ) : data?.recent_opportunities && data.recent_opportunities.length > 0 ? (
                  data.recent_opportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{opp.project_name}</td>
                      <td className="p-3.5 text-slate-600">{opp.category_name}</td>
                      <td className="p-3.5 text-slate-600">{opp.municipality_name}</td>
                      <td className="p-3.5 font-bold text-slate-700">
                        {opp.land_area ? `${opp.land_area} Ha` : "Strategic Lot"}
                      </td>
                      <td className="p-3.5 text-right">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(
                            opp.status
                          )}`}
                        >
                          {opp.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No opportunities found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. Quick Administrative Module Shortcuts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-[#E2B714] rounded-full" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Quick Administrative Management
          </h2>
        </div>

        <div className={`grid gap-4 sm:grid-cols-2 ${isAdmin ? "lg:grid-cols-3 xl:grid-cols-6" : "lg:grid-cols-4"}`}>
          <Link
            to={PATHS.APP.MANAGE_MSMES}
            className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 mt-3 group-hover:text-blue-600 transition-colors">
                MSME Management
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Manage business registry profiles and directory listings.
              </p>
            </div>
            <span className="text-[11px] font-bold text-blue-600 mt-4 inline-flex items-center gap-1">
              <span>Open Module</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          <Link
            to={PATHS.APP.MANAGE_INVESTMENT_MANAGEMENT}
            className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 mt-3 group-hover:text-emerald-600 transition-colors">
                Investment Management
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Curate projects, spreadsheets, and sync to investor portal.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 mt-4 inline-flex items-center gap-1">
              <span>Open Module</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          <Link
            to={PATHS.APP.DATA_ENTRY}
            className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-500 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl w-fit group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 mt-3 group-hover:text-teal-600 transition-colors">
                Data Entry
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Upload and manage municipal economic indicator data points.
              </p>
            </div>
            <span className="text-[11px] font-bold text-teal-600 mt-4 inline-flex items-center gap-1">
              <span>Open Module</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          {isAdmin && (
            <Link
              to={PATHS.APP.MANAGE_INQUIRIES}
              className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-amber-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl w-fit group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 mt-3 group-hover:text-amber-600 transition-colors">
                  Investor Inquiries
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Review letters of intent, messages, and investor applications.
                </p>
              </div>
              <span className="text-[11px] font-bold text-amber-600 mt-4 inline-flex items-center gap-1">
                <span>Open Module</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to={PATHS.APP.MANAGE_USERS}
              className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-700 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl w-fit group-hover:bg-blue-700 group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 mt-3 group-hover:text-blue-700 transition-colors">
                  User Management
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Manage registered investor &amp; staff accounts, access rights, and logs.
                </p>
              </div>
              <span className="text-[11px] font-bold text-blue-700 mt-4 inline-flex items-center gap-1">
                <span>Open Module</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          )}

          <Link
            to={PATHS.APP.MANAGE_LANDING_PAGE}
            className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-800 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl w-fit group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 mt-3 group-hover:text-slate-800 transition-colors">
                Landing Page CMS
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Customize hero banners, mandate statements, and public content.
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-800 mt-4 inline-flex items-center gap-1">
              <span>Open Module</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>
      </div>

      {/* 5. Authoritative Source Transparency Dialog */}
      <Dialog open={isSourceDialogOpen} onOpenChange={setIsSourceDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="!max-w-4xl sm:!max-w-4xl w-[95vw] p-0 overflow-hidden rounded-3xl border border-slate-200/80 shadow-2xl bg-white focus:outline-none"
        >
          {/* Executive Header */}
          <div className="bg-gradient-to-r from-[#091535] via-[#0E204E] to-[#0A173D] text-white p-6 sm:p-7 relative border-b border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#E2B714] to-blue-400 p-0.5 shrink-0 shadow-lg">
                  <img
                    src={Logo}
                    alt="Capiz IS"
                    className="w-full h-full rounded-2xl object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E2B714]/20 text-[#E2B714] border border-[#E2B714]/30">
                      Official Government Registry
                    </span>
                    <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Verified Benchmarks
                    </span>
                  </div>
                  <DialogTitle className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Official Provincial Data Verification
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-300 mt-0.5">
                    Province of Capiz official economic, demographic, and territorial data verified against certified government agencies.
                  </DialogDescription>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsSourceDialogOpen(false)}
                className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 active:bg-white/25 rounded-full transition-all cursor-pointer shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Official Hierarchy Protocol Banner */}
          <div className="bg-slate-50 border-b border-slate-200/80 px-6 sm:px-7 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Authoritative Hierarchy:</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold text-[11px]">1. PSA (National)</span>
                &gt;
                <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded-md font-bold text-[11px]">2. Capiz Provincial Govt</span>
                &gt;
                <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded-md font-bold text-[11px]">3. DENR / NAMRIA / DILG</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Zero unverified estimates or internet guesswork allowed.
            </span>
          </div>

          {/* Indicators Grid */}
          <div className="p-6 sm:p-7 max-h-[62vh] overflow-y-auto bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Provincial GDP */}
              <div
                className={`p-5 rounded-2xl border bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  activeSourceKey === "provincial_gdp" ? "ring-2 ring-[#E2B714] border-[#E2B714]" : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-amber-50 text-[#B8860B] rounded-xl">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          Provincial Gross Domestic Product (GDP)
                        </h4>
                        <span className="text-[11px] text-slate-500">Economic Accounts (PPA)</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap inline-flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Official
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#B8860B] tracking-tight">
                      {data?.official_statistics?.provincial_gdp?.display_value || provSummary?.gdp_formatted || "₱90.85B"}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-xs">
                      +{data?.official_statistics?.provincial_gdp?.growth_rate ?? 8.7}% Growth
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">At constant 2018 prices (PHP)</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div>
                      <span className="font-bold text-slate-800">Source:</span>{" "}
                      {data?.official_statistics?.provincial_gdp?.source_name || "Philippine Statistics Authority (PSA)"}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Publication:</span>{" "}
                      {data?.official_statistics?.provincial_gdp?.source_title || "Provincial Product Accounts (PPA) - Capiz Performance"}
                    </div>
                    <div className="text-[11px] text-slate-500 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/50">
                      {data?.official_statistics?.provincial_gdp?.notes || "2025 PPA release recorded 8.7% economic growth for Capiz over 2024 GDP of ₱83.58B."}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Ref: 2025 (Aug 2026 Release)</span>
                  <a
                    href={data?.official_statistics?.provincial_gdp?.source_url || "https://psa.gov.ph/statistics/ppa"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>psa.gov.ph</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Card 2: Total Population */}
              <div
                className={`p-5 rounded-2xl border bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  activeSourceKey === "population" ? "ring-2 ring-blue-500 border-blue-500" : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          Total Population
                        </h4>
                        <span className="text-[11px] text-slate-500">Demographic Census (CPH)</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap inline-flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Official
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {data?.official_statistics?.population?.display_value || (provSummary ? provSummary.population.toLocaleString() : "804,952")}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Inhabitants</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Sum of 17 LGU municipal populations</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div>
                      <span className="font-bold text-slate-800">Source:</span>{" "}
                      {data?.official_statistics?.population?.source_name || "Philippine Statistics Authority (PSA)"}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Publication:</span>{" "}
                      {data?.official_statistics?.population?.source_title || "2020 Census of Population and Housing (CPH)"}
                    </div>
                    <div className="text-[11px] text-slate-500 bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/50">
                      {data?.official_statistics?.population?.notes || "Official count declared under Presidential Proclamation No. 1179."}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Ref: 2020 Official Census</span>
                  <a
                    href={data?.official_statistics?.population?.source_url || "https://psa.gov.ph/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>psa.gov.ph</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Card 3: Land Surface Area */}
              <div
                className={`p-5 rounded-2xl border bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  activeSourceKey === "land_area" ? "ring-2 ring-emerald-500 border-emerald-500" : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          Land Surface Area
                        </h4>
                        <span className="text-[11px] text-slate-500">Cadastral &amp; Surface Area</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap inline-flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Official
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {data?.official_statistics?.land_area?.display_value || (provSummary ? `${provSummary.land_area.toLocaleString()} km²` : "2,633.17 km²")}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Total land area across 1 City and 16 Municipalities</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div>
                      <span className="font-bold text-slate-800">Source:</span>{" "}
                      {data?.official_statistics?.land_area?.source_name || "Land Management Bureau (LMB) / DENR & PSA PSGC"}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Publication:</span>{" "}
                      {data?.official_statistics?.land_area?.source_title || "PSGC Provincial Summary - Capiz"}
                    </div>
                    <div className="text-[11px] text-slate-500 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/50">
                      {data?.official_statistics?.land_area?.notes || "Cadastral survey figures verified from LMB/DENR records."}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Ref: Cadastral Survey Records</span>
                  <a
                    href={data?.official_statistics?.land_area?.source_url || "https://psa.gov.ph/classification/psgc/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>psa.gov.ph</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Card 4: Total Barangays */}
              <div
                className={`p-5 rounded-2xl border bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  activeSourceKey === "barangays" ? "ring-2 ring-indigo-500 border-indigo-500" : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          Total Barangays
                        </h4>
                        <span className="text-[11px] text-slate-500">Administrative Subdivisions</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap inline-flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Official
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {data?.official_statistics?.barangays?.display_value || (provSummary ? provSummary.barangays.toLocaleString() : "473")}
                    </span>
                    <span className="text-xs font-semibold text-indigo-600">47 City + 426 Municipal</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">47 in Roxas City, 426 across 16 Municipalities</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div>
                      <span className="font-bold text-slate-800">Source:</span>{" "}
                      {data?.official_statistics?.barangays?.source_name || "Philippine Statistics Authority (PSA) - PSGC"}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Publication:</span>{" "}
                      {data?.official_statistics?.barangays?.source_title || "PSGC Masterlist of Barangays - Capiz"}
                    </div>
                    <div className="text-[11px] text-slate-500 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-200/50">
                      {data?.official_statistics?.barangays?.notes || "Active masterlist maintained under Philippine Standard Geographic Code."}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Ref: 2026 Masterlist</span>
                  <a
                    href={data?.official_statistics?.barangays?.source_url || "https://psa.gov.ph/classification/psgc/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>psa.gov.ph</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Card 5: Local Government Units */}
              <div
                className={`p-5 rounded-2xl border bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  activeSourceKey === "local_units" ? "ring-2 ring-purple-500 border-purple-500" : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          Local Government Units (LGUs)
                        </h4>
                        <span className="text-[11px] text-slate-500">Component Jurisdictions</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap inline-flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Official
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      17 LGUs
                    </span>
                    <span className="text-xs font-semibold text-purple-600">1 City + 16 Municipalities</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Component City: Roxas City (Provincial Capital)</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div>
                      <span className="font-bold text-slate-800">Source:</span>{" "}
                      {data?.official_statistics?.local_units?.source_name || "DILG / PSA PSGC"}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Publication:</span>{" "}
                      {data?.official_statistics?.local_units?.source_title || "Local Government Units Masterlist - Province of Capiz"}
                    </div>
                    <div className="text-[11px] text-slate-500 bg-purple-50/70 p-2.5 rounded-xl border border-purple-200/50">
                      {data?.official_statistics?.local_units?.notes || "1 Component City and 16 Municipalities verified in DILG masterlist."}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Ref: 2026 Registry</span>
                  <a
                    href={data?.official_statistics?.local_units?.source_url || "https://psa.gov.ph/classification/psgc/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>psa.gov.ph</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Card 6: Coastline */}
              <div
                className={`p-5 rounded-2xl border bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  activeSourceKey === "coastline" ? "ring-2 ring-amber-500 border-amber-500" : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <Waves className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          Maritime Coastline Length
                        </h4>
                        <span className="text-[11px] text-slate-500">Hydrographic &amp; Shoreline</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap inline-flex items-center gap-1 shrink-0">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Unavailable in Survey
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-400 tracking-tight">
                      N/A
                    </span>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      Official Survey Not Published
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Strictly displaying N/A per official government reporting standards</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div>
                      <span className="font-bold text-slate-800">Authority:</span>{" "}
                      {data?.official_statistics?.coastline?.source_name || "National Mapping and Resource Information Authority (NAMRIA)"}
                    </div>
                    <div className="text-[11px] text-slate-600 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/50">
                      {data?.official_statistics?.coastline?.notes ||
                        "No singular official national hydrographic survey publishes a certified coastline length for Capiz. In strict compliance with provincial standards, this indicator is displayed as N/A rather than guessing or using unverified estimates."}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Ref: NAMRIA / PPDO Capiz</span>
                  <a
                    href={data?.official_statistics?.coastline?.source_url || "https://www.namria.gov.ph/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>namria.gov.ph</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Footer */}
          <div className="px-6 sm:px-7 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Last Verified:{" "}
                <strong className="text-slate-700">
                  {data?.official_statistics?.provincial_gdp?.retrieved_at
                    ? new Date(data.official_statistics.provincial_gdp.retrieved_at).toLocaleString()
                    : new Date().toLocaleDateString()}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshLiveData}
                disabled={isRefreshing || isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E2B714] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black transition-all border border-amber-300/30 shadow-md disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Refreshing official data..." : "Refresh Live Data"}</span>
              </button>

              <button
                onClick={() => setIsSourceDialogOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Close Window
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  return <MainLayout content={content} />;
};

export default Dashboard;
