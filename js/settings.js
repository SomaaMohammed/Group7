import { requireAuth, logout } from "./global/auth.js";
import { injectShell } from "./global/shell.js";
import { applyTheme, getInitialTheme, setupThemeToggle } from "./global/theme.js";
import { flushQueuedToast } from "./global/toast.js";

applyTheme(getInitialTheme());

await requireAuth();
await injectShell();
flushQueuedToast();

const logoutBtn = document.getElementById("logout-btn");
const toggleButton = document.getElementById("settings-theme-toggle");
const textLabel = document.getElementById("theme-toggle-label");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    logout();
  });
}

if (toggleButton && textLabel) {
  setupThemeToggle({
    button: toggleButton,
    onThemeChanged: (newTheme) => {
      textLabel.textContent = newTheme === "dark" ? "Dark mode" : "Light mode";
    },
  });
}
