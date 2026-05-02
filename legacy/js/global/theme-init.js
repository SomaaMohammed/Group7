(function initializeThemeBeforePaint() {
    try {
        const storedTheme = localStorage.getItem("theme");
        const isStoredThemeValid =
            storedTheme === "dark" || storedTheme === "light";

        let theme = "light";
        if (isStoredThemeValid) {
            theme = storedTheme;
        } else if (
            globalThis.matchMedia?.("(prefers-color-scheme: dark)")?.matches
        ) {
            theme = "dark";
        }

        document.documentElement.dataset.theme = theme;
    } catch {
        document.documentElement.dataset.theme = "light";
    }
})();
