// js/global/auth.js
// Session management. Session key: 'currentUserId' in localStorage.

import db from "./db.js";
import { goToLogin } from "./router.js";

// Returns the full user object for the logged-in user, or null.
export async function getCurrentUser() {
  const userId = localStorage.getItem("currentUserId");
  if (!userId) return null;
  return db.users.findUnique({ where: { id: userId } });
}

// Call at the top of every protected page script.
// Redirects to login if no session; returns the user if session is valid.
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) goToLogin();
  return user;
}

// Write session on successful login.
export function login(userId) {
  localStorage.setItem("currentUserId", userId);
}

// Clear session and redirect to login.
export function logout() {
  localStorage.removeItem("currentUserId");
  goToLogin();
}
