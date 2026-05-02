"use client";

import { useEffect, useState } from "react";

function readTheme() {
    return document.documentElement.dataset.theme === "dark"
        ? "dark"
        : "light";
}

export function ThemeToggle() {
    const [theme, setTheme] = useState(null);

    // Mount-only read: DOM data-theme is authoritative (set by theme-init.js pre-paint).
    useEffect(() => {
        setTheme(readTheme());

        function handleThemeChange() {
            setTheme(readTheme());
        }

        globalThis.addEventListener("themechange", handleThemeChange);
        globalThis.addEventListener("storage", handleThemeChange);

        return () => {
            globalThis.removeEventListener("themechange", handleThemeChange);
            globalThis.removeEventListener("storage", handleThemeChange);
        };
    }, []);

    useEffect(() => {
        if (!theme) return;
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
        try {
            localStorage.setItem("theme", theme);
            // biome-ignore lint/suspicious/noDocumentCookie: Keep server-rendered theme in sync for no-flash page loads.
            document.cookie = `theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
        } catch {}

        globalThis.dispatchEvent(new Event("themechange"));
    }, [theme]);

    // Before mount: render neutral shell. Same HTML on server + first client render → no mismatch.
    if (!theme) {
        return (
            <button
                className="icon-btn theme-toggle-btn"
                type="button"
                data-theme-toggle
                data-target-theme="dark"
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
            data-target-theme={target}
            aria-label={`Switch to ${label} theme`}
            title={`Switch to ${label} theme`}
            onClick={() => setTheme(target)}
        >
            <span
                className={`icon ${iconName} theme-toggle-icon`}
                aria-hidden="true"
            />
            <span className="theme-toggle-label">{label}</span>
        </button>
    );
}
