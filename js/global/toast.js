// js/global/toast.js
// Displays a temporary toast notification.
// Relies on .toast-container already present in the page HTML and
// .toast / .toast-success / .toast-danger / .toast-info styles in global.css.
//
// Usage:
//   showToast('Saved!', 'success')
//   showToast('Something went wrong.', 'danger')
//   showToast('Did you know…', 'info')

export function showToast(message, type = "info") {
  const container = document.querySelector(".toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // After 2700 ms trigger the exit animation, then remove the element.
  setTimeout(() => {
    toast.style.animation = "toast-out 300ms ease forwards";
    toast.addEventListener("animationend", () => toast.remove(), {
      once: true,
    });
  }, 2700);
}
