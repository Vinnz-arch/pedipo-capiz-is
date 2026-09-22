import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/Mainlayout";
import { MsmeDirectoryService, type MsmeData, type MsmeStats } from "@/services/MsmeDirectoryService";
import { MunicipalityService, type MunicipalityData } from "@/services/MunicipalityService";
import { OpportunityService, type CategoryData } from "@/services/OpportunityService";
import { notify } from "@/util/notify";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Archive, 
  RefreshCw, 
  Upload, 
  Eye, 
  MapPin, 
  Store, 
  Building2, 
  FileText, 
  X, 
  Loader2, 
  Phone, 
  Mail, 
  Calendar,
  ShoppingBag
} from "lucide-react";

export const ManageMsmes: React.FC = () => {
  const [msmes, setMsmes] = useState<MsmeData[]>([]);
  const [municipalities, setMunicipalities] = useState<MunicipalityData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [stats, setStats] = useState<MsmeStats | null>(null);

  // States for list page
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuni, setSelectedMuni] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [includeArchived, setIncludeArchived] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMsme, setCurrentMsme] = useState<MsmeData | null>(null);

  // Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [msmeDetails, setMsmeDetails] = useState<MsmeData | null>(null);

  // Form States
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [enterpriseType, setEnterpriseType] = useState<"Micro" | "Small" | "Medium">("Micro");
  const [municipalityId, setMunicipalityId] = useState("");
  const [barangay, setBarangay] = useState("");
  const [completeAddress, setCompleteAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [productsServices, setProductsServices] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive" | "Pending Approval">("Pending Approval");
  const [dateRegistered, setDateRegistered] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [prodFile1, setProdFile1] = useState<File | null>(null);
  const [prodPreview1, setProdPreview1] = useState<string | null>(null);
  const [prodFile2, setProdFile2] = useState<File | null>(null);
  const [prodPreview2, setProdPreview2] = useState<string | null>(null);
  const [prodFile3, setProdFile3] = useState<File | null>(null);
  const [prodPreview3, setProdPreview3] = useState<string | null>(null);

  // Fetch dependencies (Municipalities, Categories) once
  const loadDependencies = async () => {
    try {
      const [muniRes, oppRes] = await Promise.all([
        MunicipalityService.getAll(),
        OpportunityService.getAll()
      ]);
      if (muniRes.municipalities) setMunicipalities(muniRes.municipalities);
      if (oppRes.categories) setCategories(oppRes.categories);
    } catch (error) {
      console.error("Failed to load select options:", error);
    }
  };

  // Fetch MSMEs based on filters & pagination
  const fetchMsmes = async () => {
    setIsLoading(true);
    try {
      const params = {
        search: searchQuery,
        municipality_id: selectedMuni,
        category_id: selectedCategory,
        enterprise_type: selectedSize,
        status: selectedStatus,
        include_archived: includeArchived ? "1" : "0",
        page: currentPage.toString(),
        per_page: "10"
      };
      const res = await MsmeDirectoryService.getAllAdmin(params);
      if (res.msmes) {
        setMsmes(res.msmes);
        setCurrentPage(res.pagination.current_page);
        setLastPage(res.pagination.last_page);
        setTotalRecords(res.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch MSMEs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats for dashboard cards
  const fetchStats = async () => {
    try {
      const res = await MsmeDirectoryService.getDashboardStats();
      if (res) {
        setStats(res);
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  };

  useEffect(() => {
    loadDependencies();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchMsmes();
  }, [searchQuery, selectedMuni, selectedCategory, selectedSize, selectedStatus, includeArchived, currentPage]);

  // Handle Logo Upload Preview
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notify.error("File Too Large", "Logo image must be under 5MB.");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Cover Upload Preview
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notify.error("File Too Large", "Cover image must be under 5MB.");
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Product Images Preview
  const handleProdImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notify.error("File Too Large", "Product image must be under 5MB.");
        return;
      }
      if (index === 1) {
        setProdFile1(file);
        const reader = new FileReader();
        reader.onloadend = () => setProdPreview1(reader.result as string);
        reader.readAsDataURL(file);
      } else if (index === 2) {
        setProdFile2(file);
        const reader = new FileReader();
        reader.onloadend = () => setProdPreview2(reader.result as string);
        reader.readAsDataURL(file);
      } else if (index === 3) {
        setProdFile3(file);
        const reader = new FileReader();
        reader.onloadend = () => setProdPreview3(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const openAddModal = () => {
    setCurrentMsme(null);
    setBusinessName("");
    setOwnerName("");
    setCategoryId(categories[0]?.id ? categories[0].id.toString() : "");
    setEnterpriseType("Micro");
    setMunicipalityId(municipalities[0]?.id ? municipalities[0].id.toString() : "");
    setBarangay("");
    setCompleteAddress("");
    setContactNumber("");
    setEmailAddress("");
    setBusinessDescription("");
    setProductsServices("");
    setStatus("Pending Approval");
    setDateRegistered(new Date().toISOString().split("T")[0]);
    setLatitude("");
    setLongitude("");
    setLogoFile(null);
    setLogoPreview(null);
    setCoverFile(null);
    setCoverPreview(null);
    setProdFile1(null);
    setProdPreview1(null);
    setProdFile2(null);
    setProdPreview2(null);
    setProdFile3(null);
    setProdPreview3(null);
    setIsModalOpen(true);
  };

  const openEditModal = (msme: MsmeData) => {
    setCurrentMsme(msme);
    setBusinessName(msme.business_name);
    setOwnerName(msme.owner_name);
    setCategoryId(msme.category_id ? msme.category_id.toString() : "");
    setEnterpriseType(msme.enterprise_type);
    setMunicipalityId(msme.municipality_id ? msme.municipality_id.toString() : "");
    setBarangay(msme.barangay);
    setCompleteAddress(msme.complete_address);
    setContactNumber(msme.contact_number);
    setEmailAddress(msme.email_address || "");
    setBusinessDescription(msme.business_description);
    setProductsServices(msme.products_services || "");
    setStatus(msme.status);
    setDateRegistered(msme.date_registered || "");
    setLatitude(msme.latitude ? msme.latitude.toString() : "");
    setLongitude(msme.longitude ? msme.longitude.toString() : "");
    setLogoFile(null);
    setLogoPreview(msme.logo_path ? resolveLogoUrl(msme.logo_path) : null);
    setCoverFile(null);
    setCoverPreview(msme.cover_path ? resolveLogoUrl(msme.cover_path) : null);
    setProdFile1(null);
    setProdPreview1(msme.product_image_1 ? resolveLogoUrl(msme.product_image_1) : null);
    setProdFile2(null);
    setProdPreview2(msme.product_image_2 ? resolveLogoUrl(msme.product_image_2) : null);
    setProdFile3(null);
    setProdPreview3(msme.product_image_3 ? resolveLogoUrl(msme.product_image_3) : null);
    setIsModalOpen(true);
  };

  const openDetailsModal = (msme: MsmeData) => {
    setMsmeDetails(msme);
    setIsDetailModalOpen(true);
  };

  const resolveLogoUrl = (path?: string | null) => {
    if (!path) return "https://images.unsplash.com/photo-1472898965229-f9b06b9c9bbe?auto=format&fit=crop&w=400&q=80";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `http://localhost:8000${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !ownerName || !categoryId || !municipalityId || !barangay || !completeAddress || !contactNumber || !businessDescription || !dateRegistered) {
      notify.warning("Validation Error", "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("business_name", businessName);
      formData.append("owner_name", ownerName);
      formData.append("category_id", categoryId);
      formData.append("enterprise_type", enterpriseType);
      formData.append("municipality_id", municipalityId);
      formData.append("barangay", barangay);
      formData.append("complete_address", completeAddress);
      formData.append("contact_number", contactNumber);
      formData.append("email_address", emailAddress);
      formData.append("business_description", businessDescription);
      formData.append("products_services", productsServices);
      formData.append("status", status);
      formData.append("date_registered", dateRegistered);
      if (latitude) formData.append("latitude", latitude);
      if (longitude) formData.append("longitude", longitude);
      
      if (logoFile) {
        formData.append("logo", logoFile);
      }
      if (coverFile) {
        formData.append("cover", coverFile);
      }
      if (prodFile1) {
        formData.append("product_image_1", prodFile1);
      }
      if (prodFile2) {
        formData.append("product_image_2", prodFile2);
      }
      if (prodFile3) {
        formData.append("product_image_3", prodFile3);
      }

      if (currentMsme && currentMsme.id) {
        // multipart update
        await MsmeDirectoryService.updateAdmin(currentMsme.id, formData);
      } else {
        await MsmeDirectoryService.createAdmin(formData);
      }

      setIsModalOpen(false);
      fetchMsmes();
      fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handler
  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to permanently delete this MSME record?")) {
      return;
    }

    try {
      await MsmeDirectoryService.deleteAdmin(id);
      fetchMsmes();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  // Archive handler
  const handleArchive = async (id: number | string) => {
    try {
      await MsmeDirectoryService.archiveAdmin(id);
      fetchMsmes();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 p-6 text-left pb-16">
        
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <Store className="w-8 h-8 text-[#0E204E]" />
              MSME Directory Management
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Create, edit, archive, and approve business profiles in Capiz Province.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold shadow-lg hover:shadow-blue-500/20 transition-all hover:-translate-y-0.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Business
          </button>
        </div>

        {/* Dashboard Statistics Widget cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total MSMEs Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#091535] to-[#0E204E] text-white p-6 rounded-3xl border border-white/5 shadow-xl flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#E2B714]">Total Registered</span>
                <h3 className="text-4xl font-black tracking-tight">{stats.total_msmes}</h3>
                <p className="text-[10px] text-slate-300 font-medium">Businesses currently registered</p>
              </div>
              <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-[#E2B714]">
                <Store className="w-7 h-7" />
              </div>
            </div>

            {/* Top Municipality Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">By Municipality</span>
                  <h4 className="text-lg font-black text-slate-800 mt-1">LGU Distribution</h4>
                </div>
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {stats.msmes_by_municipality?.length > 0 ? (
                  stats.msmes_by_municipality.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-700">{item.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-[10px]">
                        {item.count} {Number(item.count) === 1 ? "MSME" : "MSMEs"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-2 font-medium">No records found</p>
                )}
              </div>
            </div>

            {/* Top Industry Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">By Industry</span>
                  <h4 className="text-lg font-black text-slate-800 mt-1">Sectors</h4>
                </div>
                <div className="w-10 h-10 bg-[#E2B714]/10 text-[#E2B714] rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {stats.msmes_by_industry?.length > 0 ? (
                  stats.msmes_by_industry.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-700">{item.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px]">
                        {item.count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-2 font-medium">No records found</p>
                )}
              </div>
            </div>
            
          </div>
        )}

        {/* Filters Panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search business or owner..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
              />
            </div>

            {/* Municipality Filter */}
            <div>
              <select
                value={selectedMuni}
                onChange={(e) => { setSelectedMuni(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
              >
                <option value="All">All LGUs / Municipalities</option>
                {municipalities.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
              >
                <option value="All">All Categories / Industries</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Size Filter */}
            <div>
              <select
                value={selectedSize}
                onChange={(e) => { setSelectedSize(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
              >
                <option value="All">All Enterprise Sizes</option>
                <option value="Micro">Micro (≤ ₱3M assets)</option>
                <option value="Small">Small (₱3M - ₱15M assets)</option>
                <option value="Medium">Medium (₱15M - ₱100M assets)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active / Approved</option>
                <option value="Inactive">Inactive / Suspended</option>
                <option value="Pending Approval">Pending Approval</option>
              </select>
            </div>

          </div>

          {/* Archive state switch toggle */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              id="include_archived"
              checked={includeArchived}
              onChange={(e) => { setIncludeArchived(e.target.checked); setCurrentPage(1); }}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="include_archived" className="text-xs font-bold text-slate-600 select-none cursor-pointer flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5 text-slate-400" />
              Show Archived Businesses Only
            </label>
          </div>
        </div>

        {/* MSMEs Data Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-xs font-bold text-slate-500">Retrieving business directory...</span>
            </div>
          ) : msmes.length === 0 ? (
            <div className="py-24 text-center">
              <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-extrabold text-slate-700">No Business Records Found</h4>
              <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto mt-1">
                Try loosening your filters, search terms, or check if the list matches archived options.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Business</th>
                    <th className="py-4 px-6">Owner</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Size</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Registered</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  {msmes.map((msme) => (
                    <tr key={msme.id} className="hover:bg-slate-50/50 transition-all">
                      {/* Logo and Business name */}
                      <td className="py-4 px-6 flex items-center gap-3">
                        <img
                          src={resolveLogoUrl(msme.logo_path)}
                          alt="logo"
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-extrabold text-slate-800 truncate max-w-[180px]">{msme.business_name}</span>
                          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">
                            {msme.email_address || "No Email"}
                          </span>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="py-4 px-6 text-slate-600">{msme.owner_name}</td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
                          {msme.category?.name || "Uncategorized"}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-slate-800">{msme.municipality?.name || "N/A"}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{msme.barangay}</span>
                        </div>
                      </td>

                      {/* Size */}
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full font-extrabold text-[9px] uppercase border ${
                          msme.enterprise_type === 'Micro' 
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : msme.enterprise_type === 'Small'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {msme.enterprise_type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full font-extrabold text-[9px] uppercase ${
                          msme.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : msme.status === 'Inactive'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {msme.status}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-4 px-6 text-slate-500 font-medium">
                        {msme.date_registered ? new Date(msme.date_registered).toLocaleDateString() : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDetailsModal(msme)}
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                            title="Quick View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {!msme.is_archived && (
                            <>
                              <button
                                onClick={() => openEditModal(msme)}
                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all"
                                title="Edit Record"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleArchive(msme.id!)}
                                className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-all"
                                title="Archive Business"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {msme.is_archived && (
                            <button
                              onClick={() => handleArchive(msme.id!)}
                              className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all"
                              title="Restore Business"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(msme.id!)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                            title="Permanently Delete"
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

          {/* Table Footer Pagination */}
          {!isLoading && lastPage > 1 && (
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">
                Showing Page {currentPage} of {lastPage} ({totalRecords} total records)
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                {Array.from({ length: lastPage }, (_, index) => index + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      currentPage === pg 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  disabled={currentPage === lastPage}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col text-slate-800 animate-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-800">
                  {currentMsme ? "Edit MSME Record" : "Add New MSME Business"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. Basic Info Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">Business Name *</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Capiz Seafoods Processing"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">Owner / Contact Person Name *</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Juan Dela Cruz"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* 2. Categorization & Size */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">Category / Industry Sector *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">Enterprise Size *</label>
                    <select
                      value={enterpriseType}
                      onChange={(e) => setEnterpriseType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    >
                      <option value="Micro">Micro (≤ ₱3M assets)</option>
                      <option value="Small">Small (₱3M - ₱15M assets)</option>
                      <option value="Medium">Medium (₱15M - ₱100M assets)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">Registration Date *</label>
                    <input
                      type="date"
                      required
                      value={dateRegistered}
                      onChange={(e) => setDateRegistered(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* 3. Address Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">Municipality *</label>
                    <select
                      value={municipalityId}
                      onChange={(e) => setMunicipalityId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    >
                      {municipalities.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">Barangay *</label>
                    <input
                      type="text"
                      required
                      value={barangay}
                      onChange={(e) => setBarangay(e.target.value)}
                      placeholder="e.g. Sublangon"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">Complete Address Street *</label>
                    <input
                      type="text"
                      required
                      value={completeAddress}
                      onChange={(e) => setCompleteAddress(e.target.value)}
                      placeholder="e.g. Coastal Road, Sublangon"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* 4. Contacts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">Contact Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="e.g. 09171234567"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="e.g. shop@business.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* 5. Business Description & Services */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">Business Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      placeholder="Provide details about the company's background, vision, and operations..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 resize-y"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">Products / Services (Comma-separated)</label>
                    <textarea
                      rows={2}
                      value={productsServices}
                      onChange={(e) => setProductsServices(e.target.value)}
                      placeholder="e.g. Canned Tuna, Cold Storage, Crab Seedlings"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 resize-y"
                    />
                  </div>
                </div>

                {/* 6. Coordinates & Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">Latitude Coordinate (Optional)</label>
                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="e.g. 11.5852"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">Longitude Coordinate (Optional)</label>
                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="e.g. 122.7533"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600 block">Public Status *</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                    >
                      <option value="Active">Active (Visible Publicly)</option>
                      <option value="Inactive">Inactive / Suspended</option>
                      <option value="Pending Approval">Pending Approval (Hidden)</option>
                    </select>
                  </div>
                </div>

                {/* 7. Business Logo Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-600 block">Business Logo / Image</label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all">
                    <div className="shrink-0 w-24 h-24 bg-white rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <p className="text-[11px] text-slate-500 font-medium">
                        Upload a JPG, PNG, WEBP, or SVG image. Max limit size: 5MB.
                      </p>
                      <label className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer text-slate-700 shadow-sm transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        Choose Logo Image File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 8. Business Cover Photo Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-600 block">Business Cover Photo</label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all">
                    <div className="shrink-0 w-24 h-24 bg-white rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center">
                      {coverPreview ? (
                        <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <p className="text-[11px] text-slate-500 font-medium">
                        Upload a JPG, PNG, WEBP, or SVG image. Max limit size: 5MB.
                      </p>
                      <label className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer text-slate-700 shadow-sm transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        Choose Cover Image File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 9. Featured Products Showcase Images */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-600 block">Featured Product Showcase Images (Up to 3)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Product Image 1 */}
                    <div className="p-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col items-center text-center gap-3">
                      <div className="w-full h-24 bg-white rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center">
                        {prodPreview1 ? (
                          <img src={prodPreview1} alt="Product 1 preview" className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <label className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold cursor-pointer text-slate-700 shadow-sm transition-all">
                        <Upload className="w-3 h-3" />
                        Product 1
                        <input type="file" accept="image/*" onChange={(e) => handleProdImageChange(1, e)} className="hidden" />
                      </label>
                    </div>

                    {/* Product Image 2 */}
                    <div className="p-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col items-center text-center gap-3">
                      <div className="w-full h-24 bg-white rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center">
                        {prodPreview2 ? (
                          <img src={prodPreview2} alt="Product 2 preview" className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <label className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold cursor-pointer text-slate-700 shadow-sm transition-all">
                        <Upload className="w-3 h-3" />
                        Product 2
                        <input type="file" accept="image/*" onChange={(e) => handleProdImageChange(2, e)} className="hidden" />
                      </label>
                    </div>

                    {/* Product Image 3 */}
                    <div className="p-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col items-center text-center gap-3">
                      <div className="w-full h-24 bg-white rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center">
                        {prodPreview3 ? (
                          <img src={prodPreview3} alt="Product 3 preview" className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <label className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold cursor-pointer text-slate-700 shadow-sm transition-all">
                        <Upload className="w-3 h-3" />
                        Product 3
                        <input type="file" accept="image/*" onChange={(e) => handleProdImageChange(3, e)} className="hidden" />
                      </label>
                    </div>

                  </div>
                </div>

              </form>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold rounded-xl transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-md hover:shadow-blue-500/10 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {currentMsme ? "Save Changes" : "Register Business"}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Quick View Detail Modal */}
        {isDetailModalOpen && msmeDetails && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Business Profile Preview
                </h4>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable details */}
              <div className="overflow-y-auto p-6 space-y-5 text-slate-700 text-xs">
                
                {/* Logo and Name header */}
                <div className="flex gap-4 items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <img
                    src={resolveLogoUrl(msmeDetails.logo_path)}
                    alt="logo"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
                  />
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-800">{msmeDetails.business_name}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[9px] uppercase border border-blue-200">
                        {msmeDetails.category?.name || "Category"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-extrabold text-[9px] uppercase border border-purple-200">
                        {msmeDetails.enterprise_type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specific field grid details */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Owner Name</span>
                    <p className="font-extrabold text-slate-800">{msmeDetails.owner_name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Registration Date</span>
                    <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {msmeDetails.date_registered ? new Date(msmeDetails.date_registered).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Contact Number</span>
                    <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {msmeDetails.contact_number}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Email Address</span>
                    <p className="font-extrabold text-slate-800 flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {msmeDetails.email_address || "None"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Complete Address</span>
                    <p className="font-extrabold text-slate-800">
                      {msmeDetails.complete_address}, Brgy. {msmeDetails.barangay}, {msmeDetails.municipality?.name || "N/A"}, Capiz
                    </p>
                  </div>
                  
                  {msmeDetails.latitude && msmeDetails.longitude && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Map Coordinates</span>
                      <p className="font-extrabold text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
                        Lat: {msmeDetails.latitude}, Lng: {msmeDetails.longitude}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Business Description</span>
                    <p className="text-slate-600 font-medium leading-relaxed bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      {msmeDetails.business_description}
                    </p>
                  </div>

                  {msmeDetails.products_services && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Products / Services Offered</span>
                      <p className="text-slate-600 font-medium leading-relaxed bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        {msmeDetails.products_services}
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-md text-xs transition-all"
                >
                  Close Preview
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default ManageMsmes;
