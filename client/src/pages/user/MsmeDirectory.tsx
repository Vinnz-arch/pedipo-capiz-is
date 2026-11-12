import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ClientMainLayout from "@/components/client-portal/ClientMainLayout";
import { MsmeDirectoryService, type MsmeData } from "@/services/MsmeDirectoryService";
import { MunicipalityService, type MunicipalityData } from "@/services/MunicipalityService";
import { OpportunityService, type CategoryData } from "@/services/OpportunityService";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProjectImage } from "@/components/ui/ProjectImage";
import { 
  Search, 
  MapPin, 
  Store, 
  ArrowRight, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { notify } from "@/util/notify";
import { useLiveSync } from "@/hooks/useLiveSync";

export const MsmeDirectory: React.FC = () => {
  const [msmes, setMsmes] = useState<MsmeData[]>([]);
  const [municipalities, setMunicipalities] = useState<MunicipalityData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);

  // Search & Filter State
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuni, setSelectedMuni] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const loadFilters = async () => {
    try {
      const [muniRes, oppRes] = await Promise.all([
        MunicipalityService.getAll(),
        OpportunityService.getAll()
      ]);
      if (muniRes.municipalities) setMunicipalities(muniRes.municipalities);
      if (oppRes.categories) setCategories(oppRes.categories);
    } catch (error) {
      console.error("Failed to load search parameters:", error);
    }
  };

  const fetchPublicMsmes = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const params = {
        search: searchQuery,
        municipality_id: selectedMuni,
        category_id: selectedCategory,
        enterprise_type: selectedSize,
        page: currentPage.toString(),
        per_page: "6" // Shows exactly 6 cards (2 rows of 3) as in the image
      };
      const res = await MsmeDirectoryService.getAllPublic(params);
      if (res.msmes) {
        setMsmes(res.msmes);
        setCurrentPage(res.pagination.current_page);
        setLastPage(res.pagination.last_page);
        setTotalRecords(res.pagination.total);
      }
    } catch (error) {
      console.error("Failed to retrieve public MSMEs:", error);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    fetchPublicMsmes();
  }, [searchQuery, selectedMuni, selectedCategory, selectedSize, currentPage]);

  useLiveSync(["msmes", "all"], () => fetchPublicMsmes({ silent: true }), {
    pollIntervalMs: 15000,
  });

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <ClientMainLayout>
      <div className="space-y-8 pb-16 text-left">
        
        {/* Modern Filter panel bar matching reference design */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs items-center">
          
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by business name..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange(); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/60 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 transition-all placeholder-slate-400"
            />
          </div>

          {/* Municipalities Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={selectedMuni}
              onChange={(e) => { setSelectedMuni(e.target.value); handleFilterChange(); }}
              className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/60 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 transition-all"
            >
              <option value="All">All Municipalities</option>
              {municipalities.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Industries Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); handleFilterChange(); }}
              className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/60 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 transition-all"
            >
              <option value="All">All Industries</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Sliders/Filter size trigger */}
          <button
            onClick={() => {
              const sizes = ["All", "Micro", "Small", "Medium"];
              const nextIdx = (sizes.indexOf(selectedSize) + 1) % sizes.length;
              setSelectedSize(sizes[nextIdx]);
              handleFilterChange();
              notify.info("Enterprise Filter", `Now filtering by: ${sizes[nextIdx]} enterprise size`);
            }}
            className={`p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center shadow-xs cursor-pointer ${
              selectedSize !== 'All' 
                ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100' 
                : 'bg-slate-50 hover:bg-slate-100'
            }`}
            title={`Cycle Enterprise Size filter. Current: ${selectedSize}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Directory Grid */}
        {isLoading ? (
          <LoadingState message="Scanning MSME directory records..." className="py-24" />
        ) : msmes.length === 0 ? (
          <div className="py-24 bg-white border border-slate-100 rounded-3xl shadow-sm text-center">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-extrabold text-slate-700">No Businesses Found</h4>
            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto mt-1">
              Try adjusting your search query, or filtering by a different LGU municipality or industry sector.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
              <span>Showing {msmes.length} of {totalRecords} registered businesses</span>
            </div>
            
            {/* 3 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {msmes.map((msme) => (
                  <div 
                    key={msme.id} 
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-500/10 transition-all duration-300 group flex flex-col justify-between overflow-hidden text-slate-800"
                  >
                    
                    {/* Visual Cover Header Block */}
                    <div className="h-44 w-full relative overflow-hidden bg-slate-100 shrink-0">
                      <ProjectImage
                        src={msme.cover_path}
                        alt={`${msme.business_name} cover`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      />
                      {/* Soft overlay for visual depth */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
                      
                      {/* Translucent pill category badge */}
                      <span className="absolute top-4 left-4 backdrop-blur-md bg-slate-900/75 text-white border border-white/20 shadow-sm font-extrabold text-[9px] px-3 py-1 rounded-full uppercase tracking-wider">
                        {msme.category?.name || "Sector"}
                      </span>

                      {/* Small floating logo overlay on bottom-right of picture */}
                      <div className="absolute right-4 bottom-4 w-12 h-10 bg-white rounded-lg p-1 shadow-md border border-slate-100 overflow-hidden flex items-center justify-center">
                        <ProjectImage
                          src={msme.logo_path}
                          alt={`${msme.business_name} logo`}
                          className="max-w-full max-h-full object-contain rounded"
                          fallbackClassName="rounded"
                          compact
                        />
                      </div>
                    </div>

                    {/* Card Body details */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-slate-800 text-sm tracking-tight leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {msme.business_name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-300 mt-0.5 shrink-0" />
                          <span className="truncate">
                            {msme.municipality?.name ? `${msme.municipality.name}, Capiz` : "Capiz, PH"}
                          </span>
                        </div>
                      </div>

                      {/* Bottom size badge and view link */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50 shrink-0">
                        <span className="bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wide">
                          {msme.enterprise_type} Enterprise
                        </span>
                        
                        <Link
                          to={`/portal/msmeDirectory/${msme.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 font-extrabold text-[11px] hover:text-blue-800 transition-colors bg-transparent border-0 p-0 shadow-none hover:translate-x-0.5 transition-transform cursor-pointer"
                        >
                          View Profile
                          <ArrowRight className="w-3.5 h-3.5 mt-0.5" />
                        </Link>
                      </div>

                    </div>

                  </div>
              ))}
            </div>

            {/* Premium centered pagination matching reference design */}
            {lastPage > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 py-6">
                
                {/* Prev */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="w-9 h-9 border border-slate-200 rounded-lg flex items-center justify-center bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Numbers */}
                {Array.from({ length: lastPage }, (_, i) => i + 1).map((pg) => {
                  // Render pagination bounds if needed (e.g. if we have many pages, show dots)
                  const shouldShow = pg === 1 || pg === lastPage || Math.abs(pg - currentPage) <= 1;
                  
                  if (!shouldShow) {
                    if (pg === 2 || pg === lastPage - 1) {
                      return <span key={pg} className="w-9 h-9 flex items-center justify-center text-slate-400 font-bold select-none">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer font-extrabold text-xs ${
                        currentPage === pg
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}

                {/* Next */}
                <button
                  disabled={currentPage === lastPage}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                  className="w-9 h-9 border border-slate-200 rounded-lg flex items-center justify-center bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

              </div>
            )}
          </div>
        )}

      </div>
    </ClientMainLayout>
  );
};

export default MsmeDirectory;
