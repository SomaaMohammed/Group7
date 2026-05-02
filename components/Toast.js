"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import PropTypes from "@/lib/prop-types";

const ToastContext = createContext(null);
const ALLOWED = new Set(["success", "danger", "info"]);
const PENDING_KEY = "pendingToast";
let nextId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const remove = useCallback((toastId) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
    }, []);

    const show = useCallback(
        (message, type = "info") => {
            const t = {
                id: ++nextId,
                message: String(message ?? ""),
                type: ALLOWED.has(type) ? type : "info",
            };
            setToasts((prev) => [...prev, t]);
            setTimeout(() => remove(t.id), 3000);
        },
        [remove],
    );

    const value = useMemo(() => ({ show }), [show]);

    // Pull any queued toast written before a navigation.
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(PENDING_KEY);
            if (!raw) return;
            sessionStorage.removeItem(PENDING_KEY);
            const parsed = JSON.parse(raw);
            show(parsed?.message, parsed?.type);
        } catch {}
    }, [show]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast-${t.type}`}>
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

ToastProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx.show;
}

// Enqueue a toast to display on the next page load (survives navigation).
export function queueToast(message, type = "info") {
    try {
        sessionStorage.setItem(
            PENDING_KEY,
            JSON.stringify({
                message: String(message ?? ""),
                type: ALLOWED.has(type) ? type : "info",
            }),
        );
    } catch {}
}
