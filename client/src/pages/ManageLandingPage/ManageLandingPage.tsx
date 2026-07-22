import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/Mainlayout";
import { LandingPageService } from "@/services/LandingPageService";
import { NewsService, type NewsArticleData } from "@/services/NewsService";
import { notify } from "@/util/notify";
import { 
  Save, 
  Settings, 
  Target, 
  Briefcase, 
  Phone, 
  Heart,
  Loader2,
  Newspaper,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Upload,
  FileText
} from "lucide-react";

export const ManageLandingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"hero" | "vision" | "divisions" | "mandate" | "contact" | "news">("hero");

  // Form states
  const [heroBadge, setHeroBadge] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [heroImagePath, setHeroImagePath] = useState("");

  const [visionText, setVisionText] = useState("");
  const [missionPoint1, setMissionPoint1] = useState("");
  const [missionPoint2, setMissionPoint2] = useState("");
  const [missionPoint3, setMissionPoint3] = useState("");

  const [msmeTitle, setMsmeTitle] = useState("");
  const [msmeDescription, setMsmeDescription] = useState("");
  const [msmeImageFile, setMsmeImageFile] = useState<File | null>(null);
  const [msmeImagePreview, setMsmeImagePreview] = useState<string | null>(null);
  const [msmeImagePath, setMsmeImagePath] = useState("");

  const [mandateText, setMandateText] = useState("");
  const [mandateImageFile, setMandateImageFile] = useState<File | null>(null);
  const [mandateImagePreview, setMandateImagePreview] = useState<string | null>(null);
  const [mandateImagePath, setMandateImagePath] = useState("");
  const [servicePledge1, setServicePledge1] = useState("");
  const [servicePledge2, setServicePledge2] = useState("");
  const [servicePledge3, setServicePledge3] = useState("");
  const [servicePledge4, setServicePledge4] = useState("");

  const [contactAddress, setContactAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactFacebook, setContactFacebook] = useState("");
  const [contactTwitter, setContactTwitter] = useState("");
  const [contactLinkedin, setContactLinkedin] = useState("");

  const [div1Title, setDiv1Title] = useState("");
  const [div1Subtitle, setDiv1Subtitle] = useState("");
  const [div1Bullets, setDiv1Bullets] = useState("");

  const [div2Title, setDiv2Title] = useState("");
  const [div2Subtitle, setDiv2Subtitle] = useState("");
  const [div2Bullets, setDiv2Bullets] = useState("");

  const [div3Title, setDiv3Title] = useState("");
  const [div3Subtitle, setDiv3Subtitle] = useState("");
  const [div3Bullets, setDiv3Bullets] = useState("");

  const [articles, setArticles] = useState<NewsArticleData[]>([]);
  const [newsSearchQuery, setNewsSearchQuery] = useState("");
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<NewsArticleData | null>(null);
  const [isSavingNews, setIsSavingNews] = useState(false);

  // News Form states
  const [newsTitle, setNewsTitle] = useState("");
  const [newsSummary, setNewsSummary] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsAuthor, setNewsAuthor] = useState("");
  const [newsStatus, setNewsStatus] = useState<"Published" | "Draft">("Published");
  const [newsPublishedAt, setNewsPublishedAt] = useState("");
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null);
  const [newsImagePreview, setNewsImagePreview] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      const res = await NewsService.getAll();
      if (res.articles) {
        setArticles(res.articles);
      }
    } catch (error) {
      console.error("Failed to load news articles:", error);
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await LandingPageService.getSettings();
        if (res.settings) {
          const s = res.settings;
          setHeroBadge(s.hero_badge);
          setHeroTitle(s.hero_title);
          setHeroSubtitle(s.hero_subtitle);
          setHeroDescription(s.hero_description);
          setHeroImagePath(s.hero_image_path || "");
          if (s.hero_image_path) {
            setHeroImagePreview(
              s.hero_image_path.startsWith("http")
                ? s.hero_image_path
                : `http://localhost:8000${s.hero_image_path}`
            );
          }

          setVisionText(s.vision_text);
          setMissionPoint1(s.mission_point_1);
          setMissionPoint2(s.mission_point_2);
          setMissionPoint3(s.mission_point_3);

          setMsmeTitle(s.msme_title);
          setMsmeDescription(s.msme_description);
          setMsmeImagePath(s.msme_image_path || "");
          if (s.msme_image_path) {
            setMsmeImagePreview(
              s.msme_image_path.startsWith("http")
                ? s.msme_image_path
                : `http://localhost:8000${s.msme_image_path}`
            );
          }
          setMandateText(s.mandate_text);
          setMandateImagePath(s.mandate_image_path || "");
          if (s.mandate_image_path) {
            setMandateImagePreview(
              s.mandate_image_path.startsWith("http")
                ? s.mandate_image_path
                : `http://localhost:8000${s.mandate_image_path}`
            );
          }
          setServicePledge1(s.service_pledge_1);
          setServicePledge2(s.service_pledge_2);
          setServicePledge3(s.service_pledge_3);
          setServicePledge4(s.service_pledge_4);

          setContactAddress(s.contact_address);
          setContactEmail(s.contact_email);
          setContactPhone(s.contact_phone);
          setContactFacebook(s.contact_facebook || "");
          setContactTwitter(s.contact_twitter || "");
          setContactLinkedin(s.contact_linkedin || "");

          setDiv1Title(s.division_1_title);
          setDiv1Subtitle(s.division_1_subtitle);
          setDiv1Bullets(s.division_1_bullets);

          setDiv2Title(s.division_2_title);
          setDiv2Subtitle(s.division_2_subtitle);
          setDiv2Bullets(s.division_2_bullets);

          setDiv3Title(s.division_3_title);
          setDiv3Subtitle(s.division_3_subtitle);
          setDiv3Bullets(s.division_3_bullets);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        notify.error("CMS Error", "Failed to retrieve landing page configurations.");
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
    fetchNews();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append("hero_badge", heroBadge.trim());
    formData.append("hero_title", heroTitle.trim());
    formData.append("hero_subtitle", heroSubtitle.trim());
    formData.append("hero_description", heroDescription.trim());
    formData.append("vision_text", visionText.trim());
    formData.append("mission_point_1", missionPoint1.trim());
    formData.append("mission_point_2", missionPoint2.trim());
    formData.append("mission_point_3", missionPoint3.trim());
    formData.append("msme_title", msmeTitle.trim());
    formData.append("msme_description", msmeDescription.trim());
    formData.append("mandate_text", mandateText.trim());
    formData.append("service_pledge_1", servicePledge1.trim());
    formData.append("service_pledge_2", servicePledge2.trim());
    formData.append("service_pledge_3", servicePledge3.trim());
    formData.append("service_pledge_4", servicePledge4.trim());
    formData.append("contact_address", contactAddress.trim());
    formData.append("contact_email", contactEmail.trim());
    formData.append("contact_phone", contactPhone.trim());
    formData.append("contact_facebook", contactFacebook.trim());
    formData.append("contact_twitter", contactTwitter.trim());
    formData.append("contact_linkedin", contactLinkedin.trim());
    formData.append("division_1_title", div1Title.trim());
    formData.append("division_1_subtitle", div1Subtitle.trim());
    formData.append("division_1_bullets", div1Bullets.trim());
    formData.append("division_2_title", div2Title.trim());
    formData.append("division_2_subtitle", div2Subtitle.trim());
    formData.append("division_2_bullets", div2Bullets.trim());
    formData.append("division_3_title", div3Title.trim());
    formData.append("division_3_subtitle", div3Subtitle.trim());
    formData.append("division_3_bullets", div3Bullets.trim());

    if (heroImagePath) {
      formData.append("hero_image_path", heroImagePath.trim());
    }
    if (heroImageFile) {
      formData.append("hero_image", heroImageFile);
    }
    if (msmeImagePath) {
      formData.append("msme_image_path", msmeImagePath.trim());
    }
    if (msmeImageFile) {
      formData.append("msme_image", msmeImageFile);
    }
    if (mandateImagePath) {
      formData.append("mandate_image_path", mandateImagePath.trim());
    }
    if (mandateImageFile) {
      formData.append("mandate_image", mandateImageFile);
    }

    try {
      const res = await LandingPageService.updateSettings(formData);
      if (res.settings) {
        setHeroImagePath(res.settings.hero_image_path || "");
        setHeroImageFile(null);
        setMsmeImagePath(res.settings.msme_image_path || "");
        setMsmeImageFile(null);
        setMandateImagePath(res.settings.mandate_image_path || "");
        setMandateImageFile(null);
      }
    } catch (error) {
      console.error("Failed to save landing settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const openAddNewsModal = () => {
    setCurrentArticle(null);
    setNewsTitle("");
    setNewsSummary("");
    setNewsContent("");
    setNewsAuthor("PEDIPO Admin");
    setNewsStatus("Published");
    setNewsPublishedAt(new Date().toISOString().slice(0, 16));
    setNewsImageFile(null);
    setNewsImagePreview(null);
    setIsNewsModalOpen(true);
  };

  const openEditNewsModal = (article: NewsArticleData) => {
    setCurrentArticle(article);
    setNewsTitle(article.title);
    setNewsSummary(article.summary);
    setNewsContent(article.content);
    setNewsAuthor(article.author || "PEDIPO Admin");
    setNewsStatus(article.status || "Published");
    
    const formattedDate = article.published_at 
      ? new Date(article.published_at).toISOString().slice(0, 16) 
      : new Date().toISOString().slice(0, 16);
    setNewsPublishedAt(formattedDate);

    setNewsImageFile(null);
    if (article.image_path) {
      setNewsImagePreview(
        article.image_path.startsWith("http")
          ? article.image_path
          : `http://localhost:8000${article.image_path}`
      );
    } else {
      setNewsImagePreview(null);
    }
    setIsNewsModalOpen(true);
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsSummary.trim() || !newsContent.trim()) {
      notify.warning("Validation Failed", "Title, Summary, and Content fields are required.");
      return;
    }

    setIsSavingNews(true);
    const formData = new FormData();
    formData.append("title", newsTitle.trim());
    formData.append("summary", newsSummary.trim());
    formData.append("content", newsContent.trim());
    formData.append("author", newsAuthor.trim());
    formData.append("status", newsStatus);
    formData.append("published_at", new Date(newsPublishedAt).toISOString());
    if (newsImageFile) {
      formData.append("image", newsImageFile);
    }

    try {
      if (currentArticle && currentArticle.id) {
        await NewsService.update(currentArticle.id, formData);
      } else {
        await NewsService.create(formData);
      }
      setIsNewsModalOpen(false);
      fetchNews();
    } catch (error) {
      console.error("Failed to save news article:", error);
    } finally {
      setIsSavingNews(false);
    }
  };

  const handleDeleteNews = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this news article?")) return;
    try {
      await NewsService.delete(id);
      fetchNews();
    } catch (error) {
      console.error("Failed to delete news article:", error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-[#002B66] animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Loading Landing Page CMS configurations...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 pb-12 font-sans text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-black text-[#002B66] tracking-tight">Landing Page CMS</h1>
            <p className="text-xs text-slate-500 mt-1">
              Customize text blocks, visions, core divisions, and contact info displayed on the public landing page.
            </p>
          </div>
        </div>

        {/* CMS Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-1">
            <button
              onClick={() => setActiveTab("hero")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === "hero"
                  ? "bg-[#002B66] text-white shadow-md shadow-[#002B66]/10"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/50"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Hero Header</span>
            </button>
            <button
              onClick={() => setActiveTab("vision")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === "vision"
                  ? "bg-[#002B66] text-white shadow-md shadow-[#002B66]/10"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/50"
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Vision & Mission</span>
            </button>
            <button
              onClick={() => setActiveTab("divisions")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === "divisions"
                  ? "bg-[#002B66] text-white shadow-md shadow-[#002B66]/10"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/50"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Core Divisions</span>
            </button>
            <button
              onClick={() => setActiveTab("mandate")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === "mandate"
                  ? "bg-[#002B66] text-white shadow-md shadow-[#002B66]/10"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/50"
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>MSME & Mandates</span>
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === "contact"
                  ? "bg-[#002B66] text-white shadow-md shadow-[#002B66]/10"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/50"
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Contact & Socials</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("news")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === "news"
                  ? "bg-[#002B66] text-white shadow-md shadow-[#002B66]/10"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/50"
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>News & Updates</span>
            </button>
          </div>

          {/* Form Container */}
          <div className="lg:col-span-9 bg-white border border-slate-200/60 rounded-2xl shadow-xs overflow-hidden">
            <form onSubmit={handleSave} className="divide-y divide-slate-100">
              <div className="p-6">
                {/* 1. Hero Tab */}
                {activeTab === "hero" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Hero Section Settings</h3>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Badge / Pill text</label>
                      <input
                        type="text"
                        required
                        value={heroBadge}
                        onChange={(e) => setHeroBadge(e.target.value)}
                        placeholder="e.g. WELCOME TO CAPIZ"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Main Heading Title</label>
                      <input
                        type="text"
                        required
                        value={heroTitle}
                        onChange={(e) => setHeroTitle(e.target.value)}
                        placeholder="e.g. Invest in Capiz"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Sub-heading Intro</label>
                      <input
                        type="text"
                        required
                        value={heroSubtitle}
                        onChange={(e) => setHeroSubtitle(e.target.value)}
                        placeholder="Brief summary line..."
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Description Copy</label>
                      <textarea
                        rows={4}
                        required
                        value={heroDescription}
                        onChange={(e) => setHeroDescription(e.target.value)}
                        placeholder="Full intro paragraph..."
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none"
                      />
                    </div>

                    {/* Hero Background Image */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Hero Background Image</label>
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 border border-slate-200/60 rounded-2xl">
                        {heroImagePreview ? (
                          <div className="w-full sm:w-44 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                            <img src={heroImagePreview} alt="Hero Background Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-full sm:w-44 h-24 rounded-xl border border-dashed border-slate-300 bg-white shrink-0 flex items-center justify-center text-xs text-slate-400">
                            No Image Selected
                          </div>
                        )}
                        <div className="space-y-2 w-full text-left">
                          <p className="text-[11px] text-slate-500 leading-snug">
                            Upload a high-quality landscape image (JPG, PNG, WebP) for the public landing page hero header background.
                          </p>
                          <div className="flex flex-col gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setHeroImageFile(file);
                                  setHeroImagePreview(URL.createObjectURL(file));
                                }
                              }}
                              className="hidden"
                              id="hero-image-input"
                            />
                            <label
                              htmlFor="hero-image-input"
                              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg cursor-pointer transition-colors w-fit shadow-xs inline-block"
                            >
                              Choose Background Image
                            </label>
                            
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500">Or use Image URL</label>
                              <input
                                type="text"
                                value={heroImagePath}
                                onChange={(e) => {
                                  setHeroImagePath(e.target.value);
                                  setHeroImagePreview(e.target.value);
                                  setHeroImageFile(null);
                                }}
                                placeholder="https://..."
                                className="w-full px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Vision & Mission Tab */}
                {activeTab === "vision" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Vision & Mission Statements</h3>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Vision Statement</label>
                      <textarea
                        rows={3}
                        required
                        value={visionText}
                        onChange={(e) => setVisionText(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Mission Statement - Point 1</label>
                      <textarea
                        rows={2}
                        required
                        value={missionPoint1}
                        onChange={(e) => setMissionPoint1(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Mission Statement - Point 2</label>
                      <textarea
                        rows={2}
                        required
                        value={missionPoint2}
                        onChange={(e) => setMissionPoint2(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Mission Statement - Point 3</label>
                      <textarea
                        rows={2}
                        required
                        value={missionPoint3}
                        onChange={(e) => setMissionPoint3(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Core Divisions Tab */}
                {activeTab === "divisions" && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Core Divisions & Services</h3>

                    {/* Division 1 */}
                    <div className="space-y-3 bg-slate-50 p-4 border border-slate-200/50 rounded-xl">
                      <h4 className="text-xs font-bold text-[#002B66] uppercase">Division 1 Settings</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Title</label>
                          <input
                            type="text"
                            required
                            value={div1Title}
                            onChange={(e) => setDiv1Title(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Subtitle</label>
                          <input
                            type="text"
                            required
                            value={div1Subtitle}
                            onChange={(e) => setDiv1Subtitle(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Bullet lists (one per line)</label>
                        <textarea
                          rows={4}
                          required
                          value={div1Bullets}
                          onChange={(e) => setDiv1Bullets(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Division 2 */}
                    <div className="space-y-3 bg-slate-50 p-4 border border-slate-200/50 rounded-xl">
                      <h4 className="text-xs font-bold text-[#001D47] uppercase">Division 2 Settings</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Title</label>
                          <input
                            type="text"
                            required
                            value={div2Title}
                            onChange={(e) => setDiv2Title(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Subtitle</label>
                          <input
                            type="text"
                            required
                            value={div2Subtitle}
                            onChange={(e) => setDiv2Subtitle(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Bullet lists (one per line)</label>
                        <textarea
                          rows={4}
                          required
                          value={div2Bullets}
                          onChange={(e) => setDiv2Bullets(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Division 3 */}
                    <div className="space-y-3 bg-slate-50 p-4 border border-slate-200/50 rounded-xl">
                      <h4 className="text-xs font-bold text-[#A28815] uppercase">Division 3 Settings</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Title</label>
                          <input
                            type="text"
                            required
                            value={div3Title}
                            onChange={(e) => setDiv3Title(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Subtitle</label>
                          <input
                            type="text"
                            required
                            value={div3Subtitle}
                            onChange={(e) => setDiv3Subtitle(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Bullet lists (one per line)</label>
                        <textarea
                          rows={4}
                          required
                          value={div3Bullets}
                          onChange={(e) => setDiv3Bullets(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. MSME & Mandate Tab */}
                {activeTab === "mandate" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">MSME Empowerment, Mandate & Pledge</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">MSME Section Title</label>
                        <input
                          type="text"
                          required
                          value={msmeTitle}
                          onChange={(e) => setMsmeTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">MSME Description</label>
                        <textarea
                          rows={2}
                          required
                          value={msmeDescription}
                          onChange={(e) => setMsmeDescription(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none"
                        />
                      </div>
                    </div>

                    {/* MSME Image Upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">MSME Section Image</label>
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 border border-slate-200/60 rounded-2xl">
                        {msmeImagePreview ? (
                          <div className="w-full sm:w-44 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                            <img src={msmeImagePreview} alt="MSME Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-full sm:w-44 h-24 rounded-xl border border-dashed border-slate-300 bg-white shrink-0 flex items-center justify-center text-xs text-slate-400">
                            No Image Selected
                          </div>
                        )}
                        <div className="space-y-2 w-full text-left">
                          <p className="text-[11px] text-slate-500 leading-snug">
                            Upload a high-quality landscape image (JPG, PNG, WebP) for the MSME Support section.
                          </p>
                          <div className="flex flex-col gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setMsmeImageFile(file);
                                  setMsmeImagePreview(URL.createObjectURL(file));
                                }
                              }}
                              className="hidden"
                              id="msme-image-input"
                            />
                            <label
                              htmlFor="msme-image-input"
                              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg cursor-pointer transition-colors w-fit shadow-xs inline-block"
                            >
                              Choose MSME Image
                            </label>
                            
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500">Or use Image URL</label>
                              <input
                                type="text"
                                value={msmeImagePath}
                                onChange={(e) => {
                                  setMsmeImagePath(e.target.value);
                                  setMsmeImagePreview(e.target.value);
                                  setMsmeImageFile(null);
                                }}
                                placeholder="https://..."
                                className="w-full px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Mandate Description Statement</label>
                      <textarea
                        rows={3}
                        required
                        value={mandateText}
                        onChange={(e) => setMandateText(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none"
                      />
                    </div>

                    {/* Mandate Image Upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Mandate / Capitol Image</label>
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 border border-slate-200/60 rounded-2xl">
                        {mandateImagePreview ? (
                          <div className="w-full sm:w-44 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                            <img src={mandateImagePreview} alt="Mandate Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-full sm:w-44 h-24 rounded-xl border border-dashed border-slate-300 bg-white shrink-0 flex items-center justify-center text-xs text-slate-400">
                            No Image Selected
                          </div>
                        )}
                        <div className="space-y-2 w-full text-left">
                          <p className="text-[11px] text-slate-500 leading-snug">
                            Upload a high-quality landscape image (JPG, PNG, WebP) of the Capitol Building / Mandate section.
                          </p>
                          <div className="flex flex-col gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setMandateImageFile(file);
                                  setMandateImagePreview(URL.createObjectURL(file));
                                }
                              }}
                              className="hidden"
                              id="mandate-image-input"
                            />
                            <label
                              htmlFor="mandate-image-input"
                              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg cursor-pointer transition-colors w-fit shadow-xs inline-block"
                            >
                              Choose Mandate Image
                            </label>
                            
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500">Or use Image URL</label>
                              <input
                                type="text"
                                value={mandateImagePath}
                                onChange={(e) => {
                                  setMandateImagePath(e.target.value);
                                  setMandateImagePreview(e.target.value);
                                  setMandateImageFile(null);
                                }}
                                placeholder="https://..."
                                className="w-full px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-slate-100 my-2" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Service Pledges Checklist</h4>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Service Pledge Point 1</label>
                        <input
                          type="text"
                          required
                          value={servicePledge1}
                          onChange={(e) => setServicePledge1(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Service Pledge Point 2</label>
                        <input
                          type="text"
                          required
                          value={servicePledge2}
                          onChange={(e) => setServicePledge2(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Service Pledge Point 3</label>
                        <input
                          type="text"
                          required
                          value={servicePledge3}
                          onChange={(e) => setServicePledge3(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Service Pledge Point 4</label>
                        <input
                          type="text"
                          required
                          value={servicePledge4}
                          onChange={(e) => setServicePledge4(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Contact & Socials Tab */}
                {activeTab === "contact" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Contact & Social Media Settings</h3>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Office Physical Address</label>
                      <input
                        type="text"
                        required
                        value={contactAddress}
                        onChange={(e) => setContactAddress(e.target.value)}
                        placeholder="Street address..."
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Contact Email</label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="e.g. info@pedipo.gov"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Contact Phone / Telephone</label>
                        <input
                          type="text"
                          required
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="e.g. (036) 620-755"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                        />
                      </div>
                    </div>

                    <hr className="border-slate-100 my-2" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Social Links</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Facebook URL</label>
                        <input
                          type="text"
                          value={contactFacebook}
                          onChange={(e) => setContactFacebook(e.target.value)}
                          placeholder="https://facebook.com/..."
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Twitter URL</label>
                        <input
                          type="text"
                          value={contactTwitter}
                          onChange={(e) => setContactTwitter(e.target.value)}
                          placeholder="https://twitter.com/..."
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">LinkedIn URL</label>
                        <input
                          type="text"
                          value={contactLinkedin}
                          onChange={(e) => setContactLinkedin(e.target.value)}
                          placeholder="https://linkedin.com/..."
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                        />
                      </div>
                    </div>
                    </div>
                )}

                {/* 6. News & Updates Tab */}
                {activeTab === "news" && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">News Articles Management</h3>
                        <p className="text-[11px] text-slate-400">Publish news, stories, and notifications.</p>
                      </div>
                      <button
                        type="button"
                        onClick={openAddNewsModal}
                        className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#002B66] hover:bg-[#001D47] text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add News Article</span>
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="flex bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search articles..."
                        value={newsSearchQuery}
                        onChange={(e) => setNewsSearchQuery(e.target.value)}
                        className="w-full text-xs text-slate-700 bg-transparent outline-none"
                      />
                    </div>

                    {/* Articles Grid/Table */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Preview</th>
                              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Title & Author</th>
                              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Publish Date</th>
                              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {articles
                              .filter(a => a.title.toLowerCase().includes(newsSearchQuery.toLowerCase()))
                              .map((art) => (
                                <tr key={art.id} className="hover:bg-slate-50/50">
                                  <td className="px-4 py-3">
                                    {art.image_path ? (
                                      <img 
                                        src={art.image_path.startsWith("http") ? art.image_path : `http://localhost:8000${art.image_path}`} 
                                        alt="News Cover" 
                                        className="w-14 h-9 object-cover rounded-lg border border-slate-200" 
                                      />
                                    ) : (
                                      <div className="w-14 h-9 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 max-w-xs">
                                    <div className="space-y-0.5">
                                      <p className="font-bold text-slate-900 leading-snug line-clamp-1">{art.title}</p>
                                      <span className="text-[10px] text-slate-400 font-semibold">{art.author || "PEDIPO Admin"}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-slate-500 font-semibold">
                                    {art.published_at ? new Date(art.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                      art.status === "Published"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                        : "bg-amber-50 text-amber-700 border border-amber-100"
                                    }`}>
                                      {art.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <a 
                                        href={`/news/${art.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg inline-block"
                                        title="View"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => openEditNewsModal(art)}
                                        className="p-1 hover:bg-slate-100 text-blue-500 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                                        title="Edit"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => art.id && handleDeleteNews(art.id)}
                                        className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {activeTab !== "news" && (
                <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-[#746006] hover:bg-[#8A7300] disabled:bg-slate-300 text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* News & Updates Edit Modal popup - placed outside parent settings form */}
        {isNewsModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  {currentArticle ? "Edit News Article" : "Create News Article"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleSaveNews} className="divide-y divide-slate-100">
                <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-left">
                  {/* Article Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Article Title</label>
                    <input
                      type="text"
                      required
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      placeholder="e.g. Filamerian IT students join World Youth Skills Camp"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                    />
                  </div>

                  {/* Summary / Excerpt */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Summary Intro</label>
                    <textarea
                      rows={2}
                      required
                      value={newsSummary}
                      onChange={(e) => setNewsSummary(e.target.value)}
                      placeholder="Brief excerpt displayed on listing cards..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none"
                    />
                  </div>

                  {/* Content body */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Article Body Content</label>
                    <p className="text-[10px] text-slate-400">Separate paragraphs with double newlines (double Enter key).</p>
                    <textarea
                      rows={7}
                      required
                      value={newsContent}
                      onChange={(e) => setNewsContent(e.target.value)}
                      placeholder="Write your news article body here..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                    />
                  </div>

                  {/* Meta Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Author</label>
                      <input
                        type="text"
                        value={newsAuthor}
                        onChange={(e) => setNewsAuthor(e.target.value)}
                        placeholder="PEDIPO Admin"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Publish Date & Time</label>
                      <input
                        type="datetime-local"
                        value={newsPublishedAt}
                        onChange={(e) => setNewsPublishedAt(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Status</label>
                      <select
                        value={newsStatus}
                        onChange={(e) => setNewsStatus(e.target.value as "Published" | "Draft")}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  {/* Image Attachment */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Cover Image</label>
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 border border-slate-200/60 rounded-2xl">
                      {newsImagePreview ? (
                        <div className="w-full sm:w-36 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          <img src={newsImagePreview} alt="News Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full sm:w-36 h-20 rounded-xl border border-dashed border-slate-300 bg-white shrink-0 flex items-center justify-center text-xs text-slate-400">
                          No Image Selected
                        </div>
                      )}
                      <div className="text-left space-y-2 w-full">
                        <p className="text-[11px] text-slate-500 leading-snug">
                          Upload a photo related to the story. Suggested ratio 16:9 (maximum 5MB size).
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setNewsImageFile(file);
                              setNewsImagePreview(URL.createObjectURL(file));
                            }
                          }}
                          className="hidden"
                          id="news-cover-input-cms"
                        />
                        <label
                          htmlFor="news-cover-input-cms"
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-[11px] font-bold rounded-lg cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Cover Photo</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingNews}
                    className="px-4 py-2 bg-[#002B66] hover:bg-[#001D47] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {isSavingNews ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Article</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ManageLandingPage;
