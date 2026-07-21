import React, { useState, useRef, useEffect } from "react";
import * as Icons from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../services/Authservices";
import { PATHS } from "../../routes/paths";
import { Spinner } from "../ui/spinner";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const user = AuthService.getUser() || {
    name: "Admin User",
    email: "admin@pedipo.gov.ph",
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await AuthService.logout();
      navigate(PATHS.LOGIN);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-8 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96 hidden md:block">
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button title="Notifications" className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors relative cursor-pointer">
          <Icons.Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
        </button>

        <div className="h-8 w-px bg-border mx-1"></div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer outline-none group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors">
                {user.name || "Admin User"}
              </p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>

            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:border-primary/40 transition-colors shrink-0">
              <Icons.User className="w-5 h-5" />
            </div>

            <Icons.ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Header Info */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{user.name || "Admin User"}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{user.email || "admin@pedipo.gov.ph"}</p>
              </div>

              {/* Menu Actions */}
              <div className="p-1.5">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <Spinner className="w-4 h-4 text-red-600" />
                  ) : (
                    <Icons.LogOut className="w-4 h-4 text-red-600" />
                  )}
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
