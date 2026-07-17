/* Image Insertion, Drag and Drop, and Resizing Handles */

import { insertHTMLAtCaret } from "./clipboard.js";

/**
 * Inserts an image wrapped in a resize wrapper
 * @param {string} base64Data 
 */
export function insertImage(base64Data) {
  const imageHTML = `
    <span class="image-wrapper" contenteditable="false">
      <img src="${base64Data}" alt="Uploaded Image">
      <span class="image-resize-handle tl" data-handle="tl"></span>
      <span class="image-resize-handle tr" data-handle="tr"></span>
      <span class="image-resize-handle bl" data-handle="bl"></span>
      <span class="image-resize-handle br" data-handle="br"></span>
    </span>
  `;
  insertHTMLAtCaret(imageHTML);
}

/**
 * Initializes image click, selection, resize, and drag-and-drop listeners
 * @param {HTMLElement} editorEl 
 * @param {Function} onChangeCallback Triggered when image dimensions change
 */
export function initImages(editorEl, onChangeCallback) {
  let activeWrapper = null;
  let isResizing = false;
  let startX, startY, startWidth, startHeight, activeHandle;

  // Handle Drag & Drop
  editorEl.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  editorEl.addEventListener("drop", (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          insertImage(event.target.result);
          if (onChangeCallback) onChangeCallback();
        };
        reader.readAsDataURL(file);
      }
    }
  });

  // Handle selection and resize clicks
  editorEl.addEventListener("mousedown", (e) => {
    // If clicking a resize handle
    if (e.target.classList.contains("image-resize-handle")) {
      e.preventDefault();
      isResizing = true;
      activeHandle = e.target.dataset.handle;
      activeWrapper = e.target.closest(".image-wrapper");
      
      const img = activeWrapper.querySelector("img");
      startX = e.clientX;
      startY = e.clientY;
      startWidth = img.clientWidth;
      startHeight = img.clientHeight;

      document.addEventListener("mousemove", handleResize);
      document.addEventListener("mouseup", stopResize);
      return;
    }

    // If clicking an image wrapper itself
    const clickedWrapper = e.target.closest(".image-wrapper");
    if (clickedWrapper) {
      if (activeWrapper && activeWrapper !== clickedWrapper) {
        activeWrapper.classList.remove("selected");
      }
      activeWrapper = clickedWrapper;
      activeWrapper.classList.add("selected");
    } else {
      // Clicked outside any image
      deselectImage();
    }
  });

  // Global click outside to deselect
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".image-wrapper") && !e.target.closest(".toolbar-container")) {
      deselectImage();
    }
  });

  function deselectImage() {
    if (activeWrapper) {
      activeWrapper.classList.remove("selected");
      activeWrapper = null;
    }
  }

  function handleResize(e) {
    if (!isResizing || !activeWrapper) return;
    const img = activeWrapper.querySelector("img");

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newWidth = startWidth;
    let newHeight = startHeight;
    const aspectRatio = startWidth / startHeight;

    // Resizing math based on handle dragged
    if (activeHandle === "br" || activeHandle === "tr") {
      newWidth = startWidth + dx;
    } else if (activeHandle === "bl" || activeHandle === "tl") {
      newWidth = startWidth - dx;
    }

    // Adjust height while locking aspect ratio
    newHeight = newWidth / aspectRatio;

    // Restrict size limits
    if (newWidth > 50 && newWidth < editorEl.clientWidth) {
      img.style.width = `${newWidth}px`;
      img.style.height = `${newHeight}px`;
    }
  }

  function stopResize() {
    isResizing = false;
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
    if (onChangeCallback) onChangeCallback();
  }
}
