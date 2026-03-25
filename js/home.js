import { requireAuth } from "./global/auth.js";
import db from "./global/db.js";
import { injectShell } from "./global/shell.js";
import { escapeHtml, toSafeImageSrc } from "./global/sanitize.js";
import { applyTheme, getInitialTheme } from "./global/theme.js";
import { flushQueuedToast, showToast } from "./global/toast.js";

const MAX_CHARS = 280;

const feedList = document.getElementById("feed-list");
const composerOpenBtn = document.getElementById("composer-open-btn");

const backdrop = document.getElementById("new-post-backdrop");
const textarea = document.getElementById("new-post-content");
const charCount = document.getElementById("new-post-char-count");
const submitBtn = document.getElementById("new-post-submit-btn");
const closeBtn = document.getElementById("new-post-close-btn");
const cancelBtn = document.getElementById("new-post-cancel-btn");

let currentUser = null;

applyTheme(getInitialTheme());

await initPage();

async function initPage() {
  currentUser = await requireAuth();
  if (!currentUser) return;

  await injectShell();
  flushQueuedToast();

  // Override shell New Post buttons to open modal instead of navigating
  overrideShellButton("shell-new-post-btn");
  overrideShellButton("shell-fab-btn");

  // Composer card button
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

  // Character counter
  if (textarea) {
    textarea.addEventListener("input", () => {
      const len = textarea.value.length;
      if (charCount) charCount.textContent = `${len} / ${MAX_CHARS}`;
      if (submitBtn) submitBtn.disabled = len === 0 || len > MAX_CHARS;
    });
  }

  // Submit post
  if (submitBtn) submitBtn.addEventListener("click", submitPost);

  await renderFeed();

  // Auto-open new post modal if redirected from New Post button
  const params = new URLSearchParams(window.location.search);
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
  if (charCount) charCount.textContent = `0 / ${MAX_CHARS}`;
  if (submitBtn) submitBtn.disabled = true;
}

function closeModal() {
  if (!backdrop) return;
  backdrop.classList.add("hidden");
  if (textarea) textarea.value = "";
  if (charCount) charCount.textContent = `0 / ${MAX_CHARS}`;
  if (submitBtn) submitBtn.disabled = true;
}

async function submitPost() {
  if (!textarea || !currentUser) return;

  const content = textarea.value.trim();
  if (!content || content.length > MAX_CHARS) return;

  submitBtn.disabled = true;

  await db.posts.create({
    data: { authorId: currentUser.id, content },
  });

  closeModal();
  showToast("Post created!", "success");
  await renderFeed();
}

async function renderFeed() {
  if (!feedList) return;

  const follows = await db.follows.findMany({
    where: { followerId: currentUser.id },
  });
  const followedIds = follows.map((f) => f.followingId);

  if (followedIds.length === 0) {
    feedList.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-title">You're not following anyone yet.</p>
        <p class="empty-state-description">
          Follow some users to see their posts here.
        </p>
      </div>`;
    return;
  }

  const allPosts = await db.posts.findMany();
  const feedPosts = allPosts.filter((p) => followedIds.includes(p.authorId));
  feedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (feedPosts.length === 0) {
    feedList.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-title">No posts yet.</p>
        <p class="empty-state-description">
          The people you follow haven't posted anything yet.
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

  feedList.innerHTML = feedPosts
    .map((post) => {
      const author = userMap[post.authorId];
      const likeCount = allLikes.filter((l) => l.postId === post.id).length;
      const commentCount = allComments.filter(
        (c) => c.postId === post.id,
      ).length;
      return renderPostCard(post, author, likeCount, commentCount);
    })
    .join("");
}

function renderPostCard(post, author, likeCount, commentCount) {
  const username = escapeHtml(author?.username || "Unknown");
  const avatarSrc = escapeHtml(
    toSafeImageSrc(author?.profilePicture, "../assets/default-avatar.svg"),
  );
  const content = escapeHtml(post.content || "");
  const time = formatTime(post.createdAt);
  const postId = escapeHtml(post.id);
  const userHref = `user.html?id=${encodeURIComponent(author?.id || "")}`;
  const postHref = `post.html?id=${encodeURIComponent(post.id)}`;

  return `
    <article class="card card-interactive" data-post-id="${postId}" aria-label="Post by ${username}">
      <div class="flex items-center gap-3 post-card-header">
        <a class="post-card-user-link" href="${userHref}" aria-label="View ${username}'s profile">
          <img class="avatar avatar-sm" src="${avatarSrc}" alt="${username}'s avatar">
        </a>
        <div>
          <a class="font-semibold post-card-username post-card-user-link" href="${userHref}">${username}</a>
          <span class="text-secondary text-xs">${time}</span>
        </div>
      </div>
      <a class="post-card-open-link" href="${postHref}" aria-label="View post details">
        <p class="post-card-content">${content}</p>
        <div class="flex gap-4 text-secondary text-sm post-card-stats">
          <span>${likeCount} like${likeCount !== 1 ? "s" : ""}</span>
          <span>${commentCount} comment${commentCount !== 1 ? "s" : ""}</span>
        </div>
      </a>
    </article>`;
}

function formatTime(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString();
}
