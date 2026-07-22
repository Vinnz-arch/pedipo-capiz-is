import React, { useState, useEffect } from "react";
import ClientMainLayout from "@/components/client-portal/ClientMainLayout";
import { 
  Building2, 
  Search, 
  MapPin, 
  Send, 
  X,
  Info,
  ArrowUpRight,
  RefreshCw,
  Check,
  ArrowLeft,
  ArrowRight,
  FileText,
  FolderOpen,
  Upload,
  Trash2
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
  location?: string;
}

export const InvestorPortal: React.FC = () => {
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Inquiry Modal State & Wizard
  const [inquiryModalProject, setInquiryModalProject] = useState<OpportunityData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Investor Info
  const [investorName, setInvestorName] = useState("");
  const [investorEmail, setInvestorEmail] = useState("");
  const [investorCompany, setInvestorCompany] = useState("");
  const [investorPhone, setInvestorPhone] = useState("");
  const [investorAddress, setInvestorAddress] = useState("");

  // Step 2: Opportunity Details
  const [investorSubject, setInvestorSubject] = useState("");
  const [inquiryPurpose, setInquiryPurpose] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");

  // Step 3: Document Uploads (Simulated in local state)
  const [letterOfIntentFile, setLetterOfIntentFile] = useState<File | null>(null);
  const [supportingDocsFile, setSupportingDocsFile] = useState<File | null>(null);

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
    setCurrentStep(1);
    const clientUser = JSON.parse(localStorage.getItem("client_user") || "{}");
    setInvestorName(clientUser.fullname || "");
    setInvestorEmail(clientUser.email || "");
    setInvestorCompany("");
    setInvestorPhone("");
    setInvestorAddress("");
    setInvestorSubject(`Inquiry on ${opp.project_name}`);
    setInquiryPurpose("Partners, Suppliers & Sites");
    setInquiryMessage(`Hello, I am interested in exploring investment opportunities for ${opp.project_name}. Please send further project proposals and feasibility data.`);
    setLetterOfIntentFile(null);
    setSupportingDocsFile(null);
  };

  const isStepValid = (stepNum: number) => {
    if (stepNum === 1) {
      return (
        investorName.trim().length > 0 &&
        investorEmail.trim().length > 0 &&
        investorEmail.includes("@") &&
        investorPhone.trim().length > 0 &&
        investorAddress.trim().length > 0
      );
    }
    if (stepNum === 2) {
      return (
        investorSubject.trim().length > 0 &&
        inquiryPurpose.trim().length > 0 &&
        inquiryMessage.trim().length > 0
      );
    }
    // Step 3 (documents) is optional
    return true;
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      return;
    }
    if (!isStepValid(1) || !isStepValid(2)) {
      notify.error("Validation Error", "Please fill in all required fields before submitting.");
      return;
    }

    setIsSubmittingInquiry(true);
    try {
      const formData = new FormData();
      if (inquiryModalProject?.id) {
        formData.append("opportunity_id", String(inquiryModalProject.id));
      }
      formData.append("investor_name", investorName.trim());
      formData.append("email", investorEmail.trim());
      if (investorCompany.trim()) {
        formData.append("company", investorCompany.trim());
      }
      formData.append("contact_number", investorPhone.trim());
      formData.append("address", investorAddress.trim());
      formData.append("subject", investorSubject.trim());
      formData.append("purpose", inquiryPurpose);
      formData.append("message", inquiryMessage.trim());

      if (letterOfIntentFile) {
        formData.append("letter_of_intent", letterOfIntentFile);
      }
      if (supportingDocsFile) {
        formData.append("supporting_documents", supportingDocsFile);
      }

      const res = await InquiryService.submit(formData);
      
      const date = res.inquiry.created_at ? new Date(res.inquiry.created_at) : new Date();
      const year = date.getFullYear();
      const paddedId = String(res.inquiry.id).padStart(3, "0");
      const requestNum = `#IPS-${year}-${paddedId}`;
      
      notify.success("Inquiry Submitted", `Investment inquiry submitted successfully! Reference: ${requestNum}`);
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
                          <span>{opp.location || "Roxas City, Capiz"}</span>
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
                      className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-[#002B66] to-[#003399] hover:from-[#003399] hover:to-[#002B7F] text-white py-3 px-4 rounded-xl font-extrabold text-xs shadow-md hover:shadow-lg hover:shadow-blue-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="relative z-10">Inquire Now</span>
                      <ArrowUpRight className="w-4 h-4 relative z-10 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Investment Inquiry Wizard Modal */}
        {inquiryModalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col transition-all">
              {/* Wizard Header */}
              <div className="bg-slate-50/80 border-b border-slate-200/80 px-6 py-4 flex flex-col relative">
                <button
                  type="button"
                  onClick={() => setInquiryModalProject(null)}
                  className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-slate-800">Investment Inquiry Wizard</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Step-by-step registration for the PEDIPO Investment Registry.
                  </p>
                </div>

                {/* Progress Stepper Bar */}
                <div className="relative flex items-center justify-between w-full max-w-xl mx-auto mt-6 mb-2">
                  <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -translate-y-1/2" />
                  <div 
                    className="absolute left-0 top-1/2 h-0.5 bg-[#002B66] -translate-y-1/2 transition-all duration-300" 
                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                  />

                  {[
                    { step: 1, label: "Investor Info" },
                    { step: 2, label: "Request Information" },
                    { step: 3, label: "Upload" },
                    { step: 4, label: "Review" }
                  ].map((item) => {
                    const isCompleted = currentStep > item.step;
                    const isActive = currentStep === item.step;

                    return (
                      <div key={item.step} className="relative z-10 flex flex-col items-center">
                        <button
                          type="button"
                          disabled={item.step > currentStep && !isStepValid(currentStep)}
                          onClick={() => {
                            if (item.step < currentStep || isStepValid(currentStep)) {
                              setCurrentStep(item.step);
                            }
                          }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 cursor-pointer ${
                            isCompleted 
                              ? "bg-[#002B66] border-[#002B66] text-white" 
                              : isActive 
                                ? "bg-[#002B66] border-[#002B66] text-white shadow-md shadow-[#002B66]/25" 
                                : "bg-slate-50 border-slate-200 text-slate-400"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-4 h-4 text-white stroke-[3px]" />
                          ) : (
                            <span>{item.step}</span>
                          )}
                        </button>
                        <span 
                          className={`text-[10px] font-bold mt-1.5 transition-all duration-300 ${
                            isActive || isCompleted ? "text-[#002B66]" : "text-slate-400"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleInquirySubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {/* Step 1: Investor Info */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <span className="bg-blue-50 text-[#002B66] font-bold text-xs px-2.5 py-1 rounded-md">Step 1</span>
                        <h4 className="text-sm font-bold text-slate-800">Investor Information</h4>
                      </div>
                      
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={investorName}
                          onChange={(e) => setInvestorName(e.target.value)}
                          placeholder="Juan Dela Cruz"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Company Name (Optional)</label>
                          <input
                            type="text"
                            value={investorCompany}
                            onChange={(e) => setInvestorCompany(e.target.value)}
                            placeholder="Example Corporation"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Contact Number <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={investorPhone}
                            onChange={(e) => setInvestorPhone(e.target.value)}
                            placeholder="+63 9XX XXX XXXX"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-700">Email Address <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          required
                          value={investorEmail}
                          onChange={(e) => setInvestorEmail(e.target.value)}
                          placeholder="juan@example.com"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-700">Address <span className="text-red-500">*</span></label>
                        <textarea
                          rows={3}
                          required
                          value={investorAddress}
                          onChange={(e) => setInvestorAddress(e.target.value)}
                          placeholder="Street, City, Province, Zip Code"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Opportunity Details */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <span className="bg-blue-50 text-[#002B66] font-bold text-xs px-2.5 py-1 rounded-md">Step 2</span>
                        <h4 className="text-sm font-bold text-slate-800">Request Information</h4>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-700">Subject of Inquiry <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={investorSubject}
                          onChange={(e) => setInvestorSubject(e.target.value)}
                          placeholder="e.g. Partnership Request for Processing Hub"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-700">Purpose of Inquiry <span className="text-red-500">*</span></label>
                        <select
                          value={inquiryPurpose}
                          onChange={(e) => setInquiryPurpose(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                        >
                          <option value="Licenses & Permits">Licenses & Permits</option>
                          <option value="Partners, Suppliers & Sites">Partners, Suppliers & Sites</option>
                          <option value="Manpower & Services">Manpower & Services</option>
                          <option value="Business Concerns">Business Concerns</option>
                          <option value="Other Requests">Other Requests</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-700">Message <span className="text-red-500">*</span></label>
                        <textarea
                          rows={4}
                          required
                          value={inquiryMessage}
                          onChange={(e) => setInquiryMessage(e.target.value)}
                          placeholder="Brief message detailing your inquiry..."
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Document Upload */}
                  {currentStep === 3 && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <span className="bg-blue-50 text-[#002B66] font-bold text-xs px-2.5 py-1 rounded-md">Step 3</span>
                        <h4 className="text-sm font-bold text-slate-800">Document Upload</h4>
                      </div>

                      {/* Letter of Intent */}
                      <div className="space-y-2 text-left">
                        <label className="text-xs font-bold text-slate-700 block">Letter of Intent</label>
                        {letterOfIntentFile ? (
                          <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                            <div className="flex items-center gap-3">
                              <FileText className="w-8 h-8 text-[#002B66]" />
                              <div className="text-left">
                                <p className="text-xs font-bold text-slate-800 truncate max-w-[240px] md:max-w-[320px]">{letterOfIntentFile.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{(letterOfIntentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setLetterOfIntentFile(null)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label 
                            htmlFor="loi-file"
                            className="flex items-center justify-between p-4 border-2 border-dashed border-slate-200 hover:border-[#002B66] rounded-xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/10 transition-all group"
                          >
                            <input 
                              id="loi-file"
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setLetterOfIntentFile(e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                            <div className="flex items-center gap-3.5">
                              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100/60 transition-colors">
                                <FileText className="w-6 h-6 text-[#002B66]" />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-bold text-slate-800 group-hover:text-[#002B66] transition-colors">Letter of Intent</p>
                                <p className="text-[10px] text-slate-400 font-medium">Formal signed letter (PDF, Max 10MB)</p>
                              </div>
                            </div>
                            <div className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg border border-slate-200/80">
                              <Upload className="w-4 h-4 text-slate-600" />
                            </div>
                          </label>
                        )}
                      </div>

                      {/* Supporting Documents */}
                      <div className="space-y-2 text-left">
                        <label className="text-xs font-bold text-slate-700 block">Supporting Documents</label>
                        {supportingDocsFile ? (
                          <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                            <div className="flex items-center gap-3">
                              <FolderOpen className="w-8 h-8 text-[#002B66]" />
                              <div className="text-left">
                                <p className="text-xs font-bold text-slate-800 truncate max-w-[240px] md:max-w-[320px]">{supportingDocsFile.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{(supportingDocsFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setSupportingDocsFile(null)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label 
                            htmlFor="supporting-file"
                            className="flex items-center justify-between p-4 border-2 border-dashed border-slate-200 hover:border-[#002B66] rounded-xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/10 transition-all group"
                          >
                            <input 
                              id="supporting-file"
                              type="file"
                              accept=".pdf,.zip,.rar"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setSupportingDocsFile(e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                            <div className="flex items-center gap-3.5">
                              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100/60 transition-colors">
                                <FolderOpen className="w-6 h-6 text-[#002B66]" />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-bold text-slate-800 group-hover:text-[#002B66] transition-colors">Supporting Documents</p>
                                <p className="text-[10px] text-slate-400 font-medium">Permits, IDs, etc (ZIP/PDF, Max 25MB)</p>
                              </div>
                            </div>
                            <div className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg border border-slate-200/80">
                              <Upload className="w-4 h-4 text-slate-600" />
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Review your Inquiry */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <span className="bg-blue-50 text-[#002B66] font-bold text-xs px-2.5 py-1 rounded-md">Step 4</span>
                        <h4 className="text-sm font-bold text-slate-800">Review your Inquiry</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
                        {/* Investor Info Panel */}
                        <div className="space-y-3.5 border-r border-slate-200/80 pr-4 text-left">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">INVESTOR INFO</span>
                          <div>
                            <p className="font-extrabold text-slate-800 text-sm">{investorName}</p>
                            <p className="text-slate-500 font-medium mt-0.5">{investorCompany || "No company provided"}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-400 text-[10px] uppercase">Contact Number</p>
                            <p className="font-semibold text-slate-700">{investorPhone}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-400 text-[10px] uppercase">Email Address</p>
                            <p className="font-semibold text-slate-700">{investorEmail}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-400 text-[10px] uppercase">Address</p>
                            <p className="font-semibold text-slate-700 whitespace-pre-line leading-relaxed">{investorAddress}</p>
                          </div>
                        </div>

                        {/* Investment Details Panel */}
                        <div className="space-y-4 text-left">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">INVESTMENT DETAILS</span>
                          <div>
                            <p className="font-semibold text-slate-400 text-[10px] uppercase">Subject of Inquiry</p>
                            <p className="font-extrabold text-slate-800 text-xs">{investorSubject}</p>
                          </div>

                          <div>
                            <p className="font-semibold text-slate-400 text-[10px] uppercase">Purpose of Inquiry</p>
                            <p className="font-extrabold text-[#002B66] text-xs leading-relaxed">{inquiryPurpose}</p>
                          </div>

                          <div>
                            <p className="font-semibold text-slate-400 text-[10px] uppercase">Message</p>
                            <p className="text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-line leading-relaxed">
                              {inquiryMessage || "No message provided."}
                            </p>
                          </div>
                          {(letterOfIntentFile || supportingDocsFile) && (
                            <div className="space-y-1.5">
                              <p className="font-semibold text-slate-400 text-[10px] uppercase">Documents</p>
                              <div className="text-[10px] font-bold space-y-1 text-[#002B66]">
                                {letterOfIntentFile && (
                                  <div className="flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>LOI: {letterOfIntentFile.name}</span>
                                  </div>
                                )}
                                {supportingDocsFile && (
                                  <div className="flex items-center gap-1.5">
                                    <FolderOpen className="w-3.5 h-3.5" />
                                    <span>Supporting: {supportingDocsFile.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Warning/Certification Bar */}
                      <div className="bg-[#002B66] border border-blue-800 rounded-xl p-3 flex items-start gap-2.5 text-xs text-white leading-relaxed text-left shadow-xs">
                        <Info className="w-4.5 h-4.5 text-blue-200 shrink-0 mt-0.5 animate-pulse" />
                        <span>
                          By submitting, you certify that all information is accurate. Process takes 3-5 business days.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-3 shrink-0">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setInquiryModalProject(null)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}

                   {currentStep < 4 ? (
                    <button
                      key="next-btn"
                      type="button"
                      disabled={!isStepValid(currentStep)}
                      onClick={() => {
                        if (isStepValid(currentStep)) {
                          setCurrentStep((prev) => prev + 1);
                        }
                      }}
                      className="bg-[#002B66] hover:bg-[#001D47] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      key="submit-btn"
                      type="submit"
                      disabled={isSubmittingInquiry}
                      className="bg-[#746006] hover:bg-[#604f05] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70 active:scale-[0.98]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingInquiry ? "Submitting Final Inquiry..." : "Submit Final Inquiry"}</span>
                    </button>
                  )}
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
