import { requireAuth } from "./global/auth.js";
import db from "./global/db.js";
import { injectShell } from "./global/shell.js";
import { escapeHtml, toSafeImageSrc } from "./global/sanitize.js";
import { goToPost } from "./global/router.js";
import { applyTheme, getInitialTheme } from "./global/theme.js";
import { showToast } from "./global/toast.js";
import { setError, clearFieldError } from "./global/form.js";
import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
} from "./global/constants.js";
import { formatTime } from "./global/time.js";

const profileAvatar = document.getElementById("profile-avatar");
const profileName = document.getElementById("profile-name");
const profileHandle = document.getElementById("profile-handle");
const profileBio = document.getElementById("profile-bio");
const profileActionBtn = document.getElementById("profile-action-btn");

const profilePostsCount = document.getElementById("profile-posts-count");
const profileFollowersCount = document.getElementById("profile-followers-count");
const profileFollowingCount = document.getElementById("profile-following-count");
const userPostsList = document.getElementById("user-posts-list");


const profileFormEdit = document.getElementById("edit-profile-form");
const changeUsernameInput = document.getElementById("edit-username");
const changeUsernameHint = document.getElementById("edit-username-hint");
const bioInputNew = document.getElementById("edit-bio");
const avatarInputNew = document.getElementById("edit-avatar-url");
const changeSaveButton = document.getElementById("edit-save-btn");
const changeCancelButton = document.getElementById("edit-cancel-btn");

let currentUser = null;
let viewedUser = null;
let postsClickBound = false;

applyTheme(getInitialTheme());

await initUserPage();

async function initUserPage() {
  currentUser = await requireAuth();
  if (!currentUser) return;

  await injectShell();

  const params = new URLSearchParams(globalThis.location.search);
  const requestedProfileId = params.get("id");
  const profileUserId = requestedProfileId?.trim() || currentUser.id;

  viewedUser = await db.users.findUnique({ where: { id: profileUserId } });
  if (!viewedUser) {
    showToast("User not found.", "danger");
    viewedUser = currentUser;
  }

  await renderPage();
  setupEditForm();
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
    profileAvatar.src = toSafeImageSrc(
      viewedUser.profilePicture,
      "../assets/default-avatar.svg",
    );
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
    profileActionBtn.onclick = () => openEditForm();
    return;
  }

  if (profileFormEdit) profileFormEdit.classList.add("hidden");

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
      <article class="card card-interactive" data-post-id="${escapeHtml(post.id)}">

        <p>${escapeHtml(post.content || "")}</p>

        <small class="text-secondary">${formatTime(post.createdAt)}</small>

      </article>
    `,
    ).join("");

  if (!postsClickBound) {
    userPostsList.addEventListener("click", (e) => {
      const card = e.target.closest("[data-post-id]");
      if (card) {
        goToPost(card.dataset.postId);
      }
    });
    postsClickBound = true;
  }
}


function setupEditForm() {
  if (changeCancelButton) {
    changeCancelButton.addEventListener("click", closeEditForm);
  }

  if (changeSaveButton) {
    changeSaveButton.addEventListener("click", handleSave);
  }
}

function openEditForm() {
  if (profileFormEdit === null || currentUser === null) {
    return;
  }

  setInputValue(changeUsernameInput, currentUser.username);
  setInputValue(avatarInputNew, currentUser.profilePicture);
  setInputValue(bioInputNew, currentUser.bio);

  clearFieldError(changeUsernameInput, changeUsernameHint);

  profileFormEdit.classList.remove("hidden");
  focusInput(changeUsernameInput);
}

function closeEditForm() {
  if (profileFormEdit === null) {
    return;
  }

  profileFormEdit.classList.add("hidden");

  setInputValue(bioInputNew, currentUser?.bio);
  setInputValue(avatarInputNew, currentUser?.profilePicture);
  setInputValue(changeUsernameInput, currentUser?.username);

  clearFieldError(changeUsernameInput, changeUsernameHint);
}

async function handleSave() {
  if (currentUser === null) {
    return;
  }

  const changedUsername = getTrimmedInputValue(changeUsernameInput);
  const changedBio = getTrimmedInputValue(bioInputNew);
  const changedAvatar = getTrimmedInputValue(avatarInputNew);

  clearFieldError(changeUsernameInput, changeUsernameHint);

  if (!changedUsername) {
    setError(changeUsernameInput, changeUsernameHint, "Cannot have an empty username");
    focusInput(changeUsernameInput);
    return;
  }

  if (!isValidUsernameLength(changedUsername)) {
    setError(changeUsernameInput, changeUsernameHint,
      `The username has to be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters`
    );
    focusInput(changeUsernameInput);
    return;
  }

  if (changedAvatar !== "" && !isValidAvatarUrl(changedAvatar)) {
    showToast("Please enter a valid avatar URL (http or https).", "info");
    focusInput(avatarInputNew);
    return;
  }

  if (changedUsername !== currentUser.username && await isUsernameTaken(changedUsername)) {
    setError(changeUsernameInput, changeUsernameHint, "This username is taken already.");
    focusInput(changeUsernameInput);
    return;
  }

  let updated = null;
  try {
    updated = await db.users.update({
      where: { id: currentUser.id },
      data: {
        username: changedUsername,
        bio: changedBio,
        profilePicture: changedAvatar === "" ? null : changedAvatar,
      },
    });
  } catch {
    showToast("Could not save changes. Please try again.", "danger");
    return;
  }

  if (updated === null) {
    showToast("Could not save Changes.", "danger");
    return;
  }

  currentUser = updated;
  viewedUser = updated;

  renderProfileHeader();
  await renderProfileStats();

  closeEditForm();

  showToast("Updated Profile Successfully!", "success");
}

function isValidAvatarUrl(value) {
  try {
    const parsed = new URL(value, globalThis.location?.href || "http://localhost/");
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function setInputValue(input, value) {
  if (input) {
    input.value = value || "";
  }
}

function getTrimmedInputValue(input) {
  return input ? input.value.trim() : "";
}

function focusInput(input) {
  if (input) {
    input.focus();
  }
}

function isValidUsernameLength(username) {
  return (
    username.length >= USERNAME_MIN_LENGTH &&
    username.length <= USERNAME_MAX_LENGTH
  );
}

async function isUsernameTaken(username) {
  const existing = await db.users.findUnique({ where: { username } });
  return existing !== null;
}
