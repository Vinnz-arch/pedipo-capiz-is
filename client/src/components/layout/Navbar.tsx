import React from "react";
import * as Icons from "lucide-react";

const Navbar: React.FC = () => {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96 hidden md:block">

        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button title="button" className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors relative">
          <Icons.Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
        </button>
        <div className="h-8 w-px bg-border mx-2"></div>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">Admin User</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Icons.User className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
