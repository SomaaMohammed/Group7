// js/global/lightbox.js
// Fullscreen media viewer with prev/next navigation.
// Creates its own DOM on open, removes it on close.

import { isVideo } from "./media.js";

let activeLightbox = null;

/**
 * Open a lightbox to display media items.
 *
 * @param {Array<{url: string, mimeType: string}>} items
 * @param {number} startIndex
 */
export function openLightbox(items, startIndex = 0) {
    if (activeLightbox) closeLightbox();
    if (!items || items.length === 0) return;

    let currentIndex = startIndex;

    const backdrop = document.createElement("div");
    backdrop.className = "lightbox-backdrop";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    backdrop.setAttribute("aria-label", "Media viewer");

    const closeBtn = document.createElement("button");
    closeBtn.className = "lightbox-close";
    closeBtn.setAttribute("aria-label", "Close media viewer");
    closeBtn.innerHTML = "&times;";

    const prevBtn = document.createElement("button");
    prevBtn.className = "lightbox-nav lightbox-nav-prev";
    prevBtn.setAttribute("aria-label", "Previous");
    prevBtn.textContent = "\u2039";

    const nextBtn = document.createElement("button");
    nextBtn.className = "lightbox-nav lightbox-nav-next";
    nextBtn.setAttribute("aria-label", "Next");
    nextBtn.textContent = "\u203A";

    const content = document.createElement("div");
    content.className = "lightbox-content";

    const counter = document.createElement("div");
    counter.className = "lightbox-counter";

    backdrop.append(closeBtn, prevBtn, content, nextBtn, counter);
    document.body.appendChild(backdrop);

    function showItem(index) {
        currentIndex = index;
        const item = items[index];
        content.innerHTML = "";

        if (isVideo(item.mimeType)) {
            const video = document.createElement("video");
            video.src = item.url;
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            content.appendChild(video);
        } else {
            const img = document.createElement("img");
            img.src = item.url;
            img.alt = `Attachment ${index + 1}`;
            content.appendChild(img);
        }

        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === items.length - 1;
        prevBtn.classList.toggle("hidden", items.length <= 1);
        nextBtn.classList.toggle("hidden", items.length <= 1);

        if (items.length > 1) {
            counter.textContent = `${index + 1} / ${items.length}`;
            counter.classList.remove("hidden");
        } else {
            counter.classList.add("hidden");
        }
    }

    function onKeydown(e) {
        if (e.key === "Escape") {
            closeLightbox();
        } else if (e.key === "ArrowLeft" && currentIndex > 0) {
            showItem(currentIndex - 1);
        } else if (e.key === "ArrowRight" && currentIndex < items.length - 1) {
            showItem(currentIndex + 1);
        }
    }

    function onBackdropClick(e) {
        if (e.target === backdrop) closeLightbox();
    }

    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) showItem(currentIndex - 1);
    });
    nextBtn.addEventListener("click", () => {
        if (currentIndex < items.length - 1) showItem(currentIndex + 1);
    });
    backdrop.addEventListener("click", onBackdropClick);
    document.addEventListener("keydown", onKeydown);

    activeLightbox = {
        backdrop,
        onKeydown,
    };

    showItem(startIndex);
    closeBtn.focus();
}

function closeLightbox() {
    if (!activeLightbox) return;

    const { backdrop, onKeydown } = activeLightbox;

    const video = backdrop.querySelector("video");
    if (video) video.pause();

    document.removeEventListener("keydown", onKeydown);
    backdrop.remove();
    activeLightbox = null;
}
