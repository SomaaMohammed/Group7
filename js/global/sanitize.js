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

  if (trimmed.toLowerCase().startsWith("javascript:")) {
    return fallback;
  }

  return trimmed;
}
