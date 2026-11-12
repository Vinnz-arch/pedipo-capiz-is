const API_ORIGIN = "http://localhost:8000";

/**
 * Resolve a stored project or opportunity image path to a browser-loadable URL,
 * returning null when no image path is set so UI components can display the
 * "Unavailable Image" fallback instead of a broken image.
 */
export function resolveProjectImageUrl(path?: string | null): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed) return null;

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("/images/")
  ) {
    return trimmed;
  }

  return `${API_ORIGIN}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

