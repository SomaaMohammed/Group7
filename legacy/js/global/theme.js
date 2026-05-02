export function getInitialTheme() {
    const storedTheme = localStorage.getItem("theme");
    const isStoredThemeValid =
        storedTheme === "dark" || storedTheme === "light";

    if (isStoredThemeValid) {
        return storedTheme;
    }

    const prefersDark =
        globalThis.matchMedia?.("(prefers-color-scheme: dark)")?.matches ??
        false;
    return prefersDark ? "dark" : "light";
}

export function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (document.body) {
        document.body.dataset.theme = theme;
    }
}

export function toggleTheme(currentTheme) {
    return currentTheme === "dark" ? "light" : "dark";
}

export function setStoredTheme(theme) {
    localStorage.setItem("theme", theme);
}

function normalizeButtons({ button, buttons } = {}) {
    if (Array.isArray(buttons)) {
        return buttons.filter(Boolean);
    }

    return button ? [button] : [];
}

export function updateThemeToggleButtons(buttons, activeTheme) {
    const targetTheme = activeTheme === "dark" ? "light" : "dark";
    const iconName = targetTheme === "light" ? "icon-sun" : "icon-moon";
    const targetThemeLabel = targetTheme === "light" ? "Light" : "Dark";

    buttons.forEach((button) => {
        button.innerHTML = `
      <span class="icon ${iconName} theme-toggle-icon" aria-hidden="true"></span>
      <span class="theme-toggle-label">${targetThemeLabel}</span>
    `;
        button.setAttribute(
            "aria-label",
            `Switch to ${targetThemeLabel} theme`,
        );
        button.setAttribute("title", `Switch to ${targetThemeLabel} theme`);
        button.dataset.targetTheme = targetTheme;
    });
}

export function setupThemeToggle({ button, buttons, onThemeChanged } = {}) {
    const toggleButtons = normalizeButtons({ button, buttons });
    let activeTheme = getInitialTheme();
    applyTheme(activeTheme);

    updateThemeToggleButtons(toggleButtons, activeTheme);

    if (onThemeChanged) {
        onThemeChanged(activeTheme);
    }

    toggleButtons.forEach((toggleButton) => {
        toggleButton.addEventListener("click", () => {
            activeTheme = toggleTheme(activeTheme);
            applyTheme(activeTheme);
            setStoredTheme(activeTheme);
            updateThemeToggleButtons(toggleButtons, activeTheme);

            if (onThemeChanged) {
                onThemeChanged(activeTheme);
            }
        });
    });

    return activeTheme;
}
