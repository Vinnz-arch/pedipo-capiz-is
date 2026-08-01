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
  Calendar,
  Activity,
  Database
} from "lucide-react";
import { notify } from "@/util/notify";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [activeTab, setActiveTab] = useState<string>("visuals");

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

  const colorPalette = ["#2563eb", "#10b981", "#f59e0b", "#a855f7"];

  return (
    <ClientMainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8 select-none print:p-0 print:m-0 animate-in fade-in duration-500">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6 print:hidden">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Municipal Comparison Tool
              </h1>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 uppercase font-black tracking-wider text-[10px] py-0.5 px-2.5">
                Comparative Analysis
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl font-medium">
              Compare up to 4 municipalities side-by-side to make informed investment and development decisions across Capiz.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <Button
              variant="outline"
              size="default"
              onClick={handleShare}
              className="font-bold border-slate-200 dark:border-slate-800 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Share2 className="h-4 w-4 mr-2" />
              <span>Share Analysis</span>
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={handleExportCSV}
              className="font-bold border-slate-200 dark:border-slate-800 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <FileDown className="h-4 w-4 mr-2" />
              <span>Export Excel</span>
            </Button>
            <Button
              variant="default"
              size="default"
              onClick={handlePrint}
              className="bg-[#002B66] hover:bg-[#001D47] text-white shadow-xs font-bold cursor-pointer"
            >
              <FileDown className="h-4 w-4 mr-2" />
              <span>Export PDF</span>
            </Button>
          </div>
        </div>

        {/* Municipality Selector Card */}
        <Card className="border border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md shadow-xs print:hidden rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4 px-6">
            <div className="space-y-1">
              <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-600" />
                <span>Select Municipalities to Compare</span>
                <span className="text-xs font-semibold text-slate-400 block sm:inline sm:ml-2">
                  ({selectedMunis.length}/4 Selected)
                </span>
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/20 cursor-pointer"
            >
              Clear All
            </Button>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {municipalities.length === 0 ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-2xl" />
                ))
              ) : (
                municipalities.map((muni) => {
                  const isChecked = selectedMunis.includes(muni.name);
                  return (
                    <div
                      key={muni.id}
                      onClick={() => handleMuniCheckboxChange(muni.name)}
                      className={`relative flex flex-col justify-center px-4.5 py-3 rounded-2xl border cursor-pointer select-none transition-all duration-200 hover:scale-[1.01] ${
                        isChecked
                          ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/10 shadow-xs"
                          : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => {}} // Swallowed, handled by parent click
                          className="h-4 w-4 border-slate-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate">
                          {muni.name}
                        </span>
                      </div>
                      <span className="mt-1 ml-7 text-[8.5px] uppercase font-black tracking-wider text-slate-400 block">
                        {muni.class.includes("City") ? "City" : "LGU"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading and Main Dashboard Body */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-80 rounded-3xl" />
              <Skeleton className="h-80 rounded-3xl" />
            </div>
            <Skeleton className="h-96 rounded-3xl" />
          </div>
        ) : !comparisonData || comparisonData.selected.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl py-20 bg-white/50 dark:bg-slate-950/20 px-6 text-center">
            <ShieldAlert className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-base font-extrabold text-slate-700 dark:text-slate-300">
              No data segments selected.
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
              Select at least one municipality above to load regional economic comparisons.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Control Bar & Tabs Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-2 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/80 rounded-2xl print:hidden">
              <div className="flex items-center gap-3 px-3">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-500 font-semibold">Analysis Year:</span>
                <Select value={String(year)} onValueChange={(val) => setYear(Number(val))}>
                  <SelectTrigger className="w-[180px] h-8 text-xs font-bold bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025 (Baseline)</SelectItem>
                    <SelectItem value="2026">2026 (Projected/Sync)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="bg-white/80 dark:bg-slate-950 shadow-xs border border-slate-200/40 dark:border-slate-850 p-1 w-full sm:w-auto flex">
                  <TabsTrigger value="visuals" className="text-xs font-bold cursor-pointer flex-1 sm:flex-none">
                    Standard Charts
                  </TabsTrigger>
                  <TabsTrigger value="radar" className="text-xs font-bold cursor-pointer flex-1 sm:flex-none">
                    Sector Radar
                  </TabsTrigger>
                  <TabsTrigger value="table" className="text-xs font-bold cursor-pointer flex-1 sm:flex-none">
                    Data Sheet
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Visual Charts Tab Content */}
            {activeTab === "visuals" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
                
                {/* Economic comparison */}
                <Card className="border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs bg-white">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3 px-6">
                    <div className="space-y-0.5">
                      <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        Economic Indicators Comparison
                      </CardTitle>
                      <CardDescription className="text-[10px]">GDP & employment rates</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[8.5px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100/50">
                      Visualization
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getEconomicChartData()} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }} />
                          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontWeight: 'bold' }} />
                          <Bar dataKey="GDP (M PHP)" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={16} />
                          <Bar dataKey="Employment Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Business activity */}
                <Card className="border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs bg-white">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3 px-6">
                    <div className="space-y-0.5">
                      <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        Business Activity & FDI
                      </CardTitle>
                      <CardDescription className="text-[10px]">Registered local establishments & foreign investments</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[8.5px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100/50">
                      Visualization
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getBusinessChartData()} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }} />
                          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontWeight: 'bold' }} />
                          <Bar dataKey="Registered Businesses" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={16} />
                          <Bar dataKey="FDI (M PHP)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

              </div>
            )}

            {/* Radar Mapping Tab Content */}
            {activeTab === "radar" && (
              <Card className="border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs bg-white animate-in fade-in duration-300">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3 px-6">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      Sector Distribution Mapping
                    </CardTitle>
                    <CardDescription className="text-[10px]">Overlaid economic sector percentages across selected LGUs</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[8.5px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100/50">
                    Visualization
                  </Badge>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-96 w-full flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarChartData()}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={11} fontWeight="bold" />
                        <PolarRadiusAxis angle={30} domain={[0, 80]} stroke="#cbd5e1" fontSize={9} />
                        {comparisonData.selected.map((m, idx) => (
                          <Radar
                            key={m.id}
                            name={m.name}
                            dataKey={m.name}
                            stroke={colorPalette[idx % colorPalette.length]}
                            fill={colorPalette[idx % colorPalette.length]}
                            fillOpacity={0.2}
                          />
                        ))}
                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontWeight: 'bold' }} />
                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sector Progress Cards (Always visible, complements the visuals/radar) */}
            <Card className="border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs bg-white">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3 px-6">
                <div className="space-y-0.5">
                  <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Sectoral Distribution Comparison
                  </CardTitle>
                  <CardDescription className="text-[10px]">Percentage shares of key municipal economic industries</CardDescription>
                </div>
                <Badge variant="outline" className="text-[8.5px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100/50">
                  Data Sheet
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {comparisonData.selected.map((muni, index) => {
                    const sectors = [
                      { label: "Aquaculture", code: "aquaculture_share", color: "bg-blue-500" },
                      { label: "Agriculture", code: "agriculture_share", color: "bg-emerald-500" },
                      { label: "Tourism", code: "tourism_share", color: "bg-amber-500" },
                      { label: "Manufacturing", code: "manufacturing_share", color: "bg-purple-500" },
                      { label: "Services", code: "services_share", color: "bg-pink-500" }
                    ];

                    const accentColor = colorPalette[index % colorPalette.length];

                    return (
                      <div key={muni.id} className="border border-slate-150 dark:border-slate-800/80 rounded-2xl p-4.5 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition duration-300">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/40">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                            {muni.name}
                          </span>
                          <Badge variant="outline" className="text-[8px] uppercase tracking-widest text-slate-400 font-bold px-1.5">
                            Sectors
                          </Badge>
                        </div>
                        
                        <div className="space-y-3.5 pt-1">
                          {sectors.map((sec) => {
                            const val = muni.values[sec.code]?.value ?? 0;
                            return (
                              <div key={sec.code} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px]">{sec.label}</span>
                                  <span className="font-black text-slate-800 dark:text-slate-200">{val}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div className={`h-full ${sec.color} rounded-full transition-all duration-500`} style={{ width: `${val}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights Block */}
            <div className="rounded-3xl bg-gradient-to-r from-blue-50/30 to-indigo-50/10 dark:from-slate-900/40 dark:to-slate-800/10 border border-blue-100/50 dark:border-slate-800 p-6 space-y-4 animate-in slide-in-from-bottom-2 duration-400">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm tracking-wide">
                  Comparative AI Insights
                </h3>
              </div>
              <ul className="space-y-3 pl-1">
                {generateInsights().map((insight, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed spreadsheet/data-sheet table view */}
            {activeTab === "table" && (
              <Card className="border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs bg-white animate-in fade-in duration-300">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3 px-6">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      Detailed Comparison Table
                    </CardTitle>
                    <CardDescription className="text-[10px]">Comprehensive municipal metrics & provincial benchmark averages</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[8.5px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100/50">
                    Data Report
                  </Badge>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table className="w-full text-xs">
                      <TableHeader>
                        <TableRow className="bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-50/50 dark:hover:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                          <TableHead className="h-10 px-6 font-bold text-slate-700 dark:text-slate-300 text-left">Indicator</TableHead>
                          {comparisonData.selected.map(m => (
                            <TableHead key={m.id} className="h-10 px-4 font-bold text-slate-900 dark:text-slate-100 text-left">{m.name}</TableHead>
                          ))}
                          <TableHead className="h-10 px-6 font-bold text-blue-600 dark:text-blue-400 text-left bg-blue-50/30 dark:bg-blue-950/10">Average (Provincial)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonData.indicators.map((ind) => {
                          const avg = comparisonData.provincialAverages[ind.code] ?? 0;
                          return (
                            <TableRow key={ind.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 border-b border-slate-100 dark:border-slate-800/80 transition">
                              <TableCell className="px-6 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                                <div className="flex items-center gap-1.5">
                                  <span>{ind.name}</span>
                                  {ind.unit && <span className="text-[9.5px] text-slate-400 font-normal">({ind.unit})</span>}
                                </div>
                              </TableCell>
                              {comparisonData.selected.map(m => {
                                const valObj = m.values[ind.code];
                                return (
                                  <TableCell key={m.id} className="px-4 py-3.5">
                                    <div className="space-y-0.5">
                                      <div className="font-extrabold text-slate-900 dark:text-slate-100">
                                        {valObj?.value !== undefined ? valObj.value.toLocaleString() : "—"}
                                      </div>
                                      {valObj && (
                                        <div className="text-[8.5px] text-slate-400 flex items-center gap-1 font-bold">
                                          <span className="bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-[7.5px] font-black uppercase tracking-wider">
                                            {valObj.source}
                                          </span>
                                          <span>Conf: {valObj.confidence_level}</span>
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                );
                              })}
                              <TableCell className="px-6 py-3.5 font-black text-blue-600 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-950/5">
                                {avg.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reference info & updates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
              
              {/* Primary Data Sources */}
              <Card className="border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden bg-white shadow-xs">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-3 px-6">
                  <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span>Primary Data Sources</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 p-2.5 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition duration-200">
                    <div className="h-8 w-12 flex items-center justify-center bg-blue-50 text-[#002B66] rounded-xl text-[9px] font-black shrink-0 border border-blue-100">PSA</div>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Philippine Statistics Authority</h5>
                      <p className="text-[10px] text-slate-400 font-medium">Primary national demographic and municipal GDP estimates. Confidence: High.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 p-2.5 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition duration-200">
                    <div className="h-8 w-12 flex items-center justify-center bg-amber-50 text-amber-700 rounded-xl text-[9px] font-black shrink-0 border border-amber-100">DTI</div>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Department of Trade & Industry</h5>
                      <p className="text-[10px] text-slate-400 font-medium">Registered business directories, investments, and FDI indices. Confidence: High.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 p-2.5 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition duration-200">
                    <div className="h-8 w-12 flex items-center justify-center bg-purple-50 text-purple-700 rounded-xl text-[9px] font-black shrink-0 border border-purple-100">BLGF</div>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Bureau of Local Government Finance</h5>
                      <p className="text-[10px] text-slate-400 font-medium">LGU annual incomes and municipal financial status records. Confidence: High.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Latest updates feed */}
              <Card className="border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden bg-white shadow-xs">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-3 px-6">
                  <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-600 animate-pulse" />
                    <span>Latest Data Updates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {latestUpdates.map(update => (
                      <div key={update.id} className="py-3 flex items-center justify-between text-xs first:pt-0 last:pb-0 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 px-2 rounded-xl transition duration-200">
                        <div className="space-y-0.5 text-left">
                          <span className="font-extrabold text-slate-900 dark:text-slate-200">{update.municipality_name}</span>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase">
                            <span>{update.indicator_name}</span>
                            <span>•</span>
                            <span>{update.last_updated}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="font-black text-[#002B66] dark:text-blue-400">{update.value.toLocaleString()} {update.unit || ""}</span>
                          <span className="bg-slate-50 dark:bg-slate-950 px-1.5 py-0.2 rounded border border-slate-100 dark:border-slate-800 text-[8px] font-black uppercase text-slate-450 block w-fit ml-auto">
                            via {update.source}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>

          </div>
        )}

      </div>
    </ClientMainLayout>
  );
};

export default ComparisonTool;