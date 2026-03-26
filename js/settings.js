import { requireAuth, getCurrentUser, logout } from "./global/auth.js";
import db from "./global/db.js";
import { storage } from "./global/storage.js";
import { injectShell } from "./global/shell.js";
import { applyTheme, getInitialTheme, setupThemeToggle } from "./global/theme.js";
import { flushQueuedToast, showToast } from "./global/toast.js";
import { setError, clearFieldError } from "./global/form.js";
import { PASSWORD_MIN_LENGTH } from "./global/constants.js";

applyTheme(getInitialTheme());

const currentUser = await requireAuth();
await injectShell();
flushQueuedToast();

// --- Theme & Logout (existing) ---

const logoutBtn = document.getElementById("logout-btn");
const toggleButton = document.getElementById("settings-theme-toggle");
const textLabel = document.getElementById("theme-toggle-label");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    logout();
  });
}

if (toggleButton && textLabel) {
  setupThemeToggle({
    button: toggleButton,
    onThemeChanged: (newTheme) => {
      textLabel.textContent = newTheme === "dark" ? "Dark mode" : "Light mode";
    },
  });
}

// --- Change Password ---

const changePasswordToggleBtn = document.getElementById("change-password-toggle-btn");
const changePasswordForm = document.getElementById("change-password-form");
const currentPasswordInput = document.getElementById("current-password");
const currentPasswordHint = document.getElementById("current-password-hint");
const newPasswordInput = document.getElementById("new-password");
const newPasswordHint = document.getElementById("new-password-hint");
const confirmNewPasswordInput = document.getElementById("confirm-new-password");
const confirmNewPasswordHint = document.getElementById("confirm-new-password-hint");
const changePasswordCancelBtn = document.getElementById("change-password-cancel-btn");

if (changePasswordToggleBtn) {
  changePasswordToggleBtn.addEventListener("click", () => {
    changePasswordForm?.classList.toggle("hidden");
    clearPasswordErrors();
  });
}

if (changePasswordCancelBtn) {
  changePasswordCancelBtn.addEventListener("click", () => {
    changePasswordForm?.classList.add("hidden");
    clearPasswordErrors();
  });
}

if (changePasswordForm) {
  changePasswordForm.addEventListener("submit", handleChangePassword);
}

async function handleChangePassword(event) {
  event.preventDefault();
  clearPasswordErrors();

  const currentPassword = currentPasswordInput?.value || "";
  const newPassword = newPasswordInput?.value || "";
  const confirmNewPassword = confirmNewPasswordInput?.value || "";

  const freshUser = await getCurrentUser();
  if (!freshUser || freshUser.password !== currentPassword) {
    setError(currentPasswordInput, currentPasswordHint, "Current password is incorrect.");
    return;
  }

  if (!isStrongPassword(newPassword)) {
    setError(newPasswordInput, newPasswordHint, "Password must be 8+ chars and include letters and numbers.");
    return;
  }

  if (newPassword !== confirmNewPassword) {
    setError(confirmNewPasswordInput, confirmNewPasswordHint, "Passwords do not match.");
    return;
  }

  if (currentPassword === newPassword) {
    setError(newPasswordInput, newPasswordHint, "New password must be different from current password.");
    return;
  }

  await db.users.update({
    where: { id: freshUser.id },
    data: { password: newPassword },
  });

  changePasswordForm.classList.add("hidden");
  if (currentPasswordInput) currentPasswordInput.value = "";
  if (newPasswordInput) newPasswordInput.value = "";
  if (confirmNewPasswordInput) confirmNewPasswordInput.value = "";

  showToast("Password changed successfully!", "success");
}

function clearPasswordErrors() {
  clearFieldError(currentPasswordInput, currentPasswordHint);
  clearFieldError(newPasswordInput, newPasswordHint);
  clearFieldError(confirmNewPasswordInput, confirmNewPasswordHint);
}

// Same check as register.js — intentionally duplicated (see register.js:161)
function isStrongPassword(password) {
  const hasMinLength = password.length >= PASSWORD_MIN_LENGTH;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasMinLength && hasLetter && hasNumber;
}

// --- Delete Account ---

const deleteAccountToggleBtn = document.getElementById("delete-account-toggle-btn");
const deleteAccountConfirm = document.getElementById("delete-account-confirm");
const deleteConfirmPasswordInput = document.getElementById("delete-confirm-password");
const deleteConfirmPasswordHint = document.getElementById("delete-confirm-password-hint");
const deleteAccountConfirmBtn = document.getElementById("delete-account-confirm-btn");
const deleteAccountCancelBtn = document.getElementById("delete-account-cancel-btn");

if (deleteAccountToggleBtn) {
  deleteAccountToggleBtn.addEventListener("click", () => {
    deleteAccountConfirm?.classList.toggle("hidden");
    clearFieldError(deleteConfirmPasswordInput, deleteConfirmPasswordHint);
  });
}

if (deleteAccountCancelBtn) {
  deleteAccountCancelBtn.addEventListener("click", () => {
    deleteAccountConfirm?.classList.add("hidden");
    clearFieldError(deleteConfirmPasswordInput, deleteConfirmPasswordHint);
  });
}

if (deleteAccountConfirmBtn) {
  deleteAccountConfirmBtn.addEventListener("click", handleDeleteAccount);
}

async function handleDeleteAccount() {
  clearFieldError(deleteConfirmPasswordInput, deleteConfirmPasswordHint);

  const password = deleteConfirmPasswordInput?.value || "";

  const freshUser = await getCurrentUser();
  if (!freshUser || freshUser.password !== password) {
    setError(deleteConfirmPasswordInput, deleteConfirmPasswordHint, "Incorrect password.");
    return;
  }

  deleteAccountConfirmBtn.disabled = true;

  const userId = freshUser.id;

  // 1. Delete media, comments, and likes for each of the user's posts
  const userPosts = await db.posts.findMany({ where: { authorId: userId } });
  for (const post of userPosts) {
    if (post.mediaIds?.length) {
      await storage.deleteMany(post.mediaIds);
    }
    await db.comments.deleteMany({ where: { postId: post.id } });
    await db.likes.deleteMany({ where: { postId: post.id } });
  }

  // 2. Delete all user's posts
  await db.posts.deleteMany({ where: { authorId: userId } });

  // 3. Delete user's comments on other users' posts
  await db.comments.deleteMany({ where: { authorId: userId } });

  // 4. Delete user's likes on other posts
  await db.likes.deleteMany({ where: { userId: userId } });

  // 5. Delete all follows (both directions)
  await db.follows.deleteMany({ where: { followerId: userId } });
  await db.follows.deleteMany({ where: { followingId: userId } });

  // 6. Delete profile picture blob
  if (freshUser.profilePicture) {
    await storage.delete(freshUser.profilePicture).catch(() => {});
  }

  // 7. Delete the user record
  await db.users.delete({ where: { id: userId } });

  // 8. Clear session and redirect
  logout();
}
