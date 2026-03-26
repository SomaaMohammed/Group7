import { requireAuth } from "./global/auth.js";
import db from "./global/db.js";
import { goToPost } from "./global/router.js";
import { injectShell } from "./global/shell.js";
import { escapeHtml } from "./global/sanitize.js";
import { resolveAvatarUrls, getAvatarSrc } from "./global/avatar.js";
import { storage } from "./global/storage.js";
import { applyTheme, getInitialTheme } from "./global/theme.js";
import { flushQueuedToast, showToast } from "./global/toast.js";
import { setError, clearFieldError } from "./global/form.js";
import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "./global/constants.js";
import { formatTime } from "./global/time.js";
import { resolveMedia, renderMediaGrid } from "./global/media.js";
import { openLightbox } from "./global/lightbox.js";

const profileAvatar = document.getElementById("profile-avatar");
const profileName = document.getElementById("profile-name");
const profileIdentityLink = document.getElementById("profile-identity-link");
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
const avatarFileInput = document.getElementById("edit-avatar-file");
const avatarPreview = document.getElementById("edit-avatar-preview");
const avatarRemoveBtn = document.getElementById("edit-avatar-remove");
const avatarHint = document.getElementById("avatar-hint");
const changeSaveButton = document.getElementById("edit-save-btn");
const changeCancelButton = document.getElementById("edit-cancel-btn");

let currentUser = null;
let viewedUser = null;
let pendingAvatarFile = null;
let removeAvatar = false;
let previewObjectUrl = null;

applyTheme(getInitialTheme());

await initUserPage();

async function initUserPage() {
  currentUser = await requireAuth();
  if (!currentUser) return;

  await injectShell();
  flushQueuedToast();

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

  if (userPostsList) {
    userPostsList.addEventListener("click", (e) => {
      // If clicking on a media grid item, open lightbox instead of navigating
      const gridItem = e.target.closest(".media-grid-item");
      if (gridItem) {
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
        return;
      }

      const card = e.target.closest("[data-post-id]");
      if (card) {
        goToPost(card.dataset.postId);
      }
    });
  }
}

async function renderPage() {
  await resolveAvatarUrls([viewedUser]);
  renderProfileHeader();
  await renderProfileStats();
  await renderUserPosts();
}

function renderProfileHeader() {
  if (!viewedUser) return;

  const username = viewedUser.username || "Unknown user";
  const handle = viewedUser.username || "unknown";

  if (profileAvatar) {
    profileAvatar.src = getAvatarSrc(
      viewedUser,
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

  if (viewedUser?.id) {
    const profileHref = `user.html?id=${encodeURIComponent(viewedUser.id)}`;
    if (profileIdentityLink) {
      profileIdentityLink.setAttribute("href", profileHref);
      profileIdentityLink.setAttribute("aria-label", `View @${handle}'s profile`);
    }
    if (profileName) {
      profileName.setAttribute("href", profileHref);
      profileName.setAttribute("aria-label", `View @${handle}'s profile`);
    }
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

  // Batch-fetch media, likes, and comments for all user posts
  const [allLikes, allComments] = await Promise.all([
    db.likes.findMany(),
    db.comments.findMany(),
  ]);

  const mediaMap = new Map();
  await Promise.all(
    posts.map(async (post) => {
      if (post.mediaIds?.length) {
        mediaMap.set(post.id, await resolveMedia(post.mediaIds));
      }
    }),
  );

  userPostsList.innerHTML = posts
    .map((post) => {
      const mediaItems = mediaMap.get(post.id) || [];
      const mediaHtml = mediaItems.length ? renderMediaGrid(mediaItems) : "";
      const likeCount = allLikes.filter((l) => l.postId === post.id).length;
      const commentCount = allComments.filter((c) => c.postId === post.id).length;
      return `
      <article class="card card-interactive user-post-card" data-post-id="${encodeURIComponent(post.id)}" aria-label="View post">
        <p>${escapeHtml(post.content || "")}</p>
        ${mediaHtml}
        <div class="flex gap-4 text-secondary text-sm post-card-stats">
          <span>${likeCount} like${likeCount === 1 ? "" : "s"}</span>
          <span>${commentCount} comment${commentCount === 1 ? "" : "s"}</span>
        </div>
        <small class="text-secondary">${formatTime(post.createdAt)}</small>
        <a
          class="user-post-link"
          href="post.html?id=${encodeURIComponent(post.id)}"
          aria-label="View post"
        ></a>
      </article>
    `;
    }).join("");
}


function setupEditForm() {
  if (changeCancelButton) {
    changeCancelButton.addEventListener("click", closeEditForm);
  }

  if (changeSaveButton) {
    changeSaveButton.addEventListener("click", handleSave);
  }

  if (avatarFileInput) {
    avatarFileInput.addEventListener("change", handleAvatarFileChange);
  }

  if (avatarRemoveBtn) {
    avatarRemoveBtn.addEventListener("click", handleAvatarRemove);
  }
}

function handleAvatarFileChange() {
  const file = avatarFileInput?.files?.[0];
  if (!file) return;

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    showToast("Please select a JPEG, PNG, GIF, or WebP image.", "info");
    avatarFileInput.value = "";
    return;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    showToast("Image must be under 5 MB.", "info");
    avatarFileInput.value = "";
    return;
  }

  pendingAvatarFile = file;
  removeAvatar = false;

  if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
  previewObjectUrl = URL.createObjectURL(file);
  if (avatarPreview) avatarPreview.src = previewObjectUrl;
}

function handleAvatarRemove() {
  pendingAvatarFile = null;
  removeAvatar = true;

  if (avatarFileInput) avatarFileInput.value = "";
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }
  if (avatarPreview) avatarPreview.src = "../assets/default-avatar.svg";
}

function openEditForm() {
  if (profileFormEdit === null || currentUser === null) {
    return;
  }

  if (changeUsernameInput) {
    changeUsernameInput.value = currentUser.username || "";
  }
  pendingAvatarFile = null;
  removeAvatar = false;
  if (avatarFileInput) avatarFileInput.value = "";
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }
  if (avatarPreview) {
    avatarPreview.src = getAvatarSrc(currentUser, "../assets/default-avatar.svg");
  }
  if (bioInputNew) {
    bioInputNew.value = currentUser.bio || "";
  }

  clearFieldError(changeUsernameInput, changeUsernameHint);

  profileFormEdit.classList.remove("hidden");
  if (changeUsernameInput) {
    changeUsernameInput.focus();
  }
}

