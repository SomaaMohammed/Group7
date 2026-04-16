"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
    const [theme, setTheme] = useState(null);

    // Mount-only read: DOM data-theme is authoritative (set by theme-init.js pre-paint).
    useEffect(() => {
        setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    }, []);

    useEffect(() => {
        if (!theme) return;
        document.documentElement.dataset.theme = theme;
        if (document.body) document.body.dataset.theme = theme;
        try {
            localStorage.setItem("theme", theme);
        } catch {}
    }, [theme]);

    // Before mount: render neutral shell. Same HTML on server + first client render → no mismatch.
    if (!theme) {
        return (
            <button
                className="icon-btn theme-toggle-btn"
                type="button"
                data-theme-toggle
                aria-label="Toggle theme"
                suppressHydrationWarning
            />
        );
    }

    const target = theme === "dark" ? "light" : "dark";
    const iconName = target === "light" ? "icon-sun" : "icon-moon";
    const label = target === "light" ? "Light" : "Dark";

    return (
        <button
            className="icon-btn theme-toggle-btn"
            type="button"
            data-theme-toggle
            aria-label={`Switch to ${label} theme`}
            title={`Switch to ${label} theme`}
            onClick={() => setTheme(target)}
        >
            <span className={`icon ${iconName} theme-toggle-icon`} aria-hidden="true" />
            <span className="theme-toggle-label">{label}</span>
        </button>
    );
}
