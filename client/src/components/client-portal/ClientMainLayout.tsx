import React, { useState, type ReactNode } from "react";
import ClientSidebar from "./ClientSidebar";
import ClientNavbar from "./ClientNavbar";
import { cn } from "../../lib/utils";

interface ClientMainLayoutProps {
    children?: ReactNode;
}

const ClientMainLayout: React.FC<ClientMainLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex font-sans">
      <ClientSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        {/* Navbar */}
        <ClientNavbar />

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <style>{`
              .custom-scrollbar::-webkit-scrollbar { width: 6px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--primary), 0.1); border-radius: 10px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(var(--primary), 0.3); }
          `}</style>
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientMainLayout;
