/* Global Keyboard Shortcut Handlers */

import { state } from "./state.js";
import { saveActiveDocument } from "./autosave.js";
import { format } from "../editor/formatting.js";
import { showToast } from "../ui/toast.js";

/**
 * Initializes global keyboard listeners for shortcut bindings
 * @param {HTMLElement} editorEl 
 * @param {Function} onUndo 
 * @param {Function} onRedo 
 */
export function initKeyboard(editorEl, onUndo, onRedo) {
  window.addEventListener("keydown", (e) => {
    const isMod = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;

    // Ctrl + S (Save)
    if (isMod && e.code === "KeyS") {
      e.preventDefault();
      saveActiveDocument().then(() => {
        showToast("Document saved successfully", "success");
      });
      return;
    }

    // Ctrl + Z (Undo)
    if (isMod && !isShift && e.code === "KeyZ") {
      if (document.activeElement === editorEl) {
        e.preventDefault();
        onUndo();
      }
      return;
    }

    // Ctrl + Shift + Z or Ctrl + Y (Redo)
    if ((isMod && isShift && e.code === "KeyZ") || (isMod && e.code === "KeyY")) {
      if (document.activeElement === editorEl) {
        e.preventDefault();
        onRedo();
      }
      return;
    }

    // Ctrl + P (Print)
    if (isMod && e.code === "KeyP") {
      e.preventDefault();
      window.print();
      return;
    }

    // Fullscreen Mode (F11 equivalent)
    if (e.code === "F11") {
      e.preventDefault();
      toggleFullscreen();
      return;
    }
  });
}

/**
 * Toggles browser fullscreen mode using HTML5 Fullscreen API
 */
export function toggleFullscreen() {
  const isCurrentlyFullscreen = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );

  if (!isCurrentlyFullscreen) {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen();
    } else if (docEl.mozRequestFullScreen) { // Firefox
      docEl.mozRequestFullScreen();
    } else if (docEl.webkitRequestFullscreen) { // Chrome, Safari and Opera
      docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) { // IE/Edge
      docEl.msRequestFullscreen();
    }
    state.set("fullscreen", true);
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    state.set("fullscreen", false);
  }
}
