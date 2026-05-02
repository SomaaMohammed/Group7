export function getString(formData, key) {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
}

export function isValidEmail(email) {
    if (typeof email !== "string") return false;
    const trimmed = email.trim();
    if (!trimmed || trimmed.length > 254) return false;
    if (hasWhitespace(trimmed)) return false;

    const atIndex = trimmed.indexOf("@");
    if (atIndex <= 0 || atIndex !== trimmed.lastIndexOf("@")) return false;
    if (atIndex === trimmed.length - 1) return false;

    const localPart = trimmed.slice(0, atIndex);
    const domain = trimmed.slice(atIndex + 1).toLowerCase();
    if (localPart.startsWith(".") || localPart.endsWith(".")) return false;
    if (domain.startsWith(".") || domain.endsWith(".")) return false;
    if (!domain.includes(".")) return false;

    const labels = domain.split(".");
    return labels.every(isValidDomainLabel);
}

function hasWhitespace(value) {
    for (const char of value) {
        if (char.trim() === "") return true;
    }
    return false;
}

function isValidDomainLabel(label) {
    if (!label || label.startsWith("-") || label.endsWith("-")) return false;

    for (const char of label) {
        const code = char.codePointAt(0) ?? 0;
        const isDigit = code >= 48 && code <= 57;
        const isLowerAlpha = code >= 97 && code <= 122;
        if (!isDigit && !isLowerAlpha && char !== "-") return false;
    }

    return true;
}

export function setError(inputEl, hintEl, message) {
    if (!inputEl || !hintEl) return;
    inputEl.classList.add("error");
    hintEl.classList.add("error");
    hintEl.textContent = message;
}

export function clearFieldError(inputEl, hintEl) {
    if (!inputEl || !hintEl) return;
    inputEl.classList.remove("error");
    hintEl.classList.remove("error");
    hintEl.textContent = "";
}

export function shakeForm(formEl) {
    if (!formEl) return;
    formEl.classList.remove("shake");
    formEl.getBoundingClientRect();
    formEl.classList.add("shake");
}
