import { requireAuth } from "./global/auth.js";
import db from "./global/db.js";
import { injectShell } from "./global/shell.js";
import { goToSettings } from "./global/router.js";
import { applyTheme, getInitialTheme } from "./global/theme.js";
import { showToast } from "./global/toast.js";

const profileAvatar = document.getElementById("profile-avatar");
const profileName = document.getElementById("profile-name");
const profileHandle = document.getElementById("profile-handle");
const profileBio = document.getElementById("profile-bio");
const profileActionBtn = document.getElementById("profile-action-btn");

const profilePostsCount = document.getElementById("profile-posts-count");
const profileFollowersCount = document.getElementById(
  "profile-followers-count",
);
const profileFollowingCount = document.getElementById(
  "profile-following-count",
);
const userPostsList = document.getElementById("user-posts-list");

let currentUser = null;
let viewedUser = null;

applyTheme(getInitialTheme());

await initUserPage();

async function initUserPage() {
  currentUser = await requireAuth();
  if (!currentUser) return;

  await injectShell();

  const params = new URLSearchParams(globalThis.location.search);
  const profileUserId = params.get("id") || currentUser.id;

  viewedUser = await db.users.findUnique({ where: { id: profileUserId } });
  if (!viewedUser) {
    showToast("User not found.", "danger");
    viewedUser = currentUser;
  }

  await renderPage();
}

async function renderPage() {
  renderProfileHeader();
  await renderProfileStats();
  await renderUserPosts();
}

function renderProfileHeader() {
  if (!viewedUser) return;

  const username = viewedUser.username || "Unknown user";
  const handle = viewedUser.username || "unknown";

  if (profileAvatar) {
    profileAvatar.src =
      viewedUser.profilePicture || "../assets/default-avatar.svg";
    profileAvatar.alt = `${username}'s avatar`;
  }

  if (profileName) profileName.textContent = username;
  if (profileHandle) profileHandle.textContent = `@${handle}`;
  if (profileBio) {
    profileBio.textContent =
      viewedUser.bio || "This user has not added a bio yet.";
  }

  if (!profileActionBtn || !currentUser) return;

  const isOwnProfile = viewedUser.id === currentUser.id;
  if (isOwnProfile) {
    profileActionBtn.className = "btn btn-outline";
    profileActionBtn.textContent = "Edit Profile";
    profileActionBtn.onclick = () => {
      goToSettings();
    };
    return;
  }

  profileActionBtn.className = "btn btn-follow";
  profileActionBtn.onclick = async () => {
    await toggleFollow();
  };
}

async function renderProfileStats() {
  if (!viewedUser) return;

  const [posts, followers, following] = await Promise.all([
    db.posts.findMany({ where: { authorId: viewedUser.id } }),
    db.follows.findMany({ where: { followingId: viewedUser.id } }),
    db.follows.findMany({ where: { followerId: viewedUser.id } }),
  ]);

  if (profilePostsCount) profilePostsCount.textContent = String(posts.length);
  if (profileFollowersCount) {
    profileFollowersCount.textContent = String(followers.length);
  }
  if (profileFollowingCount) {
    profileFollowingCount.textContent = String(following.length);
  }

  updateFollowButton(followers);
}

function updateFollowButton(followers) {
  if (!profileActionBtn || !currentUser || !viewedUser) return;
  if (viewedUser.id === currentUser.id) return;

  const isFollowing = followers.some(
    (follow) => follow.followerId === currentUser.id,
  );

  profileActionBtn.textContent = isFollowing ? "Following" : "Follow";
  profileActionBtn.classList.toggle("following", isFollowing);
}

async function toggleFollow() {
  if (!currentUser || !viewedUser) return;
  if (currentUser.id === viewedUser.id) return;

  const existingFollow = await db.follows.findUnique({
    where: {
      followerId: currentUser.id,
      followingId: viewedUser.id,
    },
  });

  if (existingFollow) {
    await db.follows.delete({ where: { id: existingFollow.id } });
    showToast(`Unfollowed @${viewedUser.username}`, "info");
  } else {
    await db.follows.create({
      data: {
        followerId: currentUser.id,
        followingId: viewedUser.id,
      },
    });
    showToast(`Now following @${viewedUser.username}`, "success");
  }

  await renderProfileStats();
}

async function renderUserPosts() {
  if (!userPostsList || !viewedUser) return;

  const posts = await db.posts.findMany({ where: { authorId: viewedUser.id } });
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (posts.length === 0) {
    userPostsList.innerHTML = `
			<article class="card">
				<p class="text-secondary">No posts yet.</p>
			</article>
		`;
    return;
  }

  userPostsList.innerHTML = posts
    .map(
      (post) => `
			<article class="card">
				<p>${escapeHtml(post.content || "")}</p>
				<small class="text-secondary">${formatTime(post.createdAt)}</small>
			</article>
		`,
    )
    .join("");
}

function formatTime(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString();
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
