import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "card" | "table";
  colSpan?: number;
  className?: string;
}

const sizeMap = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  size = "md",
  variant = "default",
  colSpan = 5,
  className,
}) => {
  const spinnerElement = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        variant === "default" && "py-20",
        variant === "card" && "bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs",
        className
      )}
    >
      <Loader2
        className={cn(
          sizeMap[size],
          "text-[#002B66] animate-spin shrink-0"
        )}
      />
      {message && (
        <p className="text-xs font-semibold text-slate-500 tracking-wide select-none">
          {message}
        </p>
      )}
    </div>
  );

  if (variant === "table") {
    return (
      <tr>
        <td colSpan={colSpan} className="p-8 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <Loader2 className="w-5 h-5 text-[#002B66] animate-spin shrink-0" />
            {message && (
              <span className="text-xs font-semibold text-slate-500">
                {message}
              </span>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return spinnerElement;
};

export default LoadingState;
