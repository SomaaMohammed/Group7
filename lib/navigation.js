export function firstParam(value) {
    return Array.isArray(value) ? value[0] : value;
}

export function getSafeRedirectPath(value, fallback = "/home") {
    const rawValue = firstParam(value);
    if (typeof rawValue !== "string") return fallback;

    const candidate = rawValue.trim();
    if (!candidate.startsWith("/") || candidate.startsWith("//")) {
        return fallback;
    }

    try {
        const url = new URL(candidate, "https://unihub.local");
        if (url.origin !== "https://unihub.local") return fallback;
        if (url.pathname === "/login" || url.pathname === "/register") {
            return fallback;
        }
        return `${url.pathname}${url.search}${url.hash}` || fallback;
    } catch {
        return fallback;
    }
}

export function getLoginRedirectHref(nextPath = "/home") {
    const safeNextPath = getSafeRedirectPath(nextPath, "/home");
    return `/login?next=${encodeURIComponent(safeNextPath)}`;
}
