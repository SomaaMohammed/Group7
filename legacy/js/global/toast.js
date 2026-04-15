// js/global/toast.js
// Displays temporary toasts and supports redirect-safe toasts via sessionStorage.
// Relies on .toast-container in page HTML and toast styles in global.css.

const PENDING_TOAST_KEY = "pendingToast";

function normalizeToast(message, type = "info") {
    const allowedTypes = new Set(["success", "danger", "info"]);
    return {
        type: allowedTypes.has(type) ? type : "info",
        message: String(message ?? ""),
    };
}

function renderToast({ message, type }) {
    const container = document.querySelector(".toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "toast-out 300ms ease forwards";
        toast.addEventListener("animationend", () => toast.remove(), {
            once: true,
        });
    }, 2700);
}

export function showToast(message, type = "info") {
    renderToast(normalizeToast(message, type));
}

export function queueToast(message, type = "info") {
    const payload = normalizeToast(message, type);
    sessionStorage.setItem(PENDING_TOAST_KEY, JSON.stringify(payload));
}

export function flushQueuedToast() {
    const raw = sessionStorage.getItem(PENDING_TOAST_KEY);
    if (!raw) return;

    sessionStorage.removeItem(PENDING_TOAST_KEY);
    try {
        const parsed = JSON.parse(raw);
        renderToast(normalizeToast(parsed?.message, parsed?.type));
    } catch {}
}
