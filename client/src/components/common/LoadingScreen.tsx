import React from "react";
import Logo from "@/assets/logo.jpg";
import { Spinner } from "@/components/ui/spinner";

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading experience..."
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-300">
      <div className="flex flex-col items-center max-w-sm text-center">
        {/* Logo with outer pulsing aura */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute w-28 h-28 rounded-full bg-primary/10 animate-ping" />
          <div className="absolute w-32 h-32 rounded-full bg-primary/5 animate-pulse" />
          
          <div className="relative w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-primary/20 overflow-hidden transition-transform duration-300 hover:scale-105">
            <img 
              src={Logo} 
              alt="PEDIPO Capiz Logo" 
              className="w-20 h-20 rounded-full object-cover" 
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-primary tracking-tight">
          PEDIPO Capiz
        </h1>
        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">
          Economic Dashboard
        </p>

        {/* Spinner & status message */}
        <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground font-medium">
          <Spinner className="size-4 text-primary" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
