// js/global/media.js
// Shared helpers for resolving and rendering post media.
// Used by home.js, post.js, and user.js.

import { storage } from "./storage.js";

/**
 * @param {string[]} mediaIds
 * @returns {Promise<Array<{mediaId: string, url: string, mimeType: string}>>}
 */
export async function resolveMedia(mediaIds) {
    const results = await Promise.all(
        mediaIds.map(async (mediaId) => {
            const [url, mimeType] = await Promise.all([
                storage.getUrl(mediaId),
                storage.getMimeType(mediaId),
            ]);
            if (!url) return null;
            return { mediaId, url, mimeType: mimeType || "" };
        }),
    );
    return results.filter(Boolean);
}

/**
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isVideo(mimeType) {
    return mimeType?.startsWith("video/") ?? false;
}

/**
 * Build an HTML string for a Twitter-style media grid.
 * @param {Array<{mediaId: string, url: string, mimeType: string}>} items
 * @returns {string}
 */
export function renderMediaGrid(items) {
    if (!items || items.length === 0) return "";

    const count = Math.min(items.length, 4);
    const cells = items.slice(0, 4).map((item, i) => {
        const inner = isVideo(item.mimeType)
            ? `<video src="${item.url}" preload="metadata" muted playsinline></video>`
            : `<img src="${item.url}" alt="Attachment ${i + 1}" loading="lazy">`;

        return `<div class="media-grid-item" data-index="${i}" data-media-id="${item.mediaId}" data-mime-type="${item.mimeType}">${inner}</div>`;
    });

    return `<div class="media-grid media-grid-${count}">${cells.join("")}</div>`;
}
