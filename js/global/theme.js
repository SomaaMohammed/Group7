export function getInitialTheme() {
  const storedTheme = localStorage.getItem("theme");
  const isStoredThemeValid = storedTheme === "dark" || storedTheme === "light";

  if (isStoredThemeValid) {
    return storedTheme;
  }

  const prefersDark =
    globalThis.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  return prefersDark ? "dark" : "light";
}

export function applyTheme(theme) {
  document.body.dataset.theme = theme;
}

export function toggleTheme(currentTheme) {
  return currentTheme === "dark" ? "light" : "dark";
}

export function setStoredTheme(theme) {
  localStorage.setItem("theme", theme);
}

export function setupThemeToggle({ button, onThemeChanged } = {}) {
  let activeTheme = getInitialTheme();
  applyTheme(activeTheme);

  if (onThemeChanged) {
    onThemeChanged(activeTheme);
  }

  if (button) {
    button.addEventListener("click", () => {
      activeTheme = toggleTheme(activeTheme);
      applyTheme(activeTheme);
      setStoredTheme(activeTheme);

      if (onThemeChanged) {
        onThemeChanged(activeTheme);
      }
    });
  }

  return activeTheme;
}
