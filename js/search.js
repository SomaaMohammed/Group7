import { requireAuth } from "./global/auth.js";
import db from "./global/db.js";
import { injectShell } from "./global/shell.js";
import { escapeHtml } from "./global/sanitize.js";
import { resolveAvatarUrls, getAvatarSrc } from "./global/avatar.js";
import { applyTheme, getInitialTheme } from "./global/theme.js";
import { flushQueuedToast, showToast } from "./global/toast.js";

const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

let currentUser = null;
let followedIds = new Set();
let debounceTimer = null;

applyTheme(getInitialTheme());

await initPage();

async function initPage() {
  currentUser = await requireAuth();
  if (!currentUser) return;

  await injectShell();
  flushQueuedToast();

  // Cache which users the current user follows
  const follows = await db.follows.findMany({
    where: { followerId: currentUser.id },
  });
  followedIds = new Set(follows.map((f) => f.followingId));

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runSearch, 300);
    });
    searchInput.focus();
  }

  // Persistent delegation for follow buttons (survives innerHTML replacements)
  if (searchResults) {
    searchResults.addEventListener("click", handleFollowClick);
  }

  renderInitialState();
}

function renderInitialState() {
  if (!searchResults) return;
  searchResults.innerHTML = `
    <p class="text-secondary search-hint">Type to search for users.</p>`;
}

async function runSearch() {
  if (!searchResults || !searchInput) return;

  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    renderInitialState();
    return;
  }

  const allUsers = await db.users.findMany();
  const results = allUsers.filter(
    (u) =>
      u.id !== currentUser.id &&
      u.username.toLowerCase().includes(query),
  );

  if (results.length === 0) {
    searchResults.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-title">No users found.</p>
        <p class="empty-state-description">
          No users matching "${escapeHtml(searchInput.value.trim())}".
        </p>
      </div>`;
    return;
  }

  await resolveAvatarUrls(results);
  searchResults.innerHTML = results.map((user) => renderUserCard(user)).join("");
}

async function handleFollowClick(e) {
  const btn = e.target.closest(".btn-follow");
  if (!btn || btn.disabled) return;

  const userId = btn.dataset.userId;
  if (!userId) return;

  btn.disabled = true;

  const existingFollow = await db.follows.findUnique({
    where: { followerId: currentUser.id, followingId: userId },
  });

  const targetUser = await db.users.findUnique({ where: { id: userId } });
  const username = targetUser?.username || "user";

  if (existingFollow) {
    await db.follows.delete({ where: { id: existingFollow.id } });
    followedIds.delete(userId);
    btn.classList.remove("following");
    btn.textContent = "Follow";
    showToast(`Unfollowed @${username}`, "info");
  } else {
    await db.follows.create({
      data: { followerId: currentUser.id, followingId: userId },
    });
    followedIds.add(userId);
    btn.classList.add("following");
    btn.textContent = "Following";
    showToast(`Now following @${username}`, "success");
  }

  btn.disabled = false;
}

function renderUserCard(user) {
  const username = escapeHtml(user.username || "Unknown");
  const bio = escapeHtml(user.bio || "");
  const avatarSrc = escapeHtml(
    getAvatarSrc(user, "../assets/default-avatar.svg"),
  );
  const userHref = `user.html?id=${encodeURIComponent(user.id)}`;
  const isFollowing = followedIds.has(user.id);
  const followClass = isFollowing ? " following" : "";
  const followLabel = isFollowing ? "Following" : "Follow";

  return `
    <article class="card user-card">
      <a class="user-card-link" href="${userHref}">
        <img class="avatar avatar-md" src="${avatarSrc}" alt="${username}'s avatar" />
        <div class="user-card-info">
          <span class="font-semibold">${username}</span>
          ${bio ? `<p class="text-secondary text-sm">${bio}</p>` : ""}
        </div>
      </a>
      <button class="btn btn-follow${followClass}" data-user-id="${escapeHtml(user.id)}">
        ${followLabel}
      </button>
    </article>`;
}
