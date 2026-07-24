import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/Mainlayout";
import { MunicipalityService, type MunicipalityData } from "@/services/MunicipalityService";
import { notify } from "@/util/notify";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Globe, 
  X, 
  Upload,
  Building,
  Loader2,
  Eye,
  Map,
  Users,
  Layers,
  TrendingUp,
  Mail,
  Phone,
  ExternalLink
} from "lucide-react";

const Municipalities = () => {
  const [municipalities, setMunicipalities] = useState<MunicipalityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMuni, setCurrentMuni] = useState<MunicipalityData | null>(null);

  // Details Modal State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [muniForDetails, setMuniForDetails] = useState<MunicipalityData | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [muniClass, setMuniClass] = useState("1st Class");
  const [population, setPopulation] = useState<number>(0);
  const [landArea, setLandArea] = useState<number>(0);
  const [barangayCount, setBarangayCount] = useState<number>(0);
  const [gdp, setGdp] = useState<number>(0);
  const [keyIndustries, setKeyIndustries] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  
  // Image Seal State
  const [sealFile, setSealFile] = useState<File | null>(null);
  const [sealPreview, setSealPreview] = useState<string | null>(null);

  const fetchMunicipalities = async () => {
    setIsLoading(true);
    try {
      const res = await MunicipalityService.getAll();
      if (res.municipalities) {
        setMunicipalities(res.municipalities);
      }
    } catch (error) {
      console.error("Failed to load municipalities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMunicipalities();
  }, []);

  const openAddModal = () => {
    setCurrentMuni(null);
    setName("");
    setMuniClass("1st Class");
    setPopulation(0);
    setLandArea(0);
    setBarangayCount(0);
    setGdp(0);
    setKeyIndustries("");
    setDescription("");
    setContactEmail("");
    setContactPhone("");
    setWebsiteUrl("");
    setSealFile(null);
    setSealPreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (muni: MunicipalityData) => {
    setCurrentMuni(muni);
    setName(muni.name);
    setMuniClass(muni.class);
    setPopulation(muni.population);
    setLandArea(muni.land_area);
    setBarangayCount(muni.barangay_count);
    setGdp(muni.gdp || 0);
    setKeyIndustries(muni.key_industries || "");
    setDescription(muni.description || "");
    setContactEmail(muni.contact_email || "");
    setContactPhone(muni.contact_phone || "");
    setWebsiteUrl(muni.website_url || "");
    setSealFile(null);

    if (muni.seal_path) {
      setSealPreview(
        muni.seal_path.startsWith("http")
          ? muni.seal_path
          : `http://localhost:8000${muni.seal_path}`
      );
    } else {
      setSealPreview(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !muniClass) {
      notify.warning("Validation Error", "Municipality Name and Classification are required.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("class", muniClass);
    formData.append("population", population.toString());
    formData.append("land_area", landArea.toString());
    formData.append("barangay_count", barangayCount.toString());
    formData.append("gdp", gdp.toString());
    formData.append("key_industries", keyIndustries.trim());
    formData.append("description", description.trim());
    formData.append("contact_email", contactEmail.trim());
    formData.append("contact_phone", contactPhone.trim());
    formData.append("website_url", websiteUrl.trim());

    if (sealFile) {
      formData.append("seal", sealFile);
    }

    try {
      if (currentMuni && currentMuni.id) {
        await MunicipalityService.update(currentMuni.id, formData);
      } else {
        await MunicipalityService.create(formData);
      }
      setIsModalOpen(false);
      fetchMunicipalities();
    } catch (error) {
      console.error("Failed to save municipality details:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this municipality profile?")) return;
    try {
      await MunicipalityService.delete(id);
      fetchMunicipalities();
    } catch (error) {
      console.error("Failed to delete municipality profile:", error);
    }
  };

  const filteredMuni = municipalities.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.key_industries && m.key_industries.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesClass = selectedClass === "All" || m.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const incomeClasses = [
    "All",
    "Component City",
    "1st Class",
    "2nd Class",
    "3rd Class",
    "4th Class",
    "5th Class"
  ];

  return (
    <MainLayout>
      <div className="space-y-6 pb-12 font-sans text-left">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-black text-[#002B66] tracking-tight">Capiz Municipalities</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage demographic profiles, land area, economic sectors, and official seals of local government units.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#002B66] hover:bg-[#001D47] text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 uppercase tracking-wider cursor-pointer w-fit shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Municipality</span>
          </button>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-slate-200/60 p-4 rounded-2xl shadow-xs">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or industries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#002B66]/10 focus:border-[#002B66] transition-all"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-thin py-1">
            {incomeClasses.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap cursor-pointer ${
                  selectedClass === cls
                    ? "bg-[#746006] text-white border-[#746006] shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Municipalities Main Grid */}
        {isLoading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-9 h-9 text-[#002B66] animate-spin" />
              <p className="text-xs font-semibold text-slate-400">Loading municipalities list...</p>
            </div>
          </div>
        ) : filteredMuni.length === 0 ? (
          <div className="min-h-[30vh] border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 bg-slate-50/50">
            <Building className="w-10 h-10 text-slate-300" />
            <p className="text-xs font-bold text-slate-500 mt-3">No Municipalities Found</p>
            <p className="text-[11px] text-slate-400 mt-1">Try resetting your search query or class filters.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200">
                    <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Municipality</th>
                    <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Details</th>
                    <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredMuni.map((muni) => {
                    return (
                      <tr key={muni.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200/80 p-0.5 flex items-center justify-center overflow-hidden shrink-0">
                              {muni.seal_path && !muni.seal_path.includes("default_seal.png") ? (
                                <img 
                                  src={muni.seal_path.startsWith("http") ? muni.seal_path : `http://localhost:8000${muni.seal_path}`} 
                                  alt={`${muni.name} Seal`}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="text-[8px] font-bold text-slate-400 block tracking-tighter">No Seal</span>
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900 text-sm">{muni.name}</p>
                              {muni.website_url && (
                                <a 
                                  href={muni.website_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[9px] text-[#002B66] hover:underline font-bold inline-flex items-center gap-0.5"
                                >
                                  <Globe className="w-2.5 h-2.5" />
                                  <span>Website</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => {
                              setMuniForDetails(muni);
                              setIsDetailsOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#002B66]/5 hover:bg-[#002B66] text-[#002B66] hover:text-white text-xs font-bold rounded-lg border border-transparent hover:border-[#002B66] transition-all duration-200 cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(muni)}
                              className="p-1.5 hover:bg-slate-100 text-blue-500 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => muni.id && handleDelete(muni.id)}
                              className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Dialog Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  {currentMuni ? "Edit Municipality Profile" : "Add Municipality Profile"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Form Element */}
              <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
                <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-left">
                  {/* Basic Row: Name & Class */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Municipality / City Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sigma"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Income Classification</label>
                      <select
                        value={muniClass}
                        onChange={(e) => setMuniClass(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                      >
                        <option value="Component City">Component City</option>
                        <option value="1st Class">1st Class</option>
                        <option value="2nd Class">2nd Class</option>
                        <option value="3rd Class">3rd Class</option>
                        <option value="4th Class">4th Class</option>
                        <option value="5th Class">5th Class</option>
                      </select>
                    </div>
                  </div>

                  {/* Demographics Row: Population, Land Area, Barangay Count, GDP */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Total Population</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={population}
                        onChange={(e) => setPopulation(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Land Area (sq km)</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min={0}
                        value={landArea}
                        onChange={(e) => setLandArea(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Barangay Count</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={barangayCount}
                        onChange={(e) => setBarangayCount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">GDP (Million PHP)</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min={0}
                        value={gdp}
                        onChange={(e) => setGdp(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none"
                      />
                    </div>
                  </div>

                  {/* Description profile */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Economic Profile Summary</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief overview of history, economic potential, and local traits..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                    />
                  </div>

                  {/* Key industries (comma separated tag inputs) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Key Economic Sectors (comma-separated)</label>
                    <input
                      type="text"
                      value={keyIndustries}
                      onChange={(e) => setKeyIndustries(e.target.value)}
                      placeholder="e.g. Aquaculture, Rice Milling, Ecotourism"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                    />
                  </div>

                  {/* Contact Metas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">LGU Website URL</label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Contact Email</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="info@lgu.gov.ph"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Contact Telephone</label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="(036) 123-456"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Seal Emblem Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Official seal image</label>
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 border border-slate-200/60 rounded-2xl">
                      {sealPreview ? (
                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white p-1 shrink-0 flex items-center justify-center">
                          <img src={sealPreview} alt="Seal Preview" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl border border-dashed border-slate-300 bg-white shrink-0 flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center p-2">
                          No Seal
                        </div>
                      )}
                      <div className="text-left space-y-2 w-full">
                        <p className="text-[11px] text-slate-500 leading-snug">
                          Upload high-resolution transparent seal/logo (PNG or JPG). Max size 5MB.
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSealFile(file);
                              setSealPreview(URL.createObjectURL(file));
                            }
                          }}
                          className="hidden"
                          id="muni-seal-input"
                        />
                        <label
                          htmlFor="muni-seal-input"
                          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-[11px] font-bold rounded-lg cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Seal Logo</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Modal Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#002B66] hover:bg-[#001D47] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Profile</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {isDetailsOpen && muniForDetails && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-[#002B66] uppercase tracking-wider">
                  LGU Economic Profile
                </span>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-left">
                {/* Official Seal and LGU Info Header */}
                <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-100 pb-5">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200/85 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {muniForDetails.seal_path && !muniForDetails.seal_path.includes("default_seal.png") ? (
                      <img 
                        src={muniForDetails.seal_path.startsWith("http") ? muniForDetails.seal_path : `http://localhost:8000${muniForDetails.seal_path}`} 
                        alt={`${muniForDetails.name} Seal`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center p-1 leading-tighter">No Seal</span>
                    )}
                  </div>
                  <div className="text-center sm:text-left space-y-1.5 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h2 className="text-2xl font-black text-[#002B66] tracking-tight">{muniForDetails.name}</h2>
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit mx-auto sm:mx-0 ${
                        muniForDetails.class === "Component City"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}>
                        {muniForDetails.class}
                      </span>
                    </div>
                    {muniForDetails.website_url && (
                      <a 
                        href={muniForDetails.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-[#002B66] hover:text-[#001D47] hover:underline font-bold inline-flex items-center gap-1"
                      >
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>Visit LGU Website</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Population */}
                  <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                    <div className="bg-blue-50 text-blue-600 rounded-xl p-2.5 shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Population</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">
                        {muniForDetails.population ? Number(muniForDetails.population).toLocaleString() : "0"}
                      </p>
                    </div>
                  </div>

                  {/* Land Area */}
                  <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                    <div className="bg-emerald-50 text-emerald-600 rounded-xl p-2.5 shrink-0">
                      <Map className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Land Area</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5 whitespace-nowrap">
                        {muniForDetails.land_area} ㎡
                      </p>
                    </div>
                  </div>

                  {/* Barangays */}
                  <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                    <div className="bg-indigo-50 text-indigo-600 rounded-xl p-2.5 shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Number of Barangays</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">
                        {muniForDetails.barangay_count}
                      </p>
                    </div>
                  </div>

                  {/* GDP */}
                  <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                    <div className="bg-amber-50 text-[#746006] rounded-xl p-2.5 shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">GDP (PHP)</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">
                        ₱{Number(muniForDetails.gdp || 0).toLocaleString()}M
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Economic Sectors */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>Key Economic Sectors</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 p-4 bg-slate-50/40 border border-slate-100 rounded-2xl">
                    {muniForDetails.key_industries ? (
                      muniForDetails.key_industries.split(",").map((ind, i) => (
                        <span 
                          key={i} 
                          className="px-3 py-1 bg-[#746006]/5 text-[#746006] border border-[#746006]/20 rounded-lg text-xs font-bold whitespace-nowrap shadow-2xs"
                        >
                          {ind.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs italic">No key sectors specified</span>
                    )}
                  </div>
                </div>

                {/* Economic Profile Summary */}
                {muniForDetails.description && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Economic Profile Summary</h4>
                    <div className="bg-slate-50/40 border-l-4 border-[#002B66] p-4 rounded-r-2xl rounded-l-md text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                      {muniForDetails.description}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                {(muniForDetails.contact_email || muniForDetails.contact_phone) && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Contact Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
                      {muniForDetails.contact_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <a href={`mailto:${muniForDetails.contact_email}`} className="hover:text-[#002B66] hover:underline">
                            {muniForDetails.contact_email}
                          </a>
                        </div>
                      )}
                      {muniForDetails.contact_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{muniForDetails.contact_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(false)}
                  className="px-5 py-2.5 bg-[#002B66] hover:bg-[#001D47] text-white text-xs font-bold rounded-xl transition-all uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Municipalities;