/* Toolbar UI Controls & Command Mappings */

import { state } from "../core/state.js";
import { $, $$ } from "../utils/helpers.js";
import { format, setFontFamily, setFontSize, setTextColor, setBackgroundColor, setBlockFormat, clearFormatting } from "../editor/formatting.js";
import { getActiveFormats } from "../editor/selection.js";
import { openModal } from "./modals.js";
import { toggleFullscreen } from "../core/keyboard.js";

/**
 * Initializes formatting button click listeners, dropdown selections, and color swatches
 * @param {Object} actions Callbacks for actions (like link trigger or image upload)
 */
export function initToolbar(actions) {
  const { onInsertLink, onInsertTable, onInsertImage, onSearchReplace } = actions;

  // Formatting Buttons (simple actions)
  const buttonsMap = {
    "btn-bold": "bold",
    "btn-italic": "italic",
    "btn-underline": "underline",
    "btn-strike": "strikeThrough",
    "btn-align-left": "justifyLeft",
    "btn-align-center": "justifyCenter",
    "btn-align-right": "justifyRight",
    "btn-align-justify": "justifyFull",
    "btn-list-ul": "insertUnorderedList",
    "btn-list-ol": "insertOrderedList",
    "btn-indent": "indent",
    "btn-outdent": "outdent",
    "btn-subscript": "subscript",
    "btn-superscript": "superscript",
  };

  Object.entries(buttonsMap).forEach(([btnId, command]) => {
    const btn = $(`#${btnId}`);
    if (btn) {
      btn.addEventListener("click", () => {
        format(command);
        updateToolbarState();
      });
    }
  });

  // Block Formatting (H1, H2, H3, P, Blockquote, Code)
  const blockSelect = $("#block-format-select");
  if (blockSelect) {
    blockSelect.addEventListener("change", (e) => {
      setBlockFormat(e.target.value);
      updateToolbarState();
    });
  }

  // Font Family
  const fontSelect = $("#font-family-select");
  if (fontSelect) {
    fontSelect.addEventListener("change", (e) => {
      setFontFamily(e.target.value);
      updateToolbarState();
    });
  }

  // Font Size
  const sizeSelect = $("#font-size-select");
  if (sizeSelect) {
    sizeSelect.addEventListener("change", (e) => {
      setFontSize(e.target.value);
      updateToolbarState();
    });
  }

  // Clear Formatting
  const clearBtn = $("#btn-clear-format");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      clearFormatting();
      updateToolbarState();
    });
  }

  // Zoom Trigger Button Group
  const zoomSelect = $("#zoom-status-label");
  if (zoomSelect) {
    zoomSelect.parentElement.addEventListener("click", () => {
      // Zoom levels sequence rotation: 100% -> 125% -> 150% -> 50% -> 75% -> 100%
      const currentZoom = state.get("zoom");
      let nextZoom = 1.0;
      if (currentZoom === 1.0) nextZoom = 1.25;
      else if (currentZoom === 1.25) nextZoom = 1.5;
      else if (currentZoom === 1.5) nextZoom = 0.5;
      else if (currentZoom === 0.5) nextZoom = 0.75;
      else if (currentZoom === 0.75) nextZoom = 1.0;

      state.set("zoom", nextZoom);
    });
  }

  // Fullscreen trigger
  const fullscreenBtn = $("#btn-fullscreen");
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", () => toggleFullscreen());
  }

  // Color Pickers Setup
  setupColorPicker("text-color-picker-btn", "text-color-popover", (color) => {
    setTextColor(color);
    $(`#text-color-picker-btn .color-bar`).style.backgroundColor = color;
  });

  setupColorPicker("bg-color-picker-btn", "bg-color-popover", (color) => {
    setBackgroundColor(color);
    $(`#bg-color-picker-btn .color-bar`).style.backgroundColor = color;
  });

  // Modal Open Actions
  const linkBtn = $("#btn-link");
  if (linkBtn) linkBtn.addEventListener("click", () => onInsertLink());

  const tableBtn = $("#btn-table");
  if (tableBtn) tableBtn.addEventListener("click", () => onInsertTable());

  const imgBtn = $("#btn-image");
  if (imgBtn) imgBtn.addEventListener("click", () => onInsertImage());

  const searchBtn = $("#btn-search");
  if (searchBtn) searchBtn.addEventListener("click", () => onSearchReplace());
}

/**
 * Setup custom dropdown popovers for Text & Highlight Background color selection
 * @param {string} btnId 
 * @param {string} popoverId 
 * @param {Function} onSelectColor 
 */
function setupColorPicker(btnId, popoverId, onSelectColor) {
  const btn = $(`#${btnId}`);
  const popover = $(`#${popoverId}`);
  if (!btn || !popover) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    // Hide any other visible popovers first
    $$(".color-popover").forEach(p => {
      if (p !== popover) p.classList.remove("show");
    });
    popover.classList.toggle("show");
  });

  // Click handler on swatches
  popover.addEventListener("click", (e) => {
    const swatch = e.target.closest(".color-swatch");
    if (!swatch) return;

    const color = swatch.dataset.color;
    onSelectColor(color);
    popover.classList.remove("show");
  });

  // Click outside listener to hide popover
  document.addEventListener("click", () => {
    popover.classList.remove("show");
  });
}

/**
 * Scan caret range and update the active formatting states of buttons and dropdowns
 */
export function updateToolbarState() {
  const formats = getActiveFormats();

  // Simple active styling buttons toggles
  const buttonsCheck = {
    "btn-bold": formats.bold,
    "btn-italic": formats.italic,
    "btn-underline": formats.underline,
    "btn-strike": formats.strikeThrough,
    "btn-align-left": formats.justifyLeft,
    "btn-align-center": formats.justifyCenter,
    "btn-align-right": formats.justifyRight,
    "btn-align-justify": formats.justifyFull,
    "btn-list-ul": formats.insertUnorderedList,
    "btn-list-ol": formats.insertOrderedList,
  };

  Object.entries(buttonsCheck).forEach(([btnId, isActive]) => {
    const btn = $(`#${btnId}`);
    if (btn) {
      if (isActive) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
  });

  // Check and update Block Formatting dropdown selection
  const blockSelect = $("#block-format-select");
  if (blockSelect) {
    const parentBlock = document.queryCommandValue("formatBlock");
    const validBlocks = ["p", "h1", "h2", "h3", "blockquote", "pre"];
    if (validBlocks.includes(parentBlock)) {
      blockSelect.value = parentBlock;
    } else {
      blockSelect.value = "p"; // Default fallback
    }
  }

  // Update Font Name dropdown selection
  const fontSelect = $("#font-family-select");
  if (fontSelect) {
    const fontName = document.queryCommandValue("fontName").replace(/['"]/g, "");
    if (fontName) {
      fontSelect.value = fontName;
    }
  }
}
