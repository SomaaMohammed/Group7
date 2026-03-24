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
import { goToHome, goToHomeNewPost } from "./router.js";
import { escapeHtml, toSafeImageSrc } from "./sanitize.js";
import { setupThemeToggle } from "./theme.js";

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
  const isHome = path.endsWith("home.html");
  const isProfile = path.endsWith("user.html");
  const isSettings = path.endsWith("settings.html");

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
          <span class="icon icon-settings" aria-hidden="true"></span>
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
          <span class="icon icon-home" aria-hidden="true"></span>
          <span>Home</span>
        </a>
        <a class="sidebar-nav-item${activeClass(isProfile)}" href="user.html?id=${safeUserId}">
          <span class="icon icon-person" aria-hidden="true"></span>
          <span>Profile</span>
        </a>
        <a class="sidebar-nav-item${activeClass(isSettings)}" href="settings.html">
          <span class="icon icon-settings" aria-hidden="true"></span>
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
        <span class="icon icon-home" aria-hidden="true"></span>
      </a>
      <button class="bottom-nav-fab" id="shell-fab-btn" aria-label="New post">
        <span class="icon icon-plus" aria-hidden="true"></span>
      </button>
      <a class="bottom-nav-item${activeClass(isProfile)}" href="user.html?id=${safeUserId}" aria-label="Profile">
        <span class="icon icon-person" aria-hidden="true"></span>
      </a>
    </nav>
  `;

  // Default behaviour for New Post controls: navigate to home.
  // home.js overrides these with its own handlers to open the modal instead.
  const newPostBtn = document.getElementById("shell-new-post-btn");
  const fabBtn = document.getElementById("shell-fab-btn");

  if (newPostBtn) newPostBtn.addEventListener("click", goToHomeNewPost);
  if (fabBtn) fabBtn.addEventListener("click", goToHomeNewPost);

  const themeToggleButtons = Array.from(
    document.querySelectorAll("[data-theme-toggle]"),
  );
  setupThemeToggle({ buttons: themeToggleButtons });
}
