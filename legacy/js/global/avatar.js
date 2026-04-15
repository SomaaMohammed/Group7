// js/global/avatar.js
// Resolves user profile-picture mediaIds to renderable blob URLs.
// Works with the urlCache inside storage.js so that rendering code can
// read avatar URLs synchronously after a single async priming step.

import { storage } from "./storage.js";

/**
 * Pre-resolve avatar blob URLs for a list of users.
 * Call this once before any synchronous rendering pass.
 * @param {Array<{profilePicture?: string|null}>} users
 */
export async function resolveAvatarUrls(users) {
    const ids = [
        ...new Set(
            users
                .map((u) => u?.profilePicture)
                .filter((id) => typeof id === "string" && id !== ""),
        ),
    ];
    await Promise.all(ids.map((id) => storage.getUrl(id)));
}

/**
 * Synchronous avatar src getter — returns a blob URL from the primed cache,
 * or the fallback when the user has no profile picture.
 * @param {{profilePicture?: string|null}} user
 * @param {string} fallback
 * @returns {string}
 */
export function getAvatarSrc(user, fallback) {
    const mediaId = user?.profilePicture;
    if (!mediaId) return fallback;
    return storage.getCachedUrl(mediaId) ?? fallback;
}
