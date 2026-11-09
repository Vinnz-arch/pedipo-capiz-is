/**
 * Utility to download files directly in the browser via JavaScript blob handling.
 *
 * This completely avoids HTML5 `<a download>` cross-origin limitations where
 * modern browsers ignore the download attribute for cross-origin URLs (e.g. localhost:8000
 * when the app is running on localhost:5173), which normally causes PDFs to open in a new tab.
 */
export const downloadFileDirectly = async (
  url?: string | null,
  preferredFilename?: string
): Promise<void> => {
  if (!url || url === "#") return;

  const normalizedUrl = url.startsWith("http")
    ? url
    : `http://localhost:8000${url.startsWith("/") ? "" : "/"}${url}`;

  // Extract a sensible fallback filename from the URL if not provided
  let filename = preferredFilename;
  if (!filename) {
    const urlWithoutQuery = normalizedUrl.split("?")[0];
    const extracted = urlWithoutQuery.substring(urlWithoutQuery.lastIndexOf("/") + 1);
    filename = decodeURIComponent(extracted) || "downloaded_file";
  }

  try {
    const response = await fetch(normalizedUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Attempt to extract server-provided filename if not explicitly customized
    const disposition = response.headers.get("content-disposition");
    if (disposition && !preferredFilename) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, "").trim();
      }
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.warn("Direct blob download failed, falling back to window.open:", error);
    window.open(normalizedUrl, "_blank");
  }
};
