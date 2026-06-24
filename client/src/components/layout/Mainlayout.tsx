import React, { useState, type ReactNode } from "react";
import Sidebar from "./sidebar";
import Navbar from "./Navbar";
import { cn } from "../../lib/utils";

interface MainLayoutProps {
    children?: ReactNode;
    content?: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, content }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex font-sans">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {content || children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
