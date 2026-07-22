import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/Mainlayout";
import { LandingPageService, type LandingPageSettingData } from "@/services/LandingPageService";
import { notify } from "@/util/notify";
import { 
  Save, 
  Settings, 
  Target, 
  Briefcase, 
  Phone, 
  Heart,
  Loader2
} from "lucide-react";

export const ManageLandingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"hero" | "vision" | "divisions" | "mandate" | "contact">("hero");

  // Form states
  const [heroBadge, setHeroBadge] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroDescription, setHeroDescription] = useState("");

  const [visionText, setVisionText] = useState("");
  const [missionPoint1, setMissionPoint1] = useState("");
  const [missionPoint2, setMissionPoint2] = useState("");
  const [missionPoint3, setMissionPoint3] = useState("");

  const [msmeTitle, setMsmeTitle] = useState("");
  const [msmeDescription, setMsmeDescription] = useState("");
  const [mandateText, setMandateText] = useState("");
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

          setVisionText(s.vision_text);
          setMissionPoint1(s.mission_point_1);
          setMissionPoint2(s.mission_point_2);
          setMissionPoint3(s.mission_point_3);

          setMsmeTitle(s.msme_title);
          setMsmeDescription(s.msme_description);
          setMandateText(s.mandate_text);
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
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload: LandingPageSettingData = {
      hero_badge: heroBadge.trim(),
      hero_title: heroTitle.trim(),
      hero_subtitle: heroSubtitle.trim(),
      hero_description: heroDescription.trim(),
      vision_text: visionText.trim(),
      mission_point_1: missionPoint1.trim(),
      mission_point_2: missionPoint2.trim(),
      mission_point_3: missionPoint3.trim(),
      msme_title: msmeTitle.trim(),
      msme_description: msmeDescription.trim(),
      mandate_text: mandateText.trim(),
      service_pledge_1: servicePledge1.trim(),
      service_pledge_2: servicePledge2.trim(),
      service_pledge_3: servicePledge3.trim(),
      service_pledge_4: servicePledge4.trim(),
      contact_address: contactAddress.trim(),
      contact_email: contactEmail.trim(),
      contact_phone: contactPhone.trim(),
      contact_facebook: contactFacebook.trim(),
      contact_twitter: contactTwitter.trim(),
      contact_linkedin: contactLinkedin.trim(),
      division_1_title: div1Title.trim(),
      division_1_subtitle: div1Subtitle.trim(),
      division_1_bullets: div1Bullets.trim(),
      division_2_title: div2Title.trim(),
      division_2_subtitle: div2Subtitle.trim(),
      division_2_bullets: div2Bullets.trim(),
      division_3_title: div3Title.trim(),
      division_3_subtitle: div3Subtitle.trim(),
      division_3_bullets: div3Bullets.trim(),
    };

    try {
      await LandingPageService.updateSettings(payload);
    } catch (error) {
      console.error("Failed to save landing settings:", error);
    } finally {
      setIsSaving(false);
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
              </div>

              {/* Action Buttons */}
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
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ManageLandingPage;