function closeEditForm() {
  if (profileFormEdit === null) {
    return;
  }

  profileFormEdit.classList.add("hidden");

  if (bioInputNew) {
    bioInputNew.value = currentUser?.bio || "";
  }
  pendingAvatarFile = null;
  removeAvatar = false;
  if (avatarFileInput) avatarFileInput.value = "";
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }
  if (changeUsernameInput) {
    changeUsernameInput.value = currentUser?.username || "";
  }

  clearFieldError(changeUsernameInput, changeUsernameHint);
}

async function handleSave() {
  if (currentUser === null) {
    return;
  }

  const changedUsername = changeUsernameInput ? changeUsernameInput.value.trim() : "";
  const changedBio = bioInputNew ? bioInputNew.value.trim() : "";

  clearFieldError(changeUsernameInput, changeUsernameHint);

  const validation = validateProfileInput(changedUsername);
  if (!validation.ok) {
    handleValidationFailure(validation);
    return;
  }

  const usernameAvailable = await ensureUsernameAvailable(changedUsername);
  if (!usernameAvailable) {
    return;
  }

  // Build update data
  const updateData = {
    username: changedUsername,
    bio: changedBio,
  };

  const oldMediaId = currentUser.profilePicture || null;

  try {
    if (pendingAvatarFile) {
      updateData.profilePicture = await storage.upload(pendingAvatarFile);
    } else if (removeAvatar) {
      updateData.profilePicture = null;
    }
  } catch (err) {
    showToast(err.message || "Could not upload image. Please try again.", "danger");
    return;
  }

  let updated = null;
  try {
    updated = await db.users.update({
      where: { id: currentUser.id },
      data: updateData,
    });
  } catch {
    showToast("Could not save changes. Please try again.", "danger");
    return;
  }

  if (updated === null) {
    showToast("Could not save Changes.", "danger");
    return;
  }

  // Clean up old avatar blob if it was replaced or removed
  if (oldMediaId && (pendingAvatarFile || removeAvatar)) {
    await storage.delete(oldMediaId).catch(() => {});
  }

  currentUser = updated;
  viewedUser = updated;

  await resolveAvatarUrls([updated]);
  renderProfileHeader();
  updateShellUserIdentity(updated);
  await renderProfileStats();

  closeEditForm();

  showToast("Updated Profile Successfully!", "success");
}

function updateShellUserIdentity(user) {
  if (!user) return;

  const username = user.username || "user";
  const avatarSrc = getAvatarSrc(user, "../assets/default-avatar.svg");

  const shellAvatarImages = document.querySelectorAll(
    ".sidebar-user .avatar, .app-sidebar .avatar.avatar-sm",
  );
  shellAvatarImages.forEach((img) => {
    img.src = avatarSrc;
    img.alt = `${username}'s avatar`;
  });

  const sidebarName = document.querySelector(".sidebar-user-name");
  const sidebarHandle = document.querySelector(".sidebar-user-handle");
  if (sidebarName) sidebarName.textContent = username;
  if (sidebarHandle) sidebarHandle.textContent = `@${username}`;
}

function validateProfileInput(username) {
  if (!username) {
    return { ok: false, field: "username", message: "Cannot have an empty username" };
  }

  if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
    return {
      ok: false,
      field: "username",
      message: `The username has to be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters`,
    };
  }

  return { ok: true };
}

async function isDuplicateUsername(username) {
  if (!currentUser || username === currentUser.username) {
    return false;
  }

  const existing = await db.users.findUnique({ where: { username } });
  return existing !== null;
}

function handleValidationFailure(validation) {
  if (validation.field === "username") {
    setError(changeUsernameInput, changeUsernameHint, validation.message);
    if (changeUsernameInput) {
      changeUsernameInput.focus();
    }
    return;
  }

  showToast(validation.message, "info");
}

async function ensureUsernameAvailable(username) {
  const duplicate = await isDuplicateUsername(username);
  if (!duplicate) {
    return true;
  }

  setError(changeUsernameInput, changeUsernameHint, "This username is taken already.");
  if (changeUsernameInput) {
    changeUsernameInput.focus();
  }
  return false;
}
