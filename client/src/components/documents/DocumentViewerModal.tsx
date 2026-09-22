import React, { useEffect, useRef, useState } from "react";
import { 
  X, 
  Download, 
  FileText, 
  Loader2, 
  AlertCircle, 
  Maximize2, 
  Minimize2
} from "lucide-react";
import { renderAsync } from "docx-preview";
import mammoth from "mammoth";
import { 
  type OpportunityDocumentData, 
  formatDocFileSize, 
  resolveDocUrl 
} from "@/services/OpportunityService";

interface DocumentViewerModalProps {
  document: OpportunityDocumentData | any | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document: doc,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  const fileExt = (doc?.file_type || doc?.file_name.split(".").pop() || "").toLowerCase();
  const isDocx = fileExt === "docx" || fileExt === "doc";
  const isPdf = fileExt === "pdf";
  const isImage = ["png", "jpg", "jpeg", "webp", "svg", "gif"].includes(fileExt);
  const fileUrl = doc ? resolveDocUrl(doc.file_path, doc) : "";

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!doc || !fileUrl) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setError(null);
    setHtmlContent(null);
    setIsLoading(true);

    if (!isDocx) {
      setIsLoading(false);
      return;
    }

    const loadDocx = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch document: HTTP ${response.status}`);
        }
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();

        if (!isMounted) return;

        // Try docx-preview first for high-fidelity paginated Word styling
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          try {
            await renderAsync(arrayBuffer, containerRef.current, undefined, {
              className: "docx-preview-content",
              inWrapper: true,
              ignoreWidth: false,
              ignoreHeight: false,
              breakPages: true,
            });
            if (isMounted) {
              setIsLoading(false);
              return;
            }
          } catch (previewErr) {
            console.warn("docx-preview failed, attempting mammoth fallback:", previewErr);
          }
        }

        // Fallback to mammoth HTML conversion
        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (isMounted) {
          setHtmlContent(result.value);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Error rendering document:", err);
        if (isMounted) {
          setError(err.message || "Failed to parse document content.");
          setIsLoading(false);
        }
      }
    };

    loadDocx();

    return () => {
      isMounted = false;
    };
  }, [fileUrl, isDocx, doc]);

  // Safe early exit only AFTER all hooks are registered
  if (!doc) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden transition-all duration-200 ${
          isFullScreen 
            ? "w-full h-full max-w-none rounded-none" 
            : "w-full max-w-5xl h-[90vh]"
        }`}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-black text-xs uppercase border border-blue-200">
              {fileExt || "DOC"}
            </div>
            <div className="truncate">
              <h3 className="font-extrabold text-sm text-slate-900 truncate" title={doc.title}>
                {doc.title}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                {doc.file_name} • {formatDocFileSize(doc.file_size)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Download Button */}
            <a
              href={fileUrl}
              download={doc.file_name}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-600 hover:text-[#002B66] hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
              title="Download copy to device"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </a>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen Preview"}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Area */}
        <div className="flex-1 overflow-auto bg-slate-100 relative p-4 flex justify-center">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
              <p className="text-sm font-bold text-slate-800">Rendering document preview...</p>
              <p className="text-xs text-slate-400 mt-1">Preparing pages and document formatting</p>
            </div>
          )}

          {error && (
            <div className="m-auto max-w-md bg-white p-6 rounded-2xl border border-red-200 shadow-md text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Preview Unavailable</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We encountered an issue rendering this file inline in the browser. You can still download the document directly to view it on your device.
              </p>
              <a
                href={fileUrl}
                download={doc.file_name}
                className="inline-flex items-center justify-center gap-2 bg-[#002B66] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#001D47] transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {doc.file_name}</span>
              </a>
            </div>
          )}

          {/* DOCX Document Container */}
          {isDocx && !error && (
            <div className="w-full flex justify-center">
              {htmlContent ? (
                <div 
                  className="bg-white shadow-xl rounded-xl p-8 max-w-4xl w-full min-h-[800px] prose prose-slate text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              ) : (
                <div 
                  ref={containerRef} 
                  className="docx-viewer-wrapper w-full flex flex-col items-center"
                />
              )}
            </div>
          )}

          {/* PDF Viewer */}
          {isPdf && !error && (
            <iframe
              src={fileUrl}
              title={doc.title}
              className="w-full h-full bg-white rounded-xl shadow-md border border-slate-200"
            />
          )}

          {/* Image Viewer */}
          {isImage && !error && (
            <div className="m-auto flex items-center justify-center p-4">
              <img
                src={fileUrl}
                alt={doc.title}
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-lg border border-slate-200 bg-white"
              />
            </div>
          )}

          {/* Other Unrecognized Files */}
          {!isDocx && !isPdf && !isImage && !error && (
            <div className="m-auto max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-md text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">File Type: .{fileExt.toUpperCase()}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                This document format requires dedicated software to open. Download the file below to view its contents.
              </p>
              <a
                href={fileUrl}
                download={doc.file_name}
                className="inline-flex items-center justify-center gap-2 bg-[#002B66] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#001D47] transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {doc.file_name}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
