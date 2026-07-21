import React, { useState, useEffect } from "react";
import ClientMainLayout from "@/components/client-portal/ClientMainLayout";
import { 
  Building2, 
  Search, 
  TrendingUp, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  X,
  Info,
  SlidersHorizontal,
  ArrowUpRight,
  RefreshCw
} from "lucide-react";
import { ApiHandler } from "@/api/ApiHandler";
import { notify } from "@/util/notify";
import { InquiryService } from "@/services/InquiryService";

interface CategoryData {
  id: number;
  name: string;
}

interface OpportunityData {
  id: number | string;
  project_name: string;
  category_id: number;
  category?: CategoryData;
  roi_estimate?: number | string;
  land_area?: number | string;
  key_incentives?: string;
  description?: string;
  incentive_package?: string;
  image_path?: string;
  status: string;
}

export const InvestorPortal: React.FC = () => {
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Inquiry Modal State
  const [inquiryModalProject, setInquiryModalProject] = useState<OpportunityData | null>(null);
  const [investorName, setInvestorName] = useState("");
  const [investorEmail, setInvestorEmail] = useState("");
  const [investorCompany, setInvestorCompany] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

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
      const res = await ApiHandler.get<{ opportunities: OpportunityData[]; categories: CategoryData[] }>(
        "/v1/portal/opportunities"
      );
      if (res.opportunities) {
        setOpportunities(res.opportunities);
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
    const clientUser = JSON.parse(localStorage.getItem("client_user") || "{}");
    setInvestorName(clientUser.fullname || "");
    setInvestorEmail(clientUser.email || "");
    setInvestorCompany("");
    setInquiryMessage(`Hello, I am interested in exploring investment opportunities for ${opp.project_name}. Please send further project proposals and feasibility data.`);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investorName || !investorEmail) return;

    setIsSubmittingInquiry(true);
    try {
      await InquiryService.submit({
        opportunity_id: inquiryModalProject?.id,
        investor_name: investorName.trim(),
        email: investorEmail.trim(),
        company: investorCompany.trim() || undefined,
        message: inquiryMessage.trim(),
      });
      setInquiryModalProject(null);
    } catch (error) {
      console.error("Failed to submit inquiry:", error);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  // Filter Logic
  const filteredOpportunities = opportunities.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category?.name === selectedCategory;
    const matchesSearch =
      item.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <ClientMainLayout>
      <div className="space-y-8 pb-12 font-sans">
        {/* Hero Banner Section */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#002B66] via-[#001D47] to-[#0B2545] p-8 md:p-12 text-white overflow-hidden shadow-xl border border-blue-900/40">
          <div className="absolute -right-12 -bottom-12 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Capiz Economic & Investment Development</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Invest in Capiz: Seafood Capital & Panay Growth Hub
            </h1>
            <p className="text-sm md:text-base text-blue-100/80 leading-relaxed max-w-2xl font-normal">
              Synchronized directly from the Provincial Economic Development and Investment Promotion Office (PEDIPO). Discover verified high-yield projects, priority incentives, and strategic land sites.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-blue-200 font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>PEDIPO Verified Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Priority Local Fiscal Incentives</span>
              </div>
            </div>
          </div>
        </div>

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
          </div>
        </div>

        {/* Opportunities Grid */}
        {isLoading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 font-medium">
            Loading synchronized investor portal listings...
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Opportunities Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no published opportunities matching your search criteria. Check back soon for synchronized updates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opp) => {
              const incentivesList = (opp.key_incentives || opp.incentive_package)
                ? (opp.key_incentives || opp.incentive_package)!.split(",").map(s => s.trim().toUpperCase()).filter(Boolean)
                : ["LOCAL INCENTIVES"];

              return (
                <div
                  key={opp.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Header with Category Badge */}
                    <div className="w-full h-48 relative overflow-hidden bg-slate-100">
                      <img
                        src={resolveImageUrl(opp.image_path)}
                        alt={opp.project_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-[#002B66]/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
                        {opp.category?.name || "General"}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          <span>Roxas City, Capiz</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {opp.project_name}
                        </h3>
                      </div>

                      {/* Financial Metrics */}
                      <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/60">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            EST. ROI
                          </span>
                          <span className="text-base font-extrabold text-[#002B66]">
                            {opp.roi_estimate ? `${opp.roi_estimate}%` : "12.5%"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            LAND AREA
                          </span>
                          <span className="text-base font-extrabold text-[#002B66]">
                            {opp.land_area ? `${opp.land_area} Ha` : "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Key Incentives Badges */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          KEY INCENTIVES
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {incentivesList.map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 uppercase"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {opp.description || opp.incentive_package || "No detailed description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer / Action */}
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => openInquiryModal(opp)}
                      className="w-full bg-[#002B66] hover:bg-[#001D47] text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Inquire Now</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Investment Inquiry Modal */}
        {inquiryModalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col">
              {/* Modal Header */}
              <div className="bg-[#002B66] text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Submit Investment Inquiry</h3>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Project: <span className="font-semibold text-white">{inquiryModalProject.project_name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setInquiryModalProject(null)}
                  className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleInquirySubmit}>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Investor / Representative Name</label>
                    <input
                      type="text"
                      required
                      value={investorName}
                      onChange={(e) => setInvestorName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Email Address</label>
                      <input
                        type="email"
                        required
                        value={investorEmail}
                        onChange={(e) => setInvestorEmail(e.target.value)}
                        placeholder="investor@company.com"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Company / Entity</label>
                      <input
                        type="text"
                        value={investorCompany}
                        onChange={(e) => setInvestorCompany(e.target.value)}
                        placeholder="e.g. Global Logistics Inc."
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Inquiry Message</label>
                    <textarea
                      rows={4}
                      required
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      Your inquiry will be logged into the PEDIPO Capiz IS Inquiry Management registry for official review.
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setInquiryModalProject(null)}
                    className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingInquiry}
                    className="bg-[#002B66] hover:bg-[#001D47] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingInquiry ? "Sending Inquiry..." : "Submit Inquiry"}</span>
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

export default InvestorPortal;
