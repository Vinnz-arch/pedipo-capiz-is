import * as Icons from "lucide-react";
import MainLayout from "../components/layout/Mainlayout"
import Logo from "../assets/logo.jpg"

const Dashboard = () => {
    const stats = [
      {
        label: "Total Provincial GDP",
        value: "₱124.3B",
        icon: Icons.PhilippinePeso,
      },
      {
        label: "Employment Rate",
        value: "0",
        change: "+0%",
        trend: "",
        icon: Icons.Briefcase,
      },
      {
        label: "Total Buisness",
        value: "0",
        change: "+0%",
        trend: "up",
        icon: Icons.MessageSquare,
      },
      {
        label: "Foreign Investment",
        value: "0",
        change: "+0%",
        trend: "up",
        icon: Icons.Users,
      },
    ];

    const content = (
      <div className="space-y-8 p-6 min-h-screen">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-ring text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 w-full">
            <div className="flex items-center gap-4 mb-4">
              <img className="material-symbols-outlined w-18 h-18 rounded-full text-5xl text-white" src={Logo} alt="logo" />
              <div>
                <h2 className="text-headline-lg text-3xl font-bold font-headline-lg text-white">
                  PEDIPO Capiz Dashboard
                </h2>
                <p className="text-body-md font-body-md font-medium text-on-primary-container">
                  Economic and Investment Information System
                </p>
              </div>
            </div>
            <div className="z-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 md:grid-cols-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Population
                </p>
                <p className="text-2xl font-black text-white">804,952</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Land Area
                </p>
                <p className="text-2xl font-black text-white">
                  2,633.17 <span className="text-sm font-medium">km²</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Barangays
                </p>
                <p className="text-2xl font-black text-white">473</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Coastline
                </p>
                <p className="text-2xl font-black text-white">
                  89.4 <span className="text-sm font-medium">km</span>
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-[-20px] right-[-20px] w-64 h-64 bg-white/5 rounded-full"></div>
          <div className="absolute bottom-[-40px] left-[20%] w-32 h-32 bg-white/5 rounded-full"></div>
        </div>
        {/* Stats Grid */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-12 bg-secondary rounded-full"></span>
          <h3 className="font-headline-sm text-2xl font-bold text-headline-sm text-on-surface">
            Key Provincial Metrics
          </h3>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-[#2563EB]/10 rounded-xl">
                  <stat.icon className="w-5 h-5 text-secondary" />
                </div>
                {stat.change && (
                  <span className={cn(
                    "flex items-center text-xs font-bold px-2.5 py-1 rounded-full",
                    stat.trend === 'up' ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                  )}>
                    {stat.trend === 'up' ? <Icons.ArrowUpRight size={12} className="mr-1" /> : <Icons.ArrowDownRight size={12} className="mr-1" />}
                    {stat.change}
                  </span>
                )}
              </div>
              <div className="mt-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  {stat.label || "Metric"}
                </p>
                <p className="text-2xl font-bold mt-1 text-[#1F2937]">{stat.value || "0"}</p>
              </div>
            </div>
          ))}
        </div>
        <section className="space-y-md">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-12 bg-secondary rounded-full"></span>
            <h3 className="font-headline-sm text-2xl font-bold text-headline-sm text-on-surface">
              Economic Overview
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter gap-4">
            {/* Growth Card */}
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">

              <div className="p-6 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">

                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">
                    Live Municipal Economic Growth
                  </h4>

                  <p className="text-on-surface-variant text-sm">
                    Real-time GDP tracking for all 17 municipalities &amp; city
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>

                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Live
                  </span>
                </div>
              </div>

              <div className="p-8">

                <div className="h-64 w-full bg-surface-container rounded-lg flex items-center justify-center relative overflow-hidden">
                  <img
                    title="image"
                    className="w-full h-full object-cover"
                    data-alt="A sophisticated data visualization dashboard showing dynamic growth charts for multiple municipalities."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRABmPzafDVIZQ3l03B8suqzGOi90Dq8UwcjKCH5OSnC86r19M0ullkwY32S6I8dh6ZBPoTBL1YZoY3Ex0NLUTHPGA2BHmzDJSe9ZqDc3z031hvWzsgx9djA8LrQ0hRds4lH_7W2Kl0_JgKvt_v8Gn7pTKp0fjEm5RRLEDN_fs2iBLfYUFIErR515AE_FpI2Km7u4o_-y1Agwho3xLo6WbXk1wgCx5EUG9YSmJvowkiyvFt9CW2S4M_IJVgQsylTiPia-inRw3unE"
                  />
                </div>

                <div className="mt-6 flex justify-between items-center text-on-surface-variant text-sm">

                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">
                      info
                    </span>

                    Updated 15 minutes ago
                  </span>

                  <button className="text-primary font-bold hover:underline">
                    View Detailed Report
                  </button>
                </div>
              </div>
            </div>
            {/* Demographics Card */}
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-6 border-b border-outline-variant bg-surface-container-low">
                <h4 className="font-headline-sm text-headline-sm text-on-surface">
                  Demographic Distribution
                </h4>
                <p className="text-on-surface-variant text-sm">
                  Population breakdown across all 17 municipalities &amp; city
                </p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 gap-6">

                  <div className="space-y-4">
                    <div className="p-4 bg-surface-container rounded-lg border border-outline-variant">
                      <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">
                        Roxas City
                      </p>

                      <p className="text-2xl font-black text-primary">
                        179,292
                      </p>

                      <div className="w-full bg-outline-variant h-1 rounded-full mt-2">
                        <div
                          className="bg-primary h-1 rounded-full"
                          style={{ width: "22%" }}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-surface-container rounded-lg border border-outline-variant">
                      <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">
                        Panay
                      </p>

                      <p className="text-2xl font-black text-primary">
                        48,890
                      </p>

                      <div className="w-full bg-outline-variant h-1 rounded-full mt-2">
                        <div
                          className="bg-primary h-1 rounded-full"
                          style={{ width: "6%" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="relative w-48 h-48 rounded-full border-8 border-surface-container-highest flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent -rotate-45"></div>

                      <div className="text-center">
                        <p className="text-3xl font-black text-on-surface">
                          17
                        </p>

                        <p className="text-[10px] font-bold text-on-surface-variant uppercase">
                          Local Units
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button className="w-full py-3 bg-surface border border-outline-variant rounded-lg font-label-md text-label-md text-primary hover:bg-primary-fixed transition-colors">
                    Expand Demographic Map
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      
    );
    return <MainLayout content={content} />;
};

// Helper for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default Dashboard
