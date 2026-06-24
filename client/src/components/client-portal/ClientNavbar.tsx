import React from "react";
import * as Icons from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const ClientNavbar: React.FC = () => {
  const clientUser = JSON.parse(localStorage.getItem("client_user") || "{}");

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-lg font-bold text-foreground hidden md:block">Client Overview</h1>
      </div>
      
      <div className="flex items-center gap-4">

        <Button variant="ghost" size="icon-sm" className="relative text-muted-foreground">
          <Icons.Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
        </Button>

        <div className="h-8 w-px bg-border mx-2"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block text-foreground">
            <p className="text-sm font-semibold leading-none">{clientUser.fullname}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-tighter mt-1">{clientUser.role}</p>
          </div>
          <Avatar className="h-10 w-10 border border-primary/20">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm uppercase">
              {clientUser.fullname?.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default ClientNavbar;
