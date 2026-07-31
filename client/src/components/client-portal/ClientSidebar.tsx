import { useState } from "react"
import { NavLink } from "react-router-dom"
import * as Icons from "lucide-react";
import { cn } from "../../lib/utils"
import { PATHS } from "../../routes/paths"
import Logo from "../../assets/logo.jpg"
import { AuthService } from "../../services/Authservices"

interface ClientSidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
}

export const clientRoutes = [
  {
    label: "Dashboard",
    path: PATHS.PORTAL.DASHBOARD,
    icon: Icons.LayoutDashboard,
  },
  {
    label: "Opportunities",
    path: PATHS.PORTAL.INVESTOR_PORTAL,
    icon: Icons.TrendingUp,
  },
  {
    label: "MSME Assistance",
    path: PATHS.PORTAL.MSME_ASSISTANCE,
    icon: Icons.Briefcase,
  },
  {
    label: "Comparison Tool",
    path: PATHS.PORTAL.COMPARISON_TOOL,
    icon: Icons.Scale,
  },
];

export default function ClientSidebar({ isCollapsed, setIsCollapsed }: ClientSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const user = AuthService.getUser() || { name: "Guest Investor", email: "investor@capiz.gov.ph" };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed top-4 left-4 z-50 p-2.5 bg-[#091535] rounded-xl shadow-lg md:hidden border border-white/10"
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? (
          <Icons.X size={18} className="text-white" />
        ) : (
          <Icons.Menu size={18} className="text-white" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-45 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-300" 
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-gradient-to-b from-[#091535] via-[#0E204E] to-[#071330] text-white transition-all duration-300 ease-in-out shadow-2xl flex flex-col border-r border-[#162A5E]/40 select-none",
          isCollapsed ? "w-20" : "w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header/Logo Section */}
        <div className="flex items-center justify-between h-28 px-5 border-b border-white/5 shrink-0 relative">
          {!isCollapsed && (
            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#E2B714] to-blue-500 flex items-center justify-center shadow-md">
                <img src={Logo} className="w-full h-full rounded-full object-cover border border-white/10" alt="App Logo" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-blue-100">
                  PEDIPO
                </span>
                <span className="text-xs font-extrabold tracking-widest text-[#E2B714] uppercase">
                  CAPIZ IS
                </span>  
                <span className="text-[8px] px-1.5 py-0.5 mt-0.5 rounded-md bg-blue-500/10 text-blue-300 font-bold border border-blue-400/20 uppercase tracking-widest w-fit">
                  User Portal
                </span> 
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-full flex justify-center animate-in fade-in duration-200">
              <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#E2B714] to-blue-500 flex items-center justify-center shadow-md">
                <img src={Logo} className="w-full h-full rounded-full object-cover" alt="App Logo" />
              </div>
            </div>
          )}

          {/* Toggle Sidebar Button */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-1 rounded-full bg-[#0E204E] hover:bg-[#1A3475] border border-white/10 shadow-lg hover:shadow-blue-500/20 text-[#E2B714] hover:text-white transition-all absolute -right-3.5 top-12 z-50"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <Icons.ChevronRight size={14} /> : <Icons.ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col flex-1 justify-between overflow-y-auto">
          <nav className="p-4 space-y-1.5">
            <p className={cn(
              "text-[9px] font-bold text-white/30 uppercase tracking-widest mb-3 px-2",
              isCollapsed && "text-center"
            )}>
              {isCollapsed ? "Menu" : "Investor Dashboard"}
            </p>
            {clientRoutes.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200 group relative border border-transparent",
                  isActive 
                    ? "bg-gradient-to-r from-blue-600/30 to-blue-500/5 text-white font-bold border-l-4 border-l-[#E2B714] shadow-inner bg-blue-950/20" 
                    : "text-white/60 hover:bg-white/5 hover:text-white hover:translate-x-1"
                )}
              >
                <item.icon size={18} className={cn(
                  "shrink-0 transition-transform group-hover:scale-110",
                )} />
                {!isCollapsed && (
                  <span className="font-semibold text-xs whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#091535] text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-2xl border border-white/10 font-bold uppercase tracking-wider">
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer User Info Profile Card */}
          <div className="p-4 border-t border-white/5 bg-[#071330]/50 shrink-0">
            {!isCollapsed ? (
              <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-2xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center font-bold text-white uppercase text-xs shadow-inner">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-slate-200 truncate">{user.name}</span>
                  <span className="text-[9px] text-[#E2B714] font-medium truncate">Client Portal User</span>
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center font-bold text-white uppercase text-xs shadow-inner">
                  {user.name.charAt(0)}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
