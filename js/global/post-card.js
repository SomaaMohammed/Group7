// js/global/post-card.js
// Shared post-card renderer used by both the "Your Feed" and "Global Feed" pages.

import { escapeHtml, toSafeImageSrc } from "./sanitize.js";
import { formatTime } from "./time.js";
import { renderMediaGrid } from "./media.js";

export function renderPostCard(
  post,
  author,
  likeCount,
  commentCount,
  mediaItems,
) {
  const username = escapeHtml(author?.username || "Unknown");
  const avatarSrc = escapeHtml(
    toSafeImageSrc(author?.profilePicture, "../assets/default-avatar.svg"),
  );
  const content = escapeHtml(post.content || "");
  const time = formatTime(post.createdAt);
  const userHref = `user.html?id=${encodeURIComponent(author?.id || "")}`;
  const postHref = `post.html?id=${encodeURIComponent(post.id)}`;
  const mediaHtml = mediaItems.length ? renderMediaGrid(mediaItems) : "";

  return `
    <article class="card card-interactive post-card" aria-label="Post by ${username}">
      <a class="post-card-stretched-link" href="${postHref}" aria-label="View post details"></a>
      <div class="flex items-center gap-3 post-card-header">
        <a class="post-card-user-link" href="${userHref}" aria-label="View ${username}'s profile">
          <img class="avatar avatar-sm" src="${avatarSrc}" alt="${username}'s avatar">
        </a>
        <div>
          <a class="font-semibold post-card-username post-card-user-link" href="${userHref}">${username}</a>
          <span class="text-secondary text-xs">${time}</span>
        </div>
      </div>
      <p class="post-card-content">${content}</p>
      ${mediaHtml}
      <div class="flex gap-4 text-secondary text-sm post-card-stats">
        <span>${likeCount} like${likeCount === 1 ? "" : "s"}</span>
        <span>${commentCount} comment${commentCount === 1 ? "" : "s"}</span>
      </div>
    </article>`;
}
