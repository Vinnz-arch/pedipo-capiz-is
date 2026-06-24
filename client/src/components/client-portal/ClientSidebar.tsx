import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import * as Icons from "lucide-react";
import { cn } from "../../lib/utils"
import { PATHS } from "../../routes/paths"
import Logo from "../../assets/logo.jpg"
import { notify } from "../../util/notify"
import { UserServices } from "../../services/UserServices"
import { Spinner } from "../../components/ui/spinner";

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
];

export default function ClientSidebar({ isCollapsed, setIsCollapsed }: ClientSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await UserServices.logout();
      navigate(PATHS.USER_LOGIN);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-md md:hidden border border-border"
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? <Icons.X size={20} className="text-foreground" /> : <Icons.Menu size={20} className="text-foreground" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-in fade-in duration-300" 
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-[#1E3A8A] text-white transition-all duration-300 ease-in-out shadow-xl flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header/Logo Section */}
        <div className="flex items-center justify-between h-32 px-6 border-b border-white/10 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <img src={Logo} className="w-14 h-14 rounded-full" alt="App Logo" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">PEDIPO</span>
                <span className="text-xl font-bold tracking-tight">Capiz</span>  
                <span className="text-[10px] tracking-tight text-accent uppercase font-bold">User Portal</span> 
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-full flex justify-center">
               <Icons.UserCircle size={24} className="text-blue-200" />
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-white/10 text-white/70 transition-colors absolute -right-3 top-20 bg-[#1E3A8A] border border-white/10 shadow-lg"
          >
            {isCollapsed ? <Icons.ChevronRight size={14} /> : <Icons.ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col flex-1 justify-between overflow-y-auto">
          <nav className="p-4 space-y-1">
            <p className={cn(
              "text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4 px-2",
              isCollapsed && "text-center"
            )}>
              {isCollapsed ? "---" : "User Menu"}
            </p>
            {clientRoutes.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={20} className={cn(
                  "shrink-0 transition-transform group-hover:scale-110",
                )} />
                {!isCollapsed && (
                  <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10 shrink-0">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={cn(
                "w-full flex items-center cursor-pointer gap-4 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-all group relative disabled:opacity-50",
              )}
            >
              {isLoggingOut ? (
                <Spinner className="size-5 text-red-400" />
              ) : (
                <Icons.LogOut size={20} className="shrink-0 transition-transform group-hover:scale-110" />
              )}
              {!isCollapsed && <span className="text-sm font-medium">{isLoggingOut ? "Logging out..." : "Logout"}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-red-900 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-red-900/10">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
