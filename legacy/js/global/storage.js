// js/global/storage.js
// IndexedDB blob storage — the ONLY file that touches IndexedDB.
// API mirrors a remote object-store intentionally — migrating to S3/Supabase
// in Phase 2 means rewriting only this file.
//
// Record schema:
//   { mediaId, blob, mimeType, fileName, createdAt }

const DB_NAME = "UNI_HUB_Media";
const DB_VERSION = 1;
const STORE_NAME = "blobs";

/** @type {Promise<IDBDatabase>|null} */
let dbPromise = null;

/** @type {Map<string, string>} */
const urlCache = new Map();

function openDb() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "mediaId" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    return dbPromise;
}

function generateMediaId() {
    const randomPart =
        globalThis.crypto?.randomUUID?.() ??
        Math.random().toString(36).slice(2, 11);
    return `med_${randomPart}`;
}

/**
 * @param {File} file
 * @returns {Promise<string>}
 */
async function upload(file) {
    const db = await openDb();
    const mediaId = generateMediaId();
    const record = {
        mediaId,
        blob: file,
        mimeType: file.type,
        fileName: file.name,
        createdAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(record);

        tx.oncomplete = () => resolve(mediaId);
        tx.onerror = () => {
            const err = tx.error;
            if (err?.name === "QuotaExceededError") {
                reject(
                    new Error(
                        "Storage is full. Try deleting some posts with media.",
                    ),
                );
            } else {
                reject(err);
            }
        };
    });
}

/**
 * Get an object URL for a stored media item. Cached to prevent duplicates.
 * @param {string} mediaId
 * @returns {Promise<string|null>}
 */
async function getUrl(mediaId) {
    if (urlCache.has(mediaId)) return urlCache.get(mediaId);

    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).get(mediaId);

        request.onsuccess = () => {
            const record = request.result;
            if (!record) {
                resolve(null);
                return;
            }
            const url = URL.createObjectURL(record.blob);
            urlCache.set(mediaId, url);
            resolve(url);
        };
        request.onerror = () => reject(request.error);
    });
}

/**.
 * @param {string} mediaId
 * @returns {Promise<string|null>}
 */
async function getMimeType(mediaId) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).get(mediaId);

        request.onsuccess = () => {
            resolve(request.result?.mimeType ?? null);
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * @param {string} mediaId
 */
async function remove(mediaId) {
    const db = await openDb();

    await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(mediaId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });

    if (urlCache.has(mediaId)) {
        URL.revokeObjectURL(urlCache.get(mediaId));
        urlCache.delete(mediaId);
    }
}

/**
 * Delete multiple media items.
 * @param {string[]} mediaIds
 */
async function deleteMany(mediaIds) {
    await Promise.all(mediaIds.map((id) => remove(id)));
}

/**
 * Synchronously return a previously cached object URL, or null.
 * Call getUrl() first to prime the cache.
 * @param {string} mediaId
 * @returns {string|null}
 */
function getCachedUrl(mediaId) {
    return urlCache.get(mediaId) ?? null;
}

async function clearAll() {
    const db = await openDb();

    await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });

    for (const url of urlCache.values()) {
        URL.revokeObjectURL(url);
    }
    urlCache.clear();
}

export const storage = {
    upload,
    getUrl,
    getCachedUrl,
    getMimeType,
    delete: remove,
    deleteMany,
    clearAll,
};
