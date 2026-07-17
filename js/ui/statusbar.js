/* Status Bar UI Component */

import { state } from "../core/state.js";
import { $ } from "../utils/helpers.js";

/**
 * Initializes listeners for status bar actions (like zoom dropdown or theme displays)
 */
export function initStatusbar() {
  // Sync Zoom level displays
  state.subscribe("zoom", (zoomFactor) => {
    const zoomLabel = $("#zoom-status-label");
    if (zoomLabel) {
      zoomLabel.textContent = `${Math.round(zoomFactor * 100)}%`;
    }
  });

  // Sync Theme displays
  state.subscribe("theme", (themeName) => {
    const themeLabel = $("#theme-status-label");
    if (themeLabel) {
      themeLabel.textContent = themeName.charAt(0).toUpperCase() + themeName.slice(1);
    }
  });
}

/**
 * Updates status bar statistics based on current editor text
 * @param {string} text Plain text content of the editor
 */
export function updateStats(text) {
  const charCount = text.length;
  
  // Filter out punctuation and empty strings for word counts
  const cleanText = text.trim();
  const wordCount = cleanText === "" ? 0 : cleanText.split(/\s+/).length;
  
  // Estimate paragraphs by splitting double line feeds
  const paragraphCount = cleanText === "" ? 0 : cleanText.split(/\n\s*\n/).length;
  
  // Avg adult reads 200 words per minute
  const readingTime = Math.ceil(wordCount / 200);

  // Update DOM elements
  const wordsEl = $("#words-count-val");
  const charsEl = $("#chars-count-val");
  const paragraphsEl = $("#paragraphs-count-val");
  const readTimeEl = $("#read-time-val");

  if (wordsEl) wordsEl.textContent = wordCount;
  if (charsEl) charsEl.textContent = charCount;
  if (paragraphsEl) paragraphsEl.textContent = paragraphCount;
  if (readTimeEl) readTimeEl.textContent = `${readingTime} min`;

  // Update in-editor outline statistics if available
  const sidebarWordsEl = $("#sidebar-words-val");
  const sidebarCharsEl = $("#sidebar-chars-val");
  const sidebarParagraphsEl = $("#sidebar-paragraphs-val");
  const sidebarTimeEl = $("#sidebar-readtime-val");

  if (sidebarWordsEl) sidebarWordsEl.textContent = wordCount;
  if (sidebarCharsEl) sidebarCharsEl.textContent = charCount;
  if (sidebarParagraphsEl) sidebarParagraphsEl.textContent = paragraphCount;
  if (sidebarTimeEl) sidebarTimeEl.textContent = `${readingTime} min read`;
}

/**
 * Updates status bar cursor coordinates
 * @param {number} line 
 * @param {number} col 
 */
export function updateCursorPos(line, col) {
  const posEl = $("#cursor-position-val");
  if (posEl) {
    posEl.textContent = `Ln ${line}, Col ${col}`;
  }
}
