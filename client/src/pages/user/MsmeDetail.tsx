import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ClientMainLayout from "@/components/client-portal/ClientMainLayout";
import { MsmeDirectoryService, type MsmeData } from "@/services/MsmeDirectoryService";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProjectImage } from "@/components/ui/ProjectImage";
import { 
  MapPin, 
  Store, 
  Phone, 
  Mail, 
  Building2, 
  ShoppingBag, 
  ExternalLink,
  Share2,
  Clock,
  Globe,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { notify } from "@/util/notify";
import { useLiveSync } from "@/hooks/useLiveSync";

export const MsmeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [msme, setMsme] = useState<MsmeData | null>(null);
  const [otherMsmes, setOtherMsmes] = useState<MsmeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetailsAndRecommendations = async (options?: { silent?: boolean }) => {
    if (!id) return;
    const silent = options?.silent ?? false;
    if (!silent) {
      setIsLoading(true);
    }
    try {
      // Fetch details
      const detailRes = await MsmeDirectoryService.getByIdPublic(id);
      if (detailRes.msme) {
        setMsme(detailRes.msme);
      }

      // Fetch other MSMEs for recommendation list
      const listRes = await MsmeDirectoryService.getAllPublic({ per_page: "10" });
      if (listRes.msmes) {
        // Exclude current business and limit to 4
        const filtered = listRes.msmes
          .filter(item => item.id?.toString() !== id.toString())
          .slice(0, 4);
        setOtherMsmes(filtered);
      }
    } catch (error) {
      console.error("Failed to load profile details:", error);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDetailsAndRecommendations();
  }, [id]);

  useLiveSync(
    ["msmes", "all"],
    () => fetchDetailsAndRecommendations({ silent: true }),
    { pollIntervalMs: 15000 }
  );

  // Maps URL Redirect
  const handleViewOnMap = () => {
    if (!msme) return;
    let mapUrl = "";
    if (msme.latitude && msme.longitude) {
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${msme.latitude},${msme.longitude}`;
    } else {
      const addressString = `${msme.complete_address}, Brgy. {msme.barangay}, ${msme.municipality?.name || ""}, Capiz, Philippines`;
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`;
    }
    window.open(mapUrl, "_blank");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    notify.success("Link Copied", "Profile address copied to clipboard.");
  };

  if (isLoading) {
    return (
      <ClientMainLayout>
        <LoadingState message="Loading business profile..." className="min-h-[50vh]" />
      </ClientMainLayout>
    );
  }

  if (!msme) {
    return (
      <ClientMainLayout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
          <Store className="w-12 h-12 text-slate-300" />
          <h2 className="text-lg font-black text-slate-800">Business Profile Unavailable</h2>
          <p className="text-xs text-slate-400 font-medium max-w-xs">
            This business may have been archived, set to inactive, or is awaiting approval by PEDIPO officials.
          </p>
          <Link
            to="/portal/msmeDirectory"
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all text-xs"
          >
            Go Back to Directory
          </Link>
        </div>
      </ClientMainLayout>
    );
  }

  const productPics = [msme.product_image_1, msme.product_image_2, msme.product_image_3];

  // Determine mock stats based on enterprise size
  const metrics = msme.enterprise_type === "Micro" 
    ? { exp: "3+ Years", volume: "10k+", scope: "Local", fda: "A" }
    : msme.enterprise_type === "Small"
    ? { exp: "7+ Years", volume: "100k+", scope: "Regional", fda: "A" }
    : { exp: "12+ Years", volume: "500k+", scope: "Export", fda: "A+" };

  return (
    <ClientMainLayout>
      <div className="space-y-6 pb-16 text-left text-slate-800">
        
        {/* Breadcrumb path navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/portal/msmeDirectory" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            &larr; Back to Directory
          </Link>
          <span>/</span>
          <span className="text-slate-500 font-bold">MSME Profile</span>
        </div>

        {/* Wide Header Cover Banner */}
        <div className="relative bg-white rounded-3xl border border-slate-100 shadow-xs overflow-visible pb-6 md:pb-0">
          
          {/* Banner picture */}
          <div className="h-64 w-full relative overflow-hidden rounded-t-3xl bg-slate-200">
            <ProjectImage
              src={msme.cover_path}
              alt={`${msme.business_name} cover backdrop`}
              className="w-full h-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent"></div>
          </div>

          {/* Floating Logo overlay - absolute positioned overlapping bottom of banner */}
          <div className="absolute left-8 top-44 w-32 h-32 md:w-36 md:h-36 bg-white rounded-2xl p-2 shadow-2xl border border-slate-100 overflow-hidden flex items-center justify-center z-10">
            <ProjectImage
              src={msme.logo_path}
              alt={`${msme.business_name} logo`}
              className="max-w-full max-h-full object-contain rounded-xl"
              fallbackClassName="rounded-xl px-2"
            />
          </div>

          {/* Profile Name & quick info summary details under the cover */}
          <div className="pt-20 md:pt-4 px-8 pb-6 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 md:pl-48">
            
            {/* Title block */}
            <div className="space-y-2.5 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-[9px] uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified MSME
                </span>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800">{msme.business_name}</h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{msme.municipality?.name}, Capiz</span>
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></div>
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                  <span>{msme.category?.name || "Business Sector"}</span>
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block"></div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>{msme.enterprise_type} Size</span>
                </div>
              </div>
            </div>

            {/* Quick action buttons on right */}
            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-center">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-extrabold rounded-xl transition-all shadow-xs text-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
              
              <a
                href={`mailto:${msme.email_address || "hello@pedipo.capiz.gov.ph"}?subject=PEDIPO Inquiry: ${encodeURIComponent(msme.business_name)}`}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl transition-all shadow-md hover:shadow-blue-500/10 text-xs cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                Contact Business
              </a>
            </div>

          </div>
        </div>

        {/* 2 Column Details layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pt-4">
          
          {/* LEFT COLUMN: About & Products (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* About Card containing Metrics Grid */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              
              <div className="flex items-center gap-2 text-slate-800">
                <Store className="w-4.5 h-4.5 text-blue-600" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider">About the Business</h2>
              </div>
              
              <p className="text-slate-600 text-xs font-medium leading-relaxed whitespace-pre-line">
                {msme.business_description}
              </p>

              {/* Grid of 4 quick statistics metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex flex-col justify-between">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Establishment</h4>
                  <p className="text-sm font-black text-slate-800 mt-1">{metrics.exp}</p>
                </div>
                
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex flex-col justify-between">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Products sold</h4>
                  <p className="text-sm font-black text-slate-800 mt-1">{metrics.volume}</p>
                </div>
                
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex flex-col justify-between">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Market Reach</h4>
                  <p className="text-sm font-black text-slate-800 mt-1">{metrics.scope}</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex flex-col justify-between">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">FDA Rating</h4>
                  <p className="text-sm font-black text-slate-800 mt-1">{metrics.fda}</p>
                </div>

              </div>
            </div>

            {/* Featured Products / Services list */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
              
              <div className="flex items-center gap-2 text-slate-800">
                <ShoppingBag className="w-4.5 h-4.5 text-[#E2B714]" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider">Featured Products</h2>
              </div>
              
              {/* comma separated badges list */}
              {msme.products_services && (
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {msme.products_services.split(",").map((item, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-[10px]"
                    >
                      {item.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* 3 image row matching product display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {productPics.map((pic, idx) => (
                  <div key={idx} className="h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-xs">
                    <ProjectImage
                      src={pic}
                      alt={`Featured product ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Find Us, Direct Contact, hours (1/3 width) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Find Us Mini Map card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-800">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider">Find Us</h3>
              </div>

              {/* CSS Map indicator card mockup */}
              <div className="h-36 bg-slate-50 rounded-2xl relative overflow-hidden flex items-center justify-center border border-slate-100">
                {/* Dotted grid layout overlay */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                {/* Ping rings */}
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center animate-ping absolute"></div>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white relative shadow-md">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <p className="text-slate-500 font-semibold leading-relaxed">
                  {msme.complete_address}, Brgy. {msme.barangay}, {msme.municipality?.name}, Capiz, Philippines
                </p>
                <button
                  onClick={handleViewOnMap}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-extrabold rounded-xl transition-all text-xs cursor-pointer"
                >
                  View on Map
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Direct Contact methods Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-800">
                <Mail className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider">Direct Contact</h3>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                
                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 border border-slate-100 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">Phone</span>
                    <span className="text-slate-700 font-mono">{msme.contact_number}</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 border border-slate-100 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">Email</span>
                    <span className="text-slate-700 truncate block">{msme.email_address || "contact@capizmsme.gov.ph"}</span>
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 border border-slate-100 shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">Website</span>
                    <span className="text-blue-600 hover:underline cursor-pointer block">
                      www.{msme.business_name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Operating Hours card (Black/Dark Slate background) */}
            <div className="bg-[#1e2538] text-white p-6 rounded-3xl border border-[#2a3249] shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E2B714]" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">Operating Hours</h3>
              </div>

              <div className="space-y-2 text-xs font-semibold">
                
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Mon - Fri</span>
                  <span className="text-slate-200">8:00 AM - 5:00 PM</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Saturday</span>
                  <span className="text-slate-200">9:00 AM - 3:00 PM</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Sunday</span>
                  <span className="text-red-400 font-extrabold">Closed</span>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Explore Other MSMEs Section at bottom */}
        {otherMsmes.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-slate-100">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Explore Other MSMEs</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherMsmes.map((rec) => (
                  <div 
                    key={rec.id}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
                  >
                    <div className="h-28 w-full overflow-hidden bg-slate-100 shrink-0">
                      <ProjectImage
                        src={rec.cover_path}
                        alt={rec.business_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800 truncate">{rec.business_name}</h4>
                        <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">
                          {rec.category?.name || "Business Sector"}
                        </span>
                      </div>

                      <Link
                        to={`/portal/msmeDirectory/${rec.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 font-extrabold text-[10px] hover:text-blue-800 transition-colors bg-transparent border-0 p-0 shadow-none hover:translate-x-0.5 transition-transform"
                      >
                        View Profile
                        <ArrowRight className="w-3 h-3 mt-0.5" />
                      </Link>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </ClientMainLayout>
  );
};

export default MsmeDetail;
