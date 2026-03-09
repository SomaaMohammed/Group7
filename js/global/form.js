export function getString(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}
