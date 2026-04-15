// js/global/router.js
// Navigation helpers. All paths are relative to pages/ (where every
// page script that imports this module lives).

import { queueToast } from "./toast.js";

function navigate(path) {
  globalThis.location.href = path;
}

function encodeParam(value) {
  return encodeURIComponent(String(value ?? ""));
}

export const goToGlobal = () => navigate("global.html");
export const goToHome = () => navigate("home.html");
export const goToHomeNewPost = () => navigate("home.html?newpost=1");
export const goToLogin = () => navigate("login.html");
export const goToPost = (id) => navigate(`post.html?id=${encodeParam(id)}`);
export const goToSearch = () => navigate("search.html");
export const goToUser = (id) => navigate(`user.html?id=${encodeParam(id)}`);
export const goToSettings = () => navigate("settings.html");
export function navigateWithToast(path, message, type = "info") {
  queueToast(message, type);
  navigate(path);
}
