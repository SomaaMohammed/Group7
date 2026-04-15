export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function toSafeImageSrc(value, fallback) {
  if (!value) return fallback;

  const trimmed = String(value).trim();
  if (!trimmed) return fallback;

  try {
    const parsed = new URL(
      trimmed,
      globalThis.location?.href || "http://localhost/",
    );
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return fallback;
    }
  } catch {
    return fallback;
  }

  return trimmed;
}
