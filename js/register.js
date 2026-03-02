import db from "./global/db.js";
import { goToLogin } from "./global/router.js";
import { setupThemeToggle } from "./global/theme.js";

const form = document.getElementById("register-form");
const themeToggleButton = document.getElementById("theme-toggle");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const usernameHint = document.getElementById("username-hint");
const emailHint = document.getElementById("email-hint");
const passwordHint = document.getElementById("password-hint");

setupThemeToggle({
  button: themeToggleButton,
  onThemeChanged: updateThemeToggleLabel,
});

if (form) {
  form.addEventListener("submit", handleRegisterSubmit);
}

if (themeToggleButton) {
  themeToggleButton.addEventListener("click", handleThemeToggle);
}

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
    form.classList.remove("shake");
    form.getBoundingClientRect();
    form.classList.add("shake");
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
    form.classList.remove("shake");
    form.getBoundingClientRect();
    form.classList.add("shake");
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

function getString(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function validatePayload(payload) {
  const errors = [];

  if (!payload.username) {
    errors.push({ field: "username", message: "Username is required." });
  } else if (payload.username.length < 3) {
    errors.push({
      field: "username",
      message: "Username must be at least 3 characters.",
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

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
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

function setError(inputElement, hintElement, message) {
  if (!inputElement || !hintElement) return;
  inputElement.classList.add("error");
  hintElement.classList.add("error");
  hintElement.textContent = message;
}

function clearErrors() {
  clearFieldError(usernameInput, usernameHint);
  clearFieldError(emailInput, emailHint);
  clearFieldError(passwordInput, passwordHint);
}

function clearFieldError(inputElement, hintElement) {
  if (!inputElement || !hintElement) return;
  inputElement.classList.remove("error");
  hintElement.classList.remove("error");
  hintElement.textContent = "";
}

function updateThemeToggleLabel(activeTheme) {
  if (!themeToggleButton) return;

  const targetTheme = activeTheme === "dark" ? "Light" : "Dark";
  themeToggleButton.textContent = `Switch to ${targetTheme}`;
  themeToggleButton.setAttribute(
    "aria-label",
    `Switch to ${targetTheme} theme`,
  );
}
