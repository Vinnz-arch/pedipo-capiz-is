import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Mail, 
  Phone, 
  ArrowUpRight, 
  ChevronRight, 
  Check, 
  Target, 
  Award,
  Menu,
  X
} from "lucide-react";
import { LandingPageService, type LandingPageSettingData } from "@/services/LandingPageService";
import { OpportunityService, type OpportunityData } from "@/services/OpportunityService";
import { NewsService, type NewsArticleData } from "@/services/NewsService";
import logo from "../assets/logo.jpg";
import LoadingScreen from "@/components/common/LoadingScreen";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<LandingPageSettingData | null>(null);
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [news, setNews] = useState<NewsArticleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const settingsRes = await LandingPageService.getSettings();
        if (settingsRes.settings) {
          setSettings(settingsRes.settings);
        }

        const oppsRes = await OpportunityService.getAll();
        if (oppsRes.opportunities) {
          // Only show published opportunities on public page
          setOpportunities(oppsRes.opportunities.filter(o => o.status === "Published").slice(0, 3));
        }

        const newsRes = await NewsService.getAll();
        if (newsRes.articles) {
          setNews(newsRes.articles.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to load landing page data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLandingData();
  }, []);

  const handleExploreOpps = () => {
    const el = document.getElementById("opportunities");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollTo = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownloadBrochure = () => {
    window.open("https://capiz.gov.ph", "_blank");
  };

  const resolveCmsImageUrl = (path?: string, fallback: string = "") => {
    if (!path) return fallback;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `http://localhost:8000${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const parseBullets = (bulletsText?: string): string[] => {
    if (!bulletsText) return [];
    return bulletsText.split("\n").map(line => line.trim()).filter(Boolean);
  };

  if (isLoading || !settings) {
    return <LoadingScreen message="Loading Capiz PEDIPO Portal..." />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased scroll-smooth">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src={logo} alt="PEDIPO Logo" className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0" />
            <div className="text-left">
              <h1 className="text-sm sm:text-base font-extrabold text-[#002B66] leading-none uppercase tracking-wide">PEDIPO</h1>
              <span className="text-[7.5px] font-bold text-slate-400 block tracking-wider mt-0.5 uppercase max-w-[200px] sm:max-w-[240px] leading-tight">
                Provincial Economic Development & Investment Promotion Office
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            <a 
              href="#opportunities" 
              onClick={(e) => handleScrollTo("opportunities", e)}
              className="text-xs font-bold text-slate-600 hover:text-[#002B66] uppercase tracking-wider transition-colors"
            >
              Opportunities
            </a>
            <a 
              href="#divisions" 
              onClick={(e) => handleScrollTo("divisions", e)}
              className="text-xs font-bold text-slate-600 hover:text-[#002B66] uppercase tracking-wider transition-colors"
            >
              Divisions & Services
            </a>
            <a 
              href="#msme" 
              onClick={(e) => handleScrollTo("msme", e)}
              className="text-xs font-bold text-slate-600 hover:text-[#002B66] uppercase tracking-wider transition-colors"
            >
              MSME Support
            </a>
            <a 
              href="#news" 
              onClick={(e) => handleScrollTo("news", e)}
              className="text-xs font-bold text-slate-600 hover:text-[#002B66] uppercase tracking-wider transition-colors"
            >
              News
            </a>
            <a 
              href="#mandate" 
              onClick={(e) => handleScrollTo("mandate", e)}
              className="text-xs font-bold text-slate-600 hover:text-[#002B66] uppercase tracking-wider transition-colors"
            >
              About Us
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/portal/investorPortal")}
              className="hidden sm:inline-flex px-4 py-2.5 bg-[#002B66] text-white hover:bg-[#001D47] text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 tracking-wider uppercase cursor-pointer"
            >
              Investor Portal
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-[#002B66] hover:bg-slate-50 rounded-xl border border-slate-200/60 transition-all cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 shadow-md animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col gap-3 text-left">
              <a 
                href="#opportunities" 
                onClick={(e) => { handleScrollTo("opportunities", e); setIsMobileMenuOpen(false); }}
                className="text-xs font-bold text-slate-600 hover:text-[#002B66] uppercase tracking-wider block py-1"
              >
                Opportunities
              </a>
              <a 
                href="#divisions" 
                onClick={(e) => { handleScrollTo("divisions", e); setIsMobileMenuOpen(false); }}
                className="text-xs font-bold text-slate-600 hover:text-[#002B66] uppercase tracking-wider block py-1"
              >
                Divisions & Services
              </a>
              <a 
                href="#msme" 
                onClick={(e) => { handleScrollTo("msme", e); setIsMobileMenuOpen(false); }}
                className="text-xs font-bold text-slate-600 hover:text-[#002B66] uppercase tracking-wider block py-1"
              >
                MSME Support
              </a>
              <a 
                href="#news" 
                onClick={(e) => { handleScrollTo("news", e); setIsMobileMenuOpen(false); }}
                className="text-xs font-bold text-slate-600 hover:text-[#002B66] uppercase tracking-wider block py-1"
              >
                News
              </a>
              <a 
                href="#mandate" 
                onClick={(e) => { handleScrollTo("mandate", e); setIsMobileMenuOpen(false); }}
                className="text-xs font-bold text-slate-600 hover:text-[#002B66] uppercase tracking-wider block py-1"
              >
                About Us
              </a>
              <button
                onClick={() => { navigate("/portal/investorPortal"); setIsMobileMenuOpen(false); }}
                className="w-full text-center py-2.5 bg-[#002B66] text-white hover:bg-[#001D47] text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer mt-1"
              >
                Investor Portal
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-24 sm:py-32">
        <div className="absolute inset-0 z-0">
          <img 
            src={resolveCmsImageUrl(settings.hero_image_path, "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80")} 
            alt="Capiz Coastline" 
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#002B66]/90 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-left space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#746006] text-amber-50 uppercase tracking-widest">
              {settings.hero_badge}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              {settings.hero_title.includes("Capiz") ? (
                <>
                  {settings.hero_title.split("Capiz").map((part, index, array) => (
                    <React.Fragment key={index}>
                      {part}
                      {index < array.length - 1 && <span className="text-[#A28815]">Capiz</span>}
                    </React.Fragment>
                  ))}
                </>
              ) : (
                settings.hero_title
              )}
            </h2>
            <p className="text-base sm:text-lg text-slate-200 font-light leading-relaxed">
              {settings.hero_subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                onClick={handleExploreOpps}
                className="px-6 py-3 bg-[#A28815] hover:bg-[#B79A1A] text-white text-xs font-bold rounded-xl shadow-lg transition-all duration-300 tracking-wider uppercase flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Opportunities</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={handleDownloadBrochure}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl shadow-lg transition-all duration-300 tracking-wider uppercase cursor-pointer"
              >
                Download Brochure
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Vision & Mission Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision Card */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#002B66]/30 transition-all duration-300">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#002B66]" />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#002B66] flex items-center justify-center">
                    <Target size={20} />
                  </div>
                  <h3 className="text-lg font-extrabold text-[#002B66] uppercase tracking-wider">Vision</h3>
                </div>
                <p className="text-sm text-slate-600 italic leading-relaxed font-medium pl-2">
                  "{settings.vision_text}"
                </p>
              </div>
            </div>

            {/* Mission Card */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-amber-600/30 transition-all duration-300">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#A28815]" />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#A28815] flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <h3 className="text-lg font-extrabold text-[#A28815] uppercase tracking-wider">Mission</h3>
                </div>
                <ol className="space-y-3.5 text-xs text-slate-600 leading-relaxed font-medium pl-2 list-decimal list-inside">
                  <li>{settings.mission_point_1}</li>
                  <li>{settings.mission_point_2}</li>
                  <li>{settings.mission_point_3}</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Divisions & Services Section */}
      <section id="divisions" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">Core Divisions & Services</h2>
            <div className="w-12 h-1 bg-[#A28815] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Division 1 */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs flex flex-col h-full hover:shadow-md transition-all duration-300">
              <div className="bg-[#002B66] text-white p-6 text-left space-y-1">
                <h3 className="text-base font-extrabold tracking-wider uppercase">{settings.division_1_title}</h3>
                <span className="text-[9px] font-bold text-blue-200 uppercase tracking-widest block">{settings.division_1_subtitle}</span>
              </div>
              <div className="p-6 flex-1 bg-slate-50/50">
                <ul className="space-y-3.5 text-left text-xs font-medium text-slate-600">
                  {parseBullets(settings.division_1_bullets).map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#002B66] shrink-0 mt-1.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Division 2 */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs flex flex-col h-full hover:shadow-md transition-all duration-300">
              <div className="bg-[#001D47] text-white p-6 text-left space-y-1">
                <h3 className="text-base font-extrabold tracking-wider uppercase">{settings.division_2_title}</h3>
                <span className="text-[9px] font-bold text-blue-200 uppercase tracking-widest block">{settings.division_2_subtitle}</span>
              </div>
              <div className="p-6 flex-1 bg-slate-50/50">
                <ul className="space-y-3.5 text-left text-xs font-medium text-slate-600">
                  {parseBullets(settings.division_2_bullets).map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#001D47] shrink-0 mt-1.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Division 3 */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs flex flex-col h-full hover:shadow-md transition-all duration-300">
              <div className="bg-[#A28815] text-white p-6 text-left space-y-1">
                <h3 className="text-base font-extrabold tracking-wider uppercase">{settings.division_3_title}</h3>
                <span className="text-[9px] font-bold text-amber-100 uppercase tracking-widest block">{settings.division_3_subtitle}</span>
              </div>
              <div className="p-6 flex-1 bg-slate-50/50">
                <ul className="space-y-3.5 text-left text-xs font-medium text-slate-600">
                  {parseBullets(settings.division_3_bullets).map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A28815] shrink-0 mt-1.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Explore Opportunities Registry Section */}
      <section id="opportunities" className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">Active Opportunities</h2>
            <div className="w-12 h-1 bg-[#002B66] mx-auto rounded-full" />
            <p className="text-xs text-slate-500 tracking-wide font-medium pt-1">
              Centralized registry of high-ROI economic developments within the Province of Capiz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {opportunities.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-slate-400 text-sm">
                No active investment opportunities published.
              </div>
            ) : (
              opportunities.map((opp) => (
                <div key={opp.id} className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                  <div className="relative h-44 bg-slate-100">
                    <img 
                      src={opp.image_path ? (opp.image_path.startsWith("http") ? opp.image_path : `http://localhost:8000${opp.image_path}`) : "/images/seafood_hub.png"} 
                      alt={opp.project_name} 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-[#002B66] text-white text-[9px] font-bold px-2.5 py-1 rounded-full border border-blue-200/20 uppercase tracking-wider">
                      {opp.category?.name || "General"}
                    </span>
                  </div>
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold mb-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>{opp.municipality?.name || opp.location || "Roxas City, Capiz"}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{opp.project_name}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">ROI Estimate</span>
                        <span className="text-xs font-bold text-[#002B66]">{opp.roi_estimate ? `${opp.roi_estimate}%` : "0%"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Land Area</span>
                        <span className="text-xs font-bold text-slate-700">{opp.land_area ? `${opp.land_area} Ha` : "0 Ha"}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate("/portal/investorPortal")}
                      className="w-full mt-3 py-2 bg-slate-50 border border-slate-200 hover:bg-[#002B66]/5 hover:border-[#002B66]/30 text-[#002B66] text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Inquire Now</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 6. MSME Empowerment Section */}
      <section id="msme" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-950 text-white rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 shadow-xl border border-slate-800">
            {/* Left Content */}
            <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-left space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{settings.msme_title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed font-light">
                  {settings.msme_description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">PR & Marketing</h4>
                  <span className="text-[10px] text-slate-400 font-medium block">GROWTH STRATEGIES</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Financial Insights</h4>
                  <span className="text-[10px] text-slate-400 font-medium block">DECISION SUPPORT</span>
                </div>
              </div>

              <button 
                onClick={() => navigate("/portal/investorPortal")}
                className="w-fit px-6 py-3 bg-[#A28815] hover:bg-[#B79A1A] text-white text-xs font-bold rounded-xl shadow-lg transition-all duration-300 tracking-wider uppercase cursor-pointer"
              >
                Partner With Us
              </button>
            </div>

            {/* Right Photo */}
            <div className="relative min-h-[300px] lg:min-h-full">
              <img 
                src={resolveCmsImageUrl(settings.msme_image_path, "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80")} 
                alt="MSME Local Marketplace" 
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent lg:bg-gradient-to-r lg:from-slate-950 lg:via-transparent lg:to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* News & Updates Section */}
      <section id="news" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 text-left border-b border-slate-100 pb-6">
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-[#A28815] tracking-widest uppercase block">
                NEWS & ANNOUNCEMENTS
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                Latest News & Updates
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Keep up with important events, business milestones, and news from our economic development team.
              </p>
            </div>
            <button 
              onClick={() => navigate("/news")}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-[#002B66] text-slate-700 hover:text-white text-xs font-bold rounded-xl transition-all duration-300 tracking-wider uppercase cursor-pointer"
            >
              Browse All News
            </button>
          </div>

          {news.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-50 border border-slate-200/50 rounded-2xl">
              No news articles published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {news.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer text-left"
                  onClick={() => navigate(`/news/${item.slug}`)}
                >
                  <div>
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img 
                        src={resolveCmsImageUrl(item.image_path, "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80")} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>{item.published_at ? new Date(item.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                        <span>•</span>
                        <span>{item.author || "PEDIPO"}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-950 leading-snug group-hover:text-[#002B66] transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">
                        {item.summary}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-2">
                    <span className="text-[11px] font-bold text-[#002B66] group-hover:underline flex items-center gap-1">
                      Read Full Story <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. Mandate, Service Pledge Section */}
      <section id="mandate" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Capitol Image */}
            <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 max-h-[360px]">
              <img 
                src={resolveCmsImageUrl(settings.mandate_image_path, "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80")} 
                alt="Capiz Provincial Capitol" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Content */}
            <div className="lg:col-span-7 text-left space-y-8">
              {/* Mandate */}
              <div className="space-y-3">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">Mandate</h3>
                <div className="w-10 h-0.5 bg-[#A28815]" />
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {settings.mandate_text}
                </p>
              </div>

              {/* Service Pledge */}
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">Service Pledge</h3>
                <div className="w-10 h-0.5 bg-[#002B66]" />
                
                <div className="space-y-3">
                  {[
                    settings.service_pledge_1,
                    settings.service_pledge_2,
                    settings.service_pledge_3,
                    settings.service_pledge_4
                  ].map((pledge, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white p-3.5 border border-slate-200/60 rounded-xl">
                      <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 leading-snug">{pledge}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-[#001D47] text-white pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/5">
          {/* Column 1: Brand */}
          <div className="text-left space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="PEDIPO Logo" className="w-8 h-8 object-cover rounded-lg border border-white/10" />
              <h4 className="text-sm font-black tracking-wider uppercase">PEDIPO Capiz</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light max-w-sm">
              Partnering with investors to build a resilient and sustainable Capiz. Your gateway to the Seafood Capital of the Philippines.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {settings.contact_facebook && (
                <a href={settings.contact_facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h3V1H13c-2.8 0-5 2.2-5 5v2z"/></svg>
                </a>
              )}
              {settings.contact_twitter && (
                <a href={settings.contact_twitter} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.2 2.4h3.3L14.3 11l8.5 11.3h-6.7L11 15.9l-6 6.4H1.7l7.6-8.7L1.2 2.4h6.9l5.1 6.8 5-6.8zm-1.2 17.5h1.8L7.1 4.1H5.1l11.9 15.8z"/></svg>
                </a>
              )}
              {settings.contact_linkedin && (
                <a href={settings.contact_linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.8 0-5 2.2-5 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5v-14c0-2.8-2.2-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.3c-.9 0-1.7-.8-1.7-1.7s.8-1.7 1.7-1.7 1.7.8 1.7 1.7-.8 1.7-1.7 1.7zm13.5 12.3h-3v-5.6c0-3.3-4-3-4 0v5.6h-3v-11h3v1.8c1.4-2.6 7-2.8 7 2.5v6.7z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Contact Info */}
          <div className="text-left space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Contact Us</h4>
            <div className="space-y-3.5 text-xs font-light text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{settings.contact_address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a href={`mailto:${settings.contact_email}`} className="hover:underline">{settings.contact_email}</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{settings.contact_phone}</span>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <div className="text-left space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Quick Links</h4>
            <ul className="space-y-2.5 text-xs font-light text-slate-300">
              <li><a href="https://capiz.gov.ph" target="_blank" rel="noreferrer" className="hover:underline hover:text-white transition-colors">Capiz Gov Portal</a></li>
              <li><a href="#opportunities" onClick={(e) => handleScrollTo("opportunities", e)} className="hover:underline hover:text-white transition-colors">Investment Opportunities</a></li>
              <li><a href="#divisions" onClick={(e) => handleScrollTo("divisions", e)} className="hover:underline hover:text-white transition-colors">Divisions & Services</a></li>
              <li><a href="/news" className="hover:underline hover:text-white transition-colors">Latest News & Updates</a></li>
              <li><a href="#mandate" onClick={(e) => handleScrollTo("mandate", e)} className="hover:underline hover:text-white transition-colors">Mandate & Pledges</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-medium">
          <p>© 2026 PROVINCIAL ECONOMIC DEVELOPMENT & INVESTMENT PROMOTION OFFICE - CAPIZ. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-6">
            <a href="https://capiz.gov.ph" target="_blank" rel="noreferrer" className="hover:underline">Privacy Policy</a>
            <a href="https://capiz.gov.ph" target="_blank" rel="noreferrer" className="hover:underline">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
