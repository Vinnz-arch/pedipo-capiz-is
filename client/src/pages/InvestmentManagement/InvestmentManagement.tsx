import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/Mainlayout";
import { 
  Globe, 
  Mail, 
  Eye, 
  MessageSquare, 
  PlusCircle, 
  RefreshCw, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Upload,
  X,
  Info,
  UploadCloud,
  Pencil,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { OpportunityService, type OpportunityData, type CategoryData } from "@/services/OpportunityService";

interface Project {
  id: string;
  name: string;
  location: string;
  category: string;
  categoryId: number;
  roi: string;
  status: "Published" | "Draft" | "Closed";
  landArea: string;
  image: string;
  incentives: string[];
  description: string;
}

export const InvestmentManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Delete State
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Form Fields
  const [projectName, setProjectName] = useState("");
  const [categoryId, setCategoryId] = useState<number>(1);
  const [roiEstimate, setRoiEstimate] = useState("");
  const [landArea, setLandArea] = useState("");
  const [statusOption, setStatusOption] = useState<Project["status"]>("Draft");
  const [incentivePackage, setIncentivePackage] = useState("");
  const [keyIncentives, setKeyIncentives] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const resolveImageUrl = (path?: string) => {
    if (!path) return "/images/seafood_hub.png";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
      return path;
    }
    return `http://localhost:8000${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // Helper to map API data to UI model
  const mapApiToProject = (item: OpportunityData): Project => ({
    id: String(item.id),
    name: item.project_name,
    location: "Roxas City, Capiz",
    category: item.category?.name || "General",
    categoryId: item.category_id,
    roi: item.roi_estimate ? `${item.roi_estimate}%` : "0%",
    status: item.status || "Draft",
    landArea: item.land_area ? `${item.land_area} Ha` : "0 Ha",
    image: resolveImageUrl(item.image_path),
    incentives: item.incentive_package 
      ? item.incentive_package.split(",").map(s => s.trim().toUpperCase()).filter(Boolean)
      : ["LOCAL INCENTIVES"],
    description: item.incentive_package || "No description provided."
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await OpportunityService.getAll();
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
        setCategoryId(data.categories[0].id);
      }
      if (data.opportunities) {
        const mapped = data.opportunities.map(mapApiToProject);
        setProjects(mapped);
        if (mapped.length > 0) {
          setSelectedProject(mapped[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load opportunities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateListing = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
    }, 600);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const resetForm = () => {
    setProjectName("");
    setCategoryId(categories[0]?.id || 1);
    setRoiEstimate("");
    setLandArea("");
    setStatusOption("Draft");
    setIncentivePackage("");
    setKeyIncentives("");
    setSelectedFile(null);
    setImagePreview(null);
    setEditingProjectId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProjectId(project.id);
    setProjectName(project.name);
    setCategoryId(project.categoryId);
    setRoiEstimate(project.roi.replace("%", ""));
    setLandArea(project.landArea.replace(" Ha", ""));
    setStatusOption(project.status);
    setKeyIncentives(project.incentives.join(", "));
    setIncentivePackage(project.description);
    setImagePreview(project.image);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const confirmDelete = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeletingProject(project);
  };

  const handleDeleteConfirmed = async () => {
    if (!deletingProject) return;

    try {
      await OpportunityService.delete(deletingProject.id);
      const remainingProjects = projects.filter(p => p.id !== deletingProject.id);
      setProjects(remainingProjects);

      if (selectedProject?.id === deletingProject.id) {
        setSelectedProject(remainingProjects.length > 0 ? remainingProjects[0] : null);
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingProject(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const formData = new FormData();
    formData.append("project_name", projectName.trim());
    formData.append("category_id", String(categoryId));
    if (roiEstimate) formData.append("roi_estimate", roiEstimate.replace("%", ""));
    if (landArea) formData.append("land_area", landArea.replace("Ha", "").trim());
    formData.append("status", statusOption);
    
    // Pass keyIncentives or incentivePackage as incentive_package
    const finalIncentives = keyIncentives.trim() || incentivePackage.trim();
    if (finalIncentives) formData.append("incentive_package", finalIncentives);

    if (selectedFile && selectedFile instanceof File) {
      formData.append("image", selectedFile);
    }

    try {
      if (editingProjectId) {
        const res = await OpportunityService.update(editingProjectId, formData);
        const updatedProject = mapApiToProject(res.opportunity);
        
        setProjects(prev => prev.map(p => p.id === editingProjectId ? updatedProject : p));
        if (selectedProject?.id === editingProjectId) {
          setSelectedProject(updatedProject);
        }
      } else {
        const res = await OpportunityService.create(formData);
        const newProject = mapApiToProject(res.opportunity);
        
        setProjects(prev => [newProject, ...prev]);
        setSelectedProject(newProject);
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Form save error:", error);
    }
  };

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "Published":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Published
          </span>
        );
      case "Draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
            Draft
          </span>
        );
      case "Closed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            Closed
          </span>
        );
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-12 font-sans relative">
        {/* Top Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground font-semibold mb-1 flex items-center gap-1.5">
              <span>Registry</span>
              <span className="text-muted-foreground/50">&rsaquo;</span>
              <span className="text-primary font-bold">Opportunity Management</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#0B2545] tracking-tight">
              Investment Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Curation and publication of high-value investment opportunities in Capiz.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-[#002B66] hover:bg-[#001D47] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Opportunity</span>
            </button>
            <button 
              onClick={loadData}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>Sync Portal</span>
            </button>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Published */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                PUBLISHED
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {projects.filter(p => p.status === "Published").length}
              </h3>
            </div>
          </div>

          {/* Drafts */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                DRAFTS
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {projects.filter(p => p.status === "Draft").length}
              </h3>
            </div>
          </div>

          {/* Portal Views */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                PORTAL VIEWS
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">12.2k</h3>
            </div>
          </div>

          {/* Inquiries */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                INQUIRIES
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">42</h3>
            </div>
          </div>
        </div>

        {/* Main Content Split: Left Table & Right Opportunity Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Table Section */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Current Opportunities</h2>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Filter">
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Sort">
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Opportunities Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-3.5">PROJECT NAME</th>
                      <th className="px-4 py-3.5">CATEGORY</th>
                      <th className="px-4 py-3.5">ROI</th>
                      <th className="px-4 py-3.5">STATUS</th>
                      <th className="px-4 py-3.5 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                          Loading opportunities...
                        </td>
                      </tr>
                    ) : projects.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                          No opportunities found. Click "Create Opportunity" to add one.
                        </td>
                      </tr>
                    ) : (
                      projects.map((project) => {
                        const isSelected = selectedProject?.id === project.id;
                        return (
                          <tr
                            key={project.id}
                            onClick={() => setSelectedProject(project)}
                            className={`cursor-pointer transition-colors group ${
                              isSelected 
                                ? "bg-blue-50/50 border-l-4 border-l-blue-600" 
                                : "hover:bg-slate-50/80"
                            }`}
                          >
                            {/* Project Name & Image */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={project.image}
                                  alt={project.name}
                                  className="w-10 h-10 rounded-lg object-cover shadow-xs border border-slate-200 shrink-0"
                                />
                                <div>
                                  <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {project.name}
                                  </h4>
                                  <p className="text-xs text-slate-400 font-medium">
                                    {project.location}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="px-4 py-4 text-slate-600 font-medium whitespace-nowrap">
                              {project.category}
                            </td>

                            {/* ROI */}
                            <td className="px-4 py-4 font-bold text-slate-900 whitespace-nowrap">
                              {project.roi}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-4 whitespace-nowrap">
                              {getStatusBadge(project.status)}
                            </td>

                            {/* Actions: Edit & Delete */}
                            <td className="px-4 py-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <button 
                                  onClick={(e) => openEditModal(project, e)}
                                  title="Edit Opportunity"
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => confirmDelete(project, e)}
                                  title="Delete Opportunity"
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table Footer */}
            <div className="p-4 text-center border-t border-slate-100 bg-slate-50/30">
              <button 
                className="text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
              >
                View All {projects.length} Projects
              </button>
            </div>
          </div>

          {/* Right Opportunity Preview Card */}
          {selectedProject && (
            <div className="lg:col-span-5 xl:col-span-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Opportunity Preview
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Editing: <span className="text-slate-700 font-semibold">{selectedProject.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => openEditModal(selectedProject)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Preview Banner Image */}
              <div className="w-full h-44 rounded-xl overflow-hidden shadow-inner border border-slate-200/60 relative">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Metrics Pair: Estimated ROI & Land Area */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Estimated ROI
                  </span>
                  <span className="text-xl font-extrabold text-[#002B66] mt-1 block">
                    {selectedProject.roi}
                  </span>
                </div>
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Land Area
                  </span>
                  <span className="text-xl font-extrabold text-[#002B66] mt-1 block">
                    {selectedProject.landArea}
                  </span>
                </div>
              </div>

              {/* Key Incentives */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Key Incentives
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.incentives.map((incentive, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase border border-blue-100/80"
                    >
                      {incentive}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Description
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {selectedProject.description}
                </p>
              </div>

              <hr className="border-slate-100" />

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={handleUpdateListing}
                  disabled={isUpdating}
                  className="w-full bg-[#002B66] hover:bg-[#001D47] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUpdating ? "Updating Listing..." : "Update Listing"}</span>
                </button>
                <button
                  className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create / Edit Opportunity Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 flex flex-col">
              {/* Modal Header */}
              <div className="bg-[#002B66] text-white px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  {editingProjectId ? "Edit Opportunity" : "Create New Opportunity"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleFormSubmit}>
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  {/* Row 1: Project Name & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Project Name</label>
                      <input
                        type="text"
                        required
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g. Capiz Logistics Hub"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Category</label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: ROI Estimate & Land Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">ROI Estimate (%)</label>
                      <input
                        type="text"
                        value={roiEstimate}
                        onChange={(e) => setRoiEstimate(e.target.value)}
                        placeholder="12.5"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Land Area (Hectares)</label>
                      <input
                        type="text"
                        value={landArea}
                        onChange={(e) => setLandArea(e.target.value)}
                        placeholder="5.0"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                      />
                    </div>
                  </div>

                  {/* Status Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Status</label>
                    <select
                      value={statusOption}
                      onChange={(e) => setStatusOption(e.target.value as Project["status"])}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  {/* Key Incentives */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Key Incentives</label>
                    <input
                      type="text"
                      value={keyIncentives}
                      onChange={(e) => setKeyIncentives(e.target.value)}
                      placeholder="e.g. TAX HOLIDAY (5Y), DUTY-FREE IMPORTS, LOCAL LABOR SUBSIDY"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all"
                    />
                    <p className="text-[11px] text-slate-400">Separate multiple incentive tags with commas.</p>
                  </div>

                  {/* Row 3: Incentive Package */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Incentive Package / Description</label>
                    <textarea
                      rows={3}
                      value={incentivePackage}
                      onChange={(e) => setIncentivePackage(e.target.value)}
                      placeholder="Describe the tax holidays, exemptions, or local government support available..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] transition-all resize-none"
                    />
                  </div>

                  {/* Row 4: Upload Image */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Upload Image</label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-[#002B66]/50 rounded-xl p-4 transition-colors text-center relative bg-slate-50/50">
                      {imagePreview ? (
                        <div className="relative group w-full h-36 rounded-lg overflow-hidden border border-slate-200">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setSelectedFile(null);
                            }}
                            className="absolute top-2 right-2 bg-slate-900/80 text-white p-1.5 rounded-full hover:bg-slate-900 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer py-2">
                          <UploadCloud className="w-8 h-8 text-slate-400 mb-1.5" />
                          <span className="text-xs font-bold text-slate-700">Click to upload or drag & drop</span>
                          <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG or WEBP (Max 5MB)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Callout Box */}
                  <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900 leading-relaxed">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      {editingProjectId 
                        ? "Modifying this opportunity will update its database entry upon saving."
                        : "New opportunities are saved as Draft by default. You can publish them to the Investor Portal after administrative review."}
                    </span>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#002B66] hover:bg-[#001D47] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    {editingProjectId ? "Save Changes" : "Save Draft"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Opportunity</h3>
                  <p className="text-xs text-slate-500">Confirm project removal</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-900">{deletingProject.name}</strong> from the database? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingProject(null)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirmed}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default InvestmentManagement;
