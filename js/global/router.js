// js/global/router.js
// Navigation helpers. All paths are relative to pages/ (where every
// page script that imports this module lives).

function navigate(path) {
  globalThis.location.href = path;
}

function encodeParam(value) {
  return encodeURIComponent(String(value ?? ""));
}

export const goToHome = () => navigate("home.html");
export const goToLogin = () => navigate("login.html");
export const goToPost = (id) => navigate(`post.html?id=${encodeParam(id)}`);
export const goToUser = (id) => navigate(`user.html?id=${encodeParam(id)}`);
export const goToSettings = () => navigate("settings.html");
