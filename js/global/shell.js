// js/global/shell.js
// Injects the application chrome (header, sidebar, bottom-nav) into #shell-root.
// Call once per protected page, after requireAuth().
//
// Required page structure:
//   <body class="app-shell">
//     <div id="shell-root"></div>
//     <main class="app-main"> ... </main>
//     <div class="toast-container"></div>
//   </body>

import { getCurrentUser } from "./auth.js";
import { goToHome } from "./router.js";
import { escapeHtml, toSafeImageSrc } from "./sanitize.js";
import { setupThemeToggle } from "./theme.js";

// SVG icons (24×24, stroke-based, no external library)
const icons = {
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
    <polyline points="9 21 9 12 15 12 15 21"/>
  </svg>`,

  person: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>`,

  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06
      a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09
      A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06
      A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
      A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06
      A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09
      a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06
      A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09
      a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>`,

  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>`,
};

export async function injectShell() {
  const user = await getCurrentUser();
  if (!user) return;

  const avatarSrc = toSafeImageSrc(
    user.profilePicture,
    "../assets/default-avatar.svg",
  );
  const safeAvatarSrc = escapeHtml(avatarSrc);
  const safeUsername = escapeHtml(user.username || "user");
  const safeUserId = encodeURIComponent(String(user.id || ""));

  // Active page detection
  const path = globalThis.location.pathname;
  const isHome = path.includes("home.html");
  const isProfile = path.includes("user.html");
  const isSettings = path.includes("settings.html");

  const activeClass = (flag) => (flag ? " active" : "");

  const shell = document.getElementById("shell-root");
  if (!shell) return;

  shell.innerHTML = `
    <!-- Mobile header (sticky top) -->
    <header class="app-header">
      <div class="app-header-identity">
        <img class="avatar avatar-sm" src="${safeAvatarSrc}" alt="${safeUsername}'s avatar">
        <span class="app-header-username">${safeUsername}</span>
      </div>
      <div class="app-header-actions">
        <button
          class="icon-btn theme-toggle-btn"
          type="button"
          data-theme-toggle
          aria-label="Toggle theme"
        ></button>
        <a class="icon-btn app-header-settings" href="settings.html" aria-label="Settings">
          ${icons.settings}
        </a>
      </div>
    </header>

    <!-- Desktop sidebar (left column) -->
    <aside class="app-sidebar">
      <div class="sidebar-brand-row">
        <div class="sidebar-brand">Socially</div>
        <button
          class="icon-btn theme-toggle-btn"
          type="button"
          data-theme-toggle
          aria-label="Toggle theme"
        ></button>
      </div>

      <nav class="sidebar-nav">
        <a class="sidebar-nav-item${activeClass(isHome)}" href="home.html">
          ${icons.home}
          <span>Home</span>
        </a>
        <a class="sidebar-nav-item${activeClass(isProfile)}" href="user.html?id=${safeUserId}">
          ${icons.person}
          <span>Profile</span>
        </a>
        <a class="sidebar-nav-item${activeClass(isSettings)}" href="settings.html">
          ${icons.settings}
          <span>Settings</span>
        </a>
      </nav>

      <div class="sidebar-new-post">
        <button class="btn btn-primary" id="shell-new-post-btn">New Post</button>
      </div>

      <a class="sidebar-user" href="user.html?id=${safeUserId}">
        <img class="avatar avatar-sm" src="${safeAvatarSrc}" alt="${safeUsername}'s avatar">
        <div class="sidebar-user-info">
          <span class="sidebar-user-name">${safeUsername}</span>
          <span class="sidebar-user-handle">@${safeUsername}</span>
        </div>
      </a>
    </aside>

    <!-- Mobile bottom navigation (fixed bottom) -->
    <nav class="bottom-nav">
      <a class="bottom-nav-item${activeClass(isHome)}" href="home.html" aria-label="Home">
        ${icons.home}
      </a>
      <button class="bottom-nav-fab" id="shell-fab-btn" aria-label="New post">
        ${icons.plus}
      </button>
      <a class="bottom-nav-item${activeClass(isProfile)}" href="user.html?id=${safeUserId}" aria-label="Profile">
        ${icons.person}
      </a>
    </nav>
  `;

  // Default behaviour for New Post controls: navigate to home.
  // home.js overrides these with its own handlers to open the modal instead.
  const newPostBtn = document.getElementById("shell-new-post-btn");
  const fabBtn = document.getElementById("shell-fab-btn");

  if (newPostBtn) newPostBtn.addEventListener("click", goToHome);
  if (fabBtn) fabBtn.addEventListener("click", goToHome);

  const themeToggleButtons = Array.from(
    document.querySelectorAll("[data-theme-toggle]"),
  );
  setupThemeToggle({ buttons: themeToggleButtons });
}
