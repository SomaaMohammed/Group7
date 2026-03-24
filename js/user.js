import { requireAuth } from "./global/auth.js";
import db from "./global/db.js";
import { injectShell } from "./global/shell.js";
import { escapeHtml, toSafeImageSrc } from "./global/sanitize.js";
import { goToPost } from "./global/router.js";
import { applyTheme, getInitialTheme } from "./global/theme.js";
import { flushQueuedToast, showToast } from "./global/toast.js";
import { setError, clearFieldError } from "./global/form.js";

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

  userPostsList.addEventListener("click", (e) => {
    const card = e.target.closest("[data-post-id]");
    if (card) {
      goToPost(card.dataset.postId);
    }
  });
}

function formatTime(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString();
}


function setupEditForm() {
  if (changeCancelButton) {

    changeCancelButton.addEventListener("click", closeEditForm); }

  if (changeSaveButton) {
    changeSaveButton.addEventListener("click", handleSave); }
    
}

function openEditForm() {

  if (changeUsernameInput !== null) {
    if (currentUser.username) {
      changeUsernameInput.value = currentUser.username;
    } else {
      changeUsernameInput.value = "";
    }
  }

  if (profileFormEdit === null || currentUser === null) {
    return;
  }


  if (avatarInputNew !== null) {
    if (currentUser.profilePicture) {
      avatarInputNew.value = currentUser.profilePicture;
    } else {
      avatarInputNew.value = "";
    }
  }

  if (bioInputNew !== null) {
    if (currentUser.bio) {
      bioInputNew.value = currentUser.bio;
    } else {
      bioInputNew.value = "";
    }
  }  

  clearFieldError(changeUsernameInput, changeUsernameHint);

  profileFormEdit.classList.remove("hidden");

  if (changeUsernameInput !== null) {

    changeUsernameInput.focus();

  }

}

function closeEditForm() {

  if (profileFormEdit === null) {
    return;
  }

  profileFormEdit.classList.add("hidden");

  if (bioInputNew !== null) {
    if (currentUser && currentUser.bio) {
      bioInputNew.value = currentUser.bio;
    } else {
      bioInputNew.value = "";
    }
  }


  if (avatarInputNew !== null) {
    if (currentUser && currentUser.profilePicture) {
      avatarInputNew.value = currentUser.profilePicture;
    } else {
      avatarInputNew.value = "";
    }
  }
  if (changeUsernameInput !== null) {
    if (currentUser && currentUser.username) {
      changeUsernameInput.value = currentUser.username;
    } else {
      changeUsernameInput.value = "";
    }
  }  

  clearFieldError(changeUsernameInput, changeUsernameHint);
}

async function handleSave() {

  if (currentUser === null) {
    return;
  }

  var changedUsername = "" ;
  var changedBIO = "" ;
  var changedAvatar = "" ;

  if (avatarInputNew !== null) {
    changedAvatar = avatarInputNew.value.trim();
  }

  if (bioInputNew !== null) {
    changedBIO = bioInputNew.value.trim();
  }  

  if (changeUsernameInput !== null) {
    changedUsername = changeUsernameInput.value.trim();
  }



  clearFieldError(changeUsernameInput, changeUsernameHint);

  if (changedUsername === "") {
    setError(changeUsernameInput, changeUsernameHint, "Cannot have an empty username");

    if (changeUsernameInput !== null) {
      changeUsernameInput.focus();

    }

    return;
  }

  if (changedUsername.length < 4 || changedUsername.length > 24) {
    setError(changeUsernameInput, changeUsernameHint,
      "The username has to be between 4 and 24 characters"
    );

    if (changeUsernameInput !== null) {
      changeUsernameInput.focus();
    }

    return;
  }

  if (changedUsername !== currentUser.username) {
    var existing = await db.users.findUnique({ where: { username: changedUsername } });

    if (existing !== null) {
      setError(changeUsernameInput, changeUsernameHint, "This username is taken already." );

      if (changeUsernameInput !== null) {
        changeUsernameInput.focus();
      }

      return;
    }
  }

  var updated = await db.users.update({
    where: { id: currentUser.id },
    data: { username: changedUsername, bio: changedBIO, profilePicture: changedAvatar === "" ? null : changedAvatar}, 
  });

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
