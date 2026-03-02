// js/global/router.js
// Navigation helpers. All paths are relative to pages/ (where every
// page script that imports this module lives).

export const goToHome = () => (globalThis.location.href = "home.html");
export const goToLogin = () => (globalThis.location.href = "login.html");
export const goToPost = (id) =>
  (globalThis.location.href = `post.html?id=${id}`);
export const goToUser = (id) =>
  (globalThis.location.href = `user.html?id=${id}`);
export const goToSettings = () => (globalThis.location.href = "settings.html");
