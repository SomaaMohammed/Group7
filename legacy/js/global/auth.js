// js/global/auth.js
// Session management. Session key: 'currentUserId' in localStorage.

import db from "./db.js";
import { goToLogin } from "./router.js";

export async function getCurrentUser() {
    const userId = localStorage.getItem("currentUserId");
    if (!userId) return null;

    const user = await db.users.findUnique({ where: { id: userId } });
    if (!user) {
        localStorage.removeItem("currentUserId");
    }
    return user;
}

export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        goToLogin();
        return null;
    }
    return user;
}

export function login(userId) {
    localStorage.setItem("currentUserId", userId);
}

export function logout() {
    localStorage.removeItem("currentUserId");
    goToLogin();
}
