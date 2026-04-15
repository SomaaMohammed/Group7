import { requireAuth } from "./global/auth.js";
import db from "./global/db.js";
import { injectShell } from "./global/shell.js";
import { applyTheme, getInitialTheme } from "./global/theme.js";
import { flushQueuedToast, showToast } from "./global/toast.js";
import { renderPostCard } from "./global/post-card.js";
import { resolveAvatarUrls } from "./global/avatar.js";
import {
    POST_MAX_LENGTH,
    MAX_ATTACHMENTS,
    MAX_IMAGE_SIZE,
    MAX_VIDEO_SIZE,
    ACCEPTED_IMAGE_TYPES,
    ACCEPTED_VIDEO_TYPES,
} from "./global/constants.js";
import { storage } from "./global/storage.js";
import { resolveMedia } from "./global/media.js";
import { openLightbox } from "./global/lightbox.js";

const feedList = document.getElementById("feed-list");
const composerOpenBtn = document.getElementById("composer-open-btn");

const backdrop = document.getElementById("new-post-backdrop");
const textarea = document.getElementById("new-post-content");
const charCount = document.getElementById("new-post-char-count");
const submitBtn = document.getElementById("new-post-submit-btn");
const closeBtn = document.getElementById("new-post-close-btn");
const cancelBtn = document.getElementById("new-post-cancel-btn");

const dropZone = document.getElementById("new-post-drop-zone");
const attachBtn = document.getElementById("new-post-attach-btn");
const fileInput = document.getElementById("new-post-file-input");
const previewsContainer = document.getElementById("new-post-previews");
const attachError = document.getElementById("new-post-attach-error");

let currentUser = null;
let isRenderingFeed = false;
let pendingFiles = [];
let previewUrls = [];

applyTheme(getInitialTheme());

await initPage();

async function initPage() {
    currentUser = await requireAuth();
    if (!currentUser) return;

    await injectShell();
    flushQueuedToast();

    overrideShellButton("shell-new-post-btn");
    overrideShellButton("shell-fab-btn");

    if (composerOpenBtn) {
        composerOpenBtn.addEventListener("click", openModal);
    }

    // Modal controls
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    if (backdrop) {
        backdrop.addEventListener("click", (e) => {
            if (e.target === backdrop) closeModal();
        });
    }
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !backdrop?.classList.contains("hidden")) {
            closeModal();
        }
    });

    // Character counter + submit state
    if (textarea) {
        textarea.addEventListener("input", () => {
            const len = textarea.value.length;
            if (charCount)
                charCount.textContent = `${len} / ${POST_MAX_LENGTH}`;
            updateSubmitState();
        });
    }

    if (submitBtn) submitBtn.addEventListener("click", submitPost);

    if (attachBtn && fileInput) {
        attachBtn.addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", () => {
            handleFilesSelected(fileInput.files);
            fileInput.value = "";
        });
    }

    if (dropZone) {
        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("drag-over");
        });
        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("drag-over");
        });
        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("drag-over");
            handleFilesSelected(e.dataTransfer.files);
        });
    }

    if (feedList) {
        feedList.addEventListener("click", (e) => {
            const gridItem = e.target.closest(".media-grid-item");
            if (!gridItem) return;
            e.preventDefault();
            e.stopPropagation();

            const grid = gridItem.closest(".media-grid");
            const items = [...grid.querySelectorAll(".media-grid-item")];
            const index = items.indexOf(gridItem);
            const mediaItems = items.map((item) => ({
                url: item.querySelector("img,video")?.src,
                mimeType: item.dataset.mimeType,
            }));
            openLightbox(mediaItems, index);
        });
    }

    await renderFeed();

    const params = new URLSearchParams(globalThis.location.search);
    if (params.get("newpost") === "1") {
        history.replaceState(null, "", "home.html");
        openModal();
    }
}

function overrideShellButton(id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const clone = btn.cloneNode(true);
    btn.replaceWith(clone);
    clone.addEventListener("click", openModal);
}

function openModal() {
    if (!backdrop) return;
    backdrop.classList.remove("hidden");
    if (textarea) {
        textarea.value = "";
        textarea.focus();
    }
    if (charCount) charCount.textContent = `0 / ${POST_MAX_LENGTH}`;
    clearPendingFiles();
    clearAttachError();
    if (submitBtn) submitBtn.disabled = true;
}

function closeModal() {
    if (!backdrop) return;
    backdrop.classList.add("hidden");
    if (textarea) textarea.value = "";
    if (charCount) charCount.textContent = `0 / ${POST_MAX_LENGTH}`;
    clearPendingFiles();
    clearAttachError();
    if (submitBtn) submitBtn.disabled = true;
}

function updateSubmitState() {
    if (!submitBtn) return;
    const hasText = textarea && textarea.value.trim().length > 0;
    const hasMedia = pendingFiles.length > 0;
    const textTooLong = textarea && textarea.value.length > POST_MAX_LENGTH;
    submitBtn.disabled = (!hasText && !hasMedia) || textTooLong;
}

