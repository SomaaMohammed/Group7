import { login as createSession } from "./global/auth.js";
import db from "./global/db.js";
import {
    clearFieldError,
    getString,
    isValidEmail,
    setError,
    shakeForm,
} from "./global/form.js";
import { goToHome } from "./global/router.js";
import { setupThemeToggle } from "./global/theme.js";

const form = document.getElementById("login-form");
const themeToggleButton = document.getElementById("theme-toggle");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const showPasswordButton = document.getElementById("show-password");
const hiddenPasswordType = passwordInput?.getAttribute("type") || "password";

const emailHint = document.getElementById("email-hint");
const passwordHint = document.getElementById("password-hint");

setupThemeToggle({
    button: themeToggleButton,
});

if (form) {
    form.addEventListener("submit", handleLoginSubmit);
}

if (showPasswordButton && passwordInput) {
    showPasswordButton.addEventListener(
        "click",
        handleTogglePasswordVisibility,
    );
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
        shakeForm(form);
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
        shakeForm(form);
        return;
    }

    createSession(matchedUser.id);
    goToHome();
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

function clearErrors() {
    clearFieldError(emailInput, emailHint);
    clearFieldError(passwordInput, passwordHint);
}

function resetLoginForm() {
    if (!form) return;
    form.reset();
    if (passwordInput) {
        passwordInput.type = hiddenPasswordType;
    }
    updatePasswordVisibilityButton(false);
    clearErrors();
}

function handleTogglePasswordVisibility() {
    if (!passwordInput) return;
    const showPassword = passwordInput.type === hiddenPasswordType;
    passwordInput.type = showPassword ? "text" : hiddenPasswordType;
    updatePasswordVisibilityButton(showPassword);
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
