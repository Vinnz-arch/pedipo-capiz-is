import React, { useState } from "react";
import { ImageOff } from "lucide-react";
import { resolveProjectImageUrl } from "@/util/projectImage";

interface ProjectImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  compact?: boolean;
  label?: string;
}

/**
 * Renders a project/opportunity image when available, or a clean
 * "Unavailable Image" placeholder when missing or failed to load.
 */
export const ProjectImage: React.FC<ProjectImageProps> = ({
  src,
  alt,
  className = "w-full h-full object-cover",
  fallbackClassName = "",
  compact = false,
  label = "Unavailable Image",
}) => {
  const resolvedSrc = resolveProjectImageUrl(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!resolvedSrc || failedSrc === resolvedSrc) {
    if (compact) {
      return (
        <div
          role="img"
          aria-label={label}
          title={label}
          className={`w-full h-full bg-slate-100 text-slate-400 flex flex-col items-center justify-center p-1 select-none ${fallbackClassName}`.trim()}
        >
          <ImageOff className="w-4 h-4 shrink-0" />
        </div>
      );
    }

    return (
      <div
        role="img"
        aria-label={label}
        className={`w-full h-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 text-slate-400 flex flex-col items-center justify-center gap-1.5 px-4 text-center select-none ${fallbackClassName}`.trim()}
      >
        <div className="w-10 h-10 rounded-full bg-white/80 border border-slate-200/80 flex items-center justify-center shadow-2xs">
          <ImageOff className="w-5 h-5 text-slate-400" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={() => setFailedSrc(resolvedSrc)}
    />
  );
};