function handleFilesSelected(fileList) {
    clearAttachError();
    const files = [...fileList];
    const allAccepted = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];

    for (const file of files) {
        if (pendingFiles.length >= MAX_ATTACHMENTS) {
            showAttachError(`Maximum ${MAX_ATTACHMENTS} attachments allowed.`);
            break;
        }
        if (!allAccepted.includes(file.type)) {
            showAttachError(`"${file.name}" is not a supported file type.`);
            continue;
        }
        const isVideo = file.type.startsWith("video/");
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        const label = isVideo ? "video" : "image";
        const limitMB = maxSize / (1024 * 1024);
        if (file.size > maxSize) {
            showAttachError(
                `"${file.name}" exceeds the ${limitMB}MB ${label} limit.`,
            );
            continue;
        }
        pendingFiles.push(file);
    }

    renderPreviews();
    updateSubmitState();
}

function renderPreviews() {
    if (!previewsContainer) return;

    for (const url of previewUrls) {
        URL.revokeObjectURL(url);
    }
    previewUrls = [];

    previewsContainer.innerHTML = "";

    pendingFiles.forEach((file, i) => {
        const wrapper = document.createElement("div");
        wrapper.className = "attachment-preview";

        const url = URL.createObjectURL(file);
        previewUrls.push(url);

        if (file.type.startsWith("video/")) {
            const vid = document.createElement("video");
            vid.src = url;
            vid.muted = true;
            wrapper.appendChild(vid);
        } else {
            const img = document.createElement("img");
            img.src = url;
            img.alt = `Preview ${i + 1}`;
            wrapper.appendChild(img);
        }

        const removeBtn = document.createElement("button");
        removeBtn.className = "attachment-preview-remove";
        removeBtn.setAttribute("aria-label", `Remove ${file.name}`);
        removeBtn.textContent = "\u00d7";
        removeBtn.addEventListener("click", () => removeFile(i));

        wrapper.appendChild(removeBtn);
        previewsContainer.appendChild(wrapper);
    });
}

function removeFile(index) {
    pendingFiles.splice(index, 1);
    clearAttachError();
    renderPreviews();
    updateSubmitState();
}

function clearPendingFiles() {
    pendingFiles = [];
    for (const url of previewUrls) {
        URL.revokeObjectURL(url);
    }
    previewUrls = [];
    if (previewsContainer) previewsContainer.innerHTML = "";
}

function showAttachError(msg) {
    if (!attachError) return;
    attachError.textContent = msg;
    attachError.classList.remove("hidden");
}

function clearAttachError() {
    if (!attachError) return;
    attachError.textContent = "";
    attachError.classList.add("hidden");
}

async function submitPost() {
    if (!currentUser || !submitBtn) return;

    const content = textarea ? textarea.value.trim() : "";
    if (!content && pendingFiles.length === 0) return;
    if (content.length > POST_MAX_LENGTH) return;
    if (submitBtn.disabled) return;

    submitBtn.disabled = true;

    try {
        const mediaIds = await Promise.all(
            pendingFiles.map((file) => storage.upload(file)),
        );

        await db.posts.create({
            data: { authorId: currentUser.id, content, mediaIds },
        });

        closeModal();
        showToast("Post created!", "success");
        await renderFeed();
    } catch (err) {
        showToast(err.message || "Failed to create post.", "danger");
    } finally {
        if (!backdrop?.classList.contains("hidden")) {
            submitBtn.disabled = false;
        }
    }
}

async function renderFeed() {
    if (!feedList || isRenderingFeed) return;

    isRenderingFeed = true;

    try {
        const follows = await db.follows.findMany({
            where: { followerId: currentUser.id },
        });
        const followedIds = follows.map((f) => f.followingId);
        followedIds.push(currentUser.id);

        const allPosts = await db.posts.findMany();
        const feedPosts = allPosts.filter((p) =>
            followedIds.includes(p.authorId),
        );
        feedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (feedPosts.length === 0) {
            feedList.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-title">No posts yet.</p>
          <p class="empty-state-description">
            Create a post or follow some users to see their posts here.
          </p>
        </div>`;
            return;
        }

        const [allUsers, allLikes, allComments] = await Promise.all([
            db.users.findMany(),
            db.likes.findMany(),
            db.comments.findMany(),
        ]);

        const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u]));

        await resolveAvatarUrls(allUsers);

        const mediaMap = new Map();
        await Promise.all(
            feedPosts.map(async (post) => {
                if (post.mediaIds?.length) {
                    mediaMap.set(post.id, await resolveMedia(post.mediaIds));
                }
            }),
        );

        feedList.innerHTML = feedPosts
            .map((post) => {
                const author = userMap[post.authorId];
                const likeCount = allLikes.filter(
                    (l) => l.postId === post.id,
                ).length;
                const commentCount = allComments.filter(
                    (c) => c.postId === post.id,
                ).length;
                const mediaItems = mediaMap.get(post.id) || [];
                return renderPostCard(
                    post,
                    author,
                    likeCount,
                    commentCount,
                    mediaItems,
                );
            })
            .join("");
    } finally {
        isRenderingFeed = false;
    }
}
