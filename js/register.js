import db from "./global/db.js";
import {
  clearFieldError,
  getString,
  isValidEmail,
  setError,
  shakeForm,
} from "./global/form.js";
import { goToLogin } from "./global/router.js";
import { setupThemeToggle } from "./global/theme.js";

const form = document.getElementById("register-form");
const themeToggleButton = document.getElementById("theme-toggle");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const showPasswordButton = document.getElementById("show-password");
const hiddenPasswordType = passwordInput?.getAttribute("type") || "password";

const usernameHint = document.getElementById("username-hint");
const emailHint = document.getElementById("email-hint");
const passwordHint = document.getElementById("password-hint");

setupThemeToggle({
  button: themeToggleButton,
});

if (form) {
  form.addEventListener("submit", handleRegisterSubmit);
}

if (showPasswordButton && passwordInput) {
  showPasswordButton.addEventListener("click", handleTogglePasswordVisibility);
}

globalThis.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    resetRegisterForm();
  }
});

async function handleRegisterSubmit(event) {
  event.preventDefault();
  clearErrors();

  const formData = new FormData(form);

  const payload = {
    username: getString(formData, "username").trim(),
    email: getString(formData, "email").trim().toLowerCase(),
    password: getString(formData, "password"),
  };

  const validationErrors = validatePayload(payload);
  if (validationErrors.length > 0) {
    applyValidationErrors(validationErrors);
    shakeForm(form);
    return;
  }

  const users = await db.users.findMany();
  const usernameTaken = users.some(
    (user) =>
      String(user.username || "").toLowerCase() ===
      payload.username.toLowerCase(),
  );
  const emailTaken = users.some(
    (user) =>
      String(user.email || "").toLowerCase() === payload.email.toLowerCase(),
  );

  if (usernameTaken || emailTaken) {
    if (usernameTaken) {
      setError(usernameInput, usernameHint, "Username is already taken.");
    }
    if (emailTaken) {
      setError(
        emailInput,
        emailHint,
        "An account with this email already exists.",
      );
    }
    shakeForm(form);
    return;
  }

  await db.users.create({
    data: {
      username: payload.username,
      email: payload.email,
      password: payload.password,
      bio: "",
      profilePicture: "",
    },
  });

  goToLogin();
}

function validatePayload(payload) {
  const errors = [];
  const minUsernameLength = 4;
  const maxUsernameLength = 24;

  if (!payload.username) {
    errors.push({ field: "username", message: "Username is required." });
  } else if (payload.username.length < minUsernameLength) {
    errors.push({
      field: "username",
      message: `Username must be at least ${minUsernameLength} characters.`,
    });
  } else if (payload.username.length > maxUsernameLength) {
    errors.push({
      field: "username",
      message: `Username must be at most ${maxUsernameLength} characters.`,
    });
  }

  if (!payload.email) {
    errors.push({ field: "email", message: "Email is required." });
  } else if (!isValidEmail(payload.email)) {
    errors.push({
      field: "email",
      message: "Please enter a valid email address.",
    });
  }

  if (!payload.password) {
    errors.push({ field: "password", message: "Password is required." });
  } else if (!isStrongPassword(payload.password)) {
    errors.push({
      field: "password",
      message: "Password must be 8+ chars and include letters and numbers.",
    });
  }

  return errors;
}

function isStrongPassword(password) {
  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasMinLength && hasLetter && hasNumber;
}

function applyValidationErrors(errors) {
  errors.forEach((error) => {
    if (error.field === "username") {
      setError(usernameInput, usernameHint, error.message);
    }
    if (error.field === "email") {
      setError(emailInput, emailHint, error.message);
    }
    if (error.field === "password") {
      setError(passwordInput, passwordHint, error.message);
    }
  });
}

function clearErrors() {
  clearFieldError(usernameInput, usernameHint);
  clearFieldError(emailInput, emailHint);
  clearFieldError(passwordInput, passwordHint);
}

function handleTogglePasswordVisibility() {
  if (!passwordInput) return;
  const showPassword = passwordInput.type === hiddenPasswordType;
  passwordInput.type = showPassword ? "text" : hiddenPasswordType;
  updatePasswordVisibilityButton(showPassword);
}

function resetRegisterForm() {
  if (!form) return;
  form.reset();
  if (passwordInput) {
    passwordInput.type = hiddenPasswordType;
  }
  updatePasswordVisibilityButton(false);
  clearErrors();
}

function updatePasswordVisibilityButton(showPassword) {
  if (!showPasswordButton) return;

  showPasswordButton.setAttribute("aria-pressed", String(showPassword));
  showPasswordButton.setAttribute(
    "aria-label",
    showPassword ? "Hide password" : "Show password",
  );

  const label = showPasswordButton.querySelector(".password-toggle-label");
  if (label) {
    label.textContent = showPassword ? "Hide" : "Show";
  }
}
