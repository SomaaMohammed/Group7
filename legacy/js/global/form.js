export function getString(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!trimmed || trimmed.length > 254) return false;
  if (trimmed.startsWith(".") || trimmed.endsWith(".")) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
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
