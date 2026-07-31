import React, { useEffect, useState } from "react";
import ClientMainLayout from "@/components/client-portal/ClientMainLayout";
import { 
  ComparisonService, 
  type ComparisonMunicipality, 
  type IndicatorData, 
  type LatestUpdateItem 
} from "@/services/ComparisonService";
import { MunicipalityService, type MunicipalityData } from "@/services/MunicipalityService";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { 
  Scale, 
  Share2, 
  FileDown, 
  ShieldAlert,
  Sparkles,
  Calendar
} from "lucide-react";
import { notify } from "@/util/notify";

export const ComparisonTool: React.FC = () => {
  const [municipalities, setMunicipalities] = useState<MunicipalityData[]>([]);
  const [selectedMunis, setSelectedMunis] = useState<string[]>(["Roxas City", "Pontevedra", "Pilar"]);
  const [year, setYear] = useState<number>(2025);
  const [loading, setLoading] = useState<boolean>(true);
  const [comparisonData, setComparisonData] = useState<{
    selected: ComparisonMunicipality[];
    indicators: IndicatorData[];
    provincialAverages: Record<string, number>;
  } | null>(null);
  const [latestUpdates, setLatestUpdates] = useState<LatestUpdateItem[]>([]);
  const [activeTab, setActiveTab] = useState<"visuals" | "radar" | "table">("visuals");

  // Load municipalities list on mount
  useEffect(() => {
    const fetchMunicipalities = async () => {
      try {
        const res = await MunicipalityService.getAll();
        if (res?.municipalities) {
          setMunicipalities(res.municipalities);
        }
      } catch (err) {
        console.error("Failed to load municipalities list", err);
      }
    };
    fetchMunicipalities();
  }, []);

  // Fetch comparison and update stats whenever selections or year changes
  useEffect(() => {
    const fetchComparison = async () => {
      if (selectedMunis.length === 0) {
        setComparisonData(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await ComparisonService.getComparison(selectedMunis, year);
        setComparisonData(res);
        
        const updatesRes = await ComparisonService.getLatestUpdates();
        if (updatesRes?.updates) {
          setLatestUpdates(updatesRes.updates.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load comparison data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [selectedMunis, year]);

  const handleMuniCheckboxChange = (name: string) => {
    if (selectedMunis.includes(name)) {
      // Allow deselecting, but keep at least 1
      if (selectedMunis.length === 1) {
        notify.warning("Selection Error", "Please select at least one municipality to compare.");
        return;
      }
      setSelectedMunis(selectedMunis.filter((n) => n !== name));
    } else {
      if (selectedMunis.length >= 4) {
        notify.error("Selection Limit", "You can compare a maximum of 4 municipalities side-by-side.");
        return;
      }
      setSelectedMunis([...selectedMunis, name]);
    }
  };

  const handleClearAll = () => {
    setSelectedMunis(["Roxas City"]);
  };

  const handleShare = () => {
    const url = window.location.href + `?municipalities=${selectedMunis.join(",")}&year=${year}`;
    navigator.clipboard.writeText(url);
    notify.success("Link Copied", "Shareable analysis link copied to clipboard!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!comparisonData || comparisonData.selected.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Indicator," + comparisonData.selected.map(m => m.name).join(",") + ",Provincial Average\n";

    comparisonData.indicators.forEach(ind => {
      let row = `"${ind.name} (${ind.unit || ''})",`;
      row += comparisonData.selected.map(m => m.values[ind.code]?.value ?? "N/A").join(",");
      row += `,${comparisonData.provincialAverages[ind.code] ?? "N/A"}\n`;
      csvContent += row;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Municipal_Comparison_Report_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify.success("Export Success", "Detailed Comparison data exported to CSV successfully.");
  };

  // Generate automated AI insights based on actual comparison values
  const generateInsights = () => {
    if (!comparisonData || comparisonData.selected.length < 2) {
      return ["Select at least two municipalities to generate comparison insights."];
    }

    const insights: string[] = [];
    const selected = comparisonData.selected;

    // Helper: Find min/max for any code
    const getExtreme = (code: string, findMax = true): { muni: ComparisonMunicipality; value: number } | null => {
      let extremeVal = findMax ? -Infinity : Infinity;
      let extremeMuni: ComparisonMunicipality | null = null;

      selected.forEach(m => {
        const item = m.values[code];
        if (item && item.value !== undefined) {
          if (findMax && item.value > extremeVal) {
            extremeVal = item.value;
            extremeMuni = m;
          } else if (!findMax && item.value < extremeVal) {
            extremeVal = item.value;
            extremeMuni = m;
          }
        }
      });

      return extremeMuni ? { muni: extremeMuni, value: extremeVal } : null;
    };

    // GDP Insights
    const gdpMax = getExtreme("gdp", true);
    if (gdpMax) {
      insights.push(
        `${gdpMax.muni.name} leads the economy among the selected group with a Gross Domestic Product (GDP) of ${gdpMax.value} Million PHP.`
      );
    }

    // Registered businesses Insights
    const bizMax = getExtreme("registered_businesses", true);
    if (bizMax) {
      insights.push(
        `${bizMax.muni.name} hosts the highest number of active local commercial establishments with ${bizMax.value.toLocaleString()} registered businesses.`
      );
    }

    // Industry Shares
    const agriMax = getExtreme("agriculture_share", true);
    const aquaMax = getExtreme("aquaculture_share", true);
    const tourMax = getExtreme("tourism_share", true);

    if (agriMax && agriMax.value > 40) {
      insights.push(
        `${agriMax.muni.name} demonstrates a highly dominant agricultural profile, representing a ${agriMax.value}% share of its local economic sectors.`
      );
    }
    if (aquaMax && aquaMax.value > 20) {
      insights.push(
        `${aquaMax.muni.name} shows high specialized aquaculture activity with a ${aquaMax.value}% share, highlighting strong fisheries investment potential.`
      );
    }
    if (tourMax && tourMax.value > 15) {
      insights.push(
        `${tourMax.muni.name} exhibits a significant tourism footprint, claiming a ${tourMax.value}% sector share.`
      );
    }

    // Infrastructure rating
    const infraMax = getExtreme("infrastructure", true);
    if (infraMax && infraMax.value > 80) {
      insights.push(
        `${infraMax.muni.name} holds the highest municipal infrastructure score of ${infraMax.value}/100, indicating excellent road, power, and logistics networks.`
      );
    }

    return insights;
  };

  // Recharts Chart Data Parsers
  const getEconomicChartData = () => {
    if (!comparisonData) return [];
    return comparisonData.selected.map(m => ({
      name: m.name,
      "GDP (M PHP)": m.values.gdp?.value ?? 0,
      "Employment Rate (%)": m.values.employment_rate?.value ?? 0,
    }));
  };

  const getBusinessChartData = () => {
    if (!comparisonData) return [];
    return comparisonData.selected.map(m => ({
      name: m.name,
      "Registered Businesses": m.values.registered_businesses?.value ?? 0,
      "FDI (M PHP)": m.values.fdi?.value ?? 0,
    }));
  };

  const getRadarChartData = () => {
    if (!comparisonData) return [];
    // Compare economic sectors across selected municipalities
    const sectors = [
      { subject: "Aquaculture", code: "aquaculture_share" },
      { subject: "Agriculture", code: "agriculture_share" },
      { subject: "Tourism", code: "tourism_share" },
      { subject: "Manufacturing", code: "manufacturing_share" },
      { subject: "Services", code: "services_share" }
    ];

    return sectors.map(sec => {
      const dataPoint: Record<string, any> = { subject: sec.subject };
      comparisonData.selected.forEach(m => {
        dataPoint[m.name] = m.values[sec.code]?.value ?? 0;
      });
      return dataPoint;
    });
  };

  const colorPalette = ["#3B82F6", "#10B981", "#F59E0B", "#EC4899"];

  return (
    <ClientMainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8 select-none print:p-0 print:m-0">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 print:hidden">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Municipal Comparison Tool
              </h1>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50">
                PROCESS: COMPARATIVE ANALYSIS
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Compare up to 4 municipalities side-by-side to make informed investment and development decisions across Capiz.
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-200"
            >
              <Share2 className="h-4 w-4" />
              <span>Share Analysis</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-200"
            >
              <FileDown className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition duration-200"
            >
              <FileDown className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Municipality Selector Grid */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-6 shadow-sm print:hidden">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-500" />
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Select Municipalities to Compare
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({selectedMunis.length}/4 Selected)
                </span>
              </h2>
            </div>
            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-red-500 hover:text-red-600 transition"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {municipalities.length === 0 ? (
              // Selector Skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
              ))
            ) : (
              municipalities.map((muni) => {
                const isChecked = selectedMunis.includes(muni.name);
                return (
                  <label
                    key={muni.id}
                    className={`relative flex flex-col justify-center px-4 py-3 rounded-xl border cursor-pointer select-none transition-all duration-200 hover:border-blue-400 ${
                      isChecked
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleMuniCheckboxChange(muni.name)}
                        className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                        {muni.name}
                      </span>
                    </div>
                    <span className="mt-1 ml-6 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {muni.class.includes("City") ? "City" : "LGU"}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500">Analysis Year:</span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={2025}>2025 (Baseline)</option>
                <option value={2026}>2026 (Projected/Sync)</option>
              </select>
            </div>
            
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950">
              <button
                onClick={() => setActiveTab("visuals")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  activeTab === "visuals"
                    ? "bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                Standard Charts
              </button>
              <button
                onClick={() => setActiveTab("radar")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  activeTab === "radar"
                    ? "bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                Sector Radar
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  activeTab === "table"
                    ? "bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                Data Sheet
              </button>
            </div>
          </div>
        </div>

        {/* Loading and Main Dashboard Body */}
        {loading ? (
          // Skeletons
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-80 rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
              <div className="h-80 rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
            </div>
            <div className="h-96 rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
          </div>
        ) : !comparisonData || comparisonData.selected.length === 0 ? (
          // Data Unavailable state
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl py-20 bg-white/50 dark:bg-slate-950/20">
            <ShieldAlert className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
              No official data available.
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Select at least one municipality to pull valid economic records from database.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Tab: Standard Visualizations */}
            {activeTab === "visuals" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Chart Card: GDP vs Employment */}
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      Economic Indicators Comparison
                    </h3>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                      OUTPUT: VISUALIZATION
                    </span>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getEconomicChartData()} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Bar dataKey="GDP (M PHP)" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="Employment Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart Card: Registered Businesses vs FDI */}
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      Business Activity & FDI
                    </h3>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                      OUTPUT: VISUALIZATION
                    </span>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getBusinessChartData()} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Bar dataKey="Registered Businesses" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="FDI (M PHP)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Sector Radar Comparison */}
            {activeTab === "radar" && (
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      Sector Distribution Mapping
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Overlaying economic sector percentages across municipalities.</p>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                    OUTPUT: VISUALIZATION
                  </span>
                </div>
                <div className="h-96 w-full flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarChartData()}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                      <PolarRadiusAxis angle={30} domain={[0, 80]} stroke="#cbd5e1" fontSize={10} />
                      {comparisonData.selected.map((m, idx) => (
                        <Radar
                          key={m.id}
                          name={m.name}
                          dataKey={m.name}
                          stroke={colorPalette[idx % colorPalette.length]}
                          fill={colorPalette[idx % colorPalette.length]}
                          fillOpacity={0.25}
                        />
                      ))}
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Sector Distribution: Progress Bars */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Sectoral Distribution Comparison
                </h3>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                  OUTPUT: VISUALIZATION
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {comparisonData.selected.map((muni) => {
                  const sectors = [
                    { label: "Aquaculture", code: "aquaculture_share", color: "bg-blue-500" },
                    { label: "Agriculture", code: "agriculture_share", color: "bg-emerald-500" },
                    { label: "Tourism", code: "tourism_share", color: "bg-amber-500" },
                    { label: "Manufacturing", code: "manufacturing_share", color: "bg-purple-500" },
                    { label: "Services", code: "services_share", color: "bg-pink-500" }
                  ];

                  return (
                    <div key={muni.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{muni.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                          Sector Share
                        </span>
                      </div>
                      
                      <div className="space-y-3 pt-2">
                        {sectors.map((sec) => {
                          const val = muni.values[sec.code]?.value ?? 0;
                          return (
                            <div key={sec.code} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-600 dark:text-slate-400">{sec.label}</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{val}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${sec.color} rounded-full`} style={{ width: `${val}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Insights Block */}
            <div className="rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-slate-900/50 dark:to-slate-800/20 border border-blue-100/50 dark:border-slate-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  Comparative AI Insights
                </h3>
              </div>
              <ul className="space-y-2.5">
                {generateInsights().map((insight, index) => (
                  <li key={index} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="text-blue-500">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Table Card: Detailed Comparison */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-6">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    Detailed Comparison Table
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Individual metrics with provincial benchmark averages.</p>
                </div>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                  OUTPUT: COMPARISON REPORT
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                      <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Indicator</th>
                      {comparisonData.selected.map(m => (
                        <th key={m.id} className="p-4 font-bold text-slate-700 dark:text-slate-300">{m.name}</th>
                      ))}
                      <th className="p-4 font-bold text-blue-600 dark:text-blue-400">Average (Provincial)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {comparisonData.indicators.map((ind) => {
                      const avg = comparisonData.provincialAverages[ind.code] ?? 0;
                      return (
                        <tr key={ind.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
                          <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                            <div className="flex items-center gap-1.5">
                              <span>{ind.name}</span>
                              {ind.unit && <span className="text-[10px] text-slate-400">({ind.unit})</span>}
                            </div>
                          </td>
                          {comparisonData.selected.map(m => {
                            const valObj = m.values[ind.code];
                            return (
                              <td key={m.id} className="p-4">
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                                    {valObj?.value !== undefined ? valObj.value.toLocaleString() : "—"}
                                  </div>
                                  {valObj && (
                                    <div className="text-[9px] text-slate-400 flex items-center gap-1">
                                      <span className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-[8px] font-bold">
                                        {valObj.source}
                                      </span>
                                      <span>Conf: {valObj.confidence_level}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          <td className="p-4 font-bold text-blue-600 dark:text-blue-400">
                            {avg.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Source Reference & Last Sync logs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
              
              {/* Sources Metadata Block */}
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                  Primary Data Sources
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-10 flex items-center justify-center bg-slate-100 rounded text-[9px] font-bold text-slate-500">PSA</div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Philippine Statistics Authority</h5>
                      <p className="text-[10px] text-slate-400">Primary national demographic and municipal GDP estimates. Confidence: High.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-10 flex items-center justify-center bg-slate-100 rounded text-[9px] font-bold text-slate-500">DTI</div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Department of Trade & Industry</h5>
                      <p className="text-[10px] text-slate-400">Registered business directories, investments, and FDI indices. Confidence: High.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-10 flex items-center justify-center bg-slate-100 rounded text-[9px] font-bold text-slate-500">BLGF</div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Bureau of Local Government Finance</h5>
                      <p className="text-[10px] text-slate-400">LGU annual incomes and municipal financial status records. Confidence: High.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Updates log */}
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                  Latest Data Updates
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {latestUpdates.map(update => (
                    <div key={update.id} className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{update.municipality_name}</span>
                        <span className="mx-1 text-slate-400">•</span>
                        <span className="text-slate-500">{update.indicator_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{update.value.toLocaleString()} {update.unit || ""}</span>
                        <p className="text-[9px] text-slate-400">{update.last_updated} via {update.source}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </ClientMainLayout>
  );
};

export default ComparisonTool;