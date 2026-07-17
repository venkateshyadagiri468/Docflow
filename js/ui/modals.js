/* Modal Controller */

import { $, $$ } from "../utils/helpers.js";
import { saveSelection, restoreSelection } from "../editor/selection.js";

/**
 * Initializes listeners for static modals, closing on backdrop clicks or close button clicks.
 */
export function initModals() {
  const backdrops = $$(".modal-backdrop");

  backdrops.forEach(backdrop => {
    // Close modal on backdrop click
    backdrop.addEventListener("mousedown", (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop.id);
      }
    });

    // Close modal on close buttons
    const closeBtn = backdrop.querySelector(".modal-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        closeModal(backdrop.id);
      });
    }

    // Cancel buttons inside modals
    const cancelBtn = backdrop.querySelector(".btn-secondary");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        closeModal(backdrop.id);
      });
    }
  });
}

/**
 * Opens a modal dialog by its backdrop ID
 * @param {string} backdropId 
 * @param {Function} [onOpen] Callback executed after modal opens
 */
export function openModal(backdropId, onOpen = null) {
  // Save cursor selection first so formatting actions apply correctly
  saveSelection();

  const backdrop = $(`#${backdropId}`);
  if (!backdrop) return;

  backdrop.classList.add("show");
  
  // Set focus to the first text input in the modal
  const firstInput = backdrop.querySelector("input[type='text'], input[type='number']");
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 150);
  }

  if (onOpen) onOpen(backdrop);
}

/**
 * Closes a modal dialog by its backdrop ID
 * @param {string} backdropId 
 */
export function closeModal(backdropId) {
  const backdrop = $(`#${backdropId}`);
  if (!backdrop) return;

  backdrop.classList.remove("show");
  
  // Restore editor cursor selection focus
  restoreSelection();
}
