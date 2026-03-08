import { login as createSession } from "./global/auth.js";
import db from "./global/db.js";
import { goToHome } from "./global/router.js";
import { setupThemeToggle } from "./global/theme.js";

const form = document.getElementById("login-form");
const themeToggleButton = document.getElementById("theme-toggle");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const emailHint = document.getElementById("email-hint");
const passwordHint = document.getElementById("password-hint");

setupThemeToggle({
  button: themeToggleButton,
  onThemeChanged: updateThemeToggleLabel,
});

if (form) {
  form.addEventListener("submit", handleLoginSubmit);
}

globalThis.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    resetLoginForm();
  }
});

async function handleLoginSubmit(event) {
  event.preventDefault();
  clearErrors();

  const formData = new FormData(form);
  const payload = {
    email: getString(formData, "email").trim().toLowerCase(),
    password: getString(formData, "password"),
  };

  const validationErrors = validatePayload(payload);
  if (validationErrors.length > 0) {
    applyValidationErrors(validationErrors);
    shakeForm();
    return;
  }

  const users = await db.users.findMany();
  const matchedUser = users.find(
    (user) =>
      String(user.email || "").toLowerCase() === payload.email &&
      user.password === payload.password,
  );

  if (!matchedUser) {
    setError(emailInput, emailHint, "Invalid email or password.");
    setError(passwordInput, passwordHint, "Invalid email or password.");
    shakeForm();
    return;
  }

  createSession(matchedUser.id);
  goToHome();
}

function getString(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function validatePayload(payload) {
  const errors = [];

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
  }

  return errors;
}

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function applyValidationErrors(errors) {
  errors.forEach((error) => {
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
  clearFieldError(emailInput, emailHint);
  clearFieldError(passwordInput, passwordHint);
}

function clearFieldError(inputElement, hintElement) {
  if (!inputElement || !hintElement) return;
  inputElement.classList.remove("error");
  hintElement.classList.remove("error");
  hintElement.textContent = "";
}

function shakeForm() {
  if (!form) return;
  form.classList.remove("shake");
  form.getBoundingClientRect();
  form.classList.add("shake");
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

function resetLoginForm() {
  if (!form) return;
  form.reset();
  clearErrors();
}
