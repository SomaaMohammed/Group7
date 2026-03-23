import { requireAuth, logout } from "./global/auth.js";
import { injectShell } from "./global/shell.js";
import { applyTheme, getInitialTheme, setupThemeToggle } from "./global/theme.js";

applyTheme(getInitialTheme());

await requireAuth();
await injectShell();

const logoutBtn = document.getElementById("logout-btn");

const ToggleButton = document.getElementById("settings-theme-toggle");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => { logout(); });
}


const TextLabel = document.getElementById("theme-toggle-label");

if (ToggleButton && TextLabel) {
  setupThemeToggle({ button: ToggleButton, onThemeChanged: (newTheme) => {
    if (newTheme === "dark") {
      TextLabel.textContent = "Dark mode";
    } else{
        TextLabel.textContent = "Light mode";
    }
  } });
}

