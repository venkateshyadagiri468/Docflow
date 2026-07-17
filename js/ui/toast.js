/* Toast Notifications Component */

import { $ } from "../utils/helpers.js";

/**
 * Dispatches a toast notification in the bottom right corner of the window
 * @param {string} message 
 * @param {string} [type="info"] "success" | "error" | "info"
 * @param {number} [duration=3000] Milliseconds to show the toast
 */
export function showToast(message, type = "info", duration = 3000) {
  let container = $(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const iconText = type === "success" ? "✓" : type === "error" ? "⚠" : "ℹ";
  
  toast.innerHTML = `
    <span class="toast-icon">${iconText}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Force reflow for CSS scale and opacity transitions
  toast.offsetHeight;
  toast.classList.add("show");

  // Schedule removal
  setTimeout(() => {
    toast.classList.remove("show");
    
    // Wait for fadeout transition to complete before cleaning up element
    toast.addEventListener("transitionend", () => {
      toast.remove();
    });
  }, duration);
}
