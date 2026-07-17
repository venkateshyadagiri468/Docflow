/* Selection and Range Helpers */

let savedRange = null;

/**
 * Saves the current selection range.
 */
export function saveSelection() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) {
    savedRange = sel.getRangeAt(0);
  }
}

/**
 * Restores the previously saved selection range.
 */
export function restoreSelection() {
  if (!savedRange) return;
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(savedRange);
}

/**
 * Clear the saved selection range.
 */
export function clearSavedSelection() {
  savedRange = null;
}

/**
 * Check if selection is within the editor element
 * @param {HTMLElement} editorEl 
 * @returns {boolean}
 */
export function isSelectionInEditor(editorEl) {
  const sel = window.getSelection();
  if (sel.rangeCount === 0) return false;
  const node = sel.anchorNode;
  return editorEl.contains(node);
}

/**
 * Returns the currently active block element parent (e.g. H1, BLOCKQUOTE, P)
 * @param {HTMLElement} editorEl 
 * @returns {HTMLElement|null}
 */
export function getActiveBlockElement(editorEl) {
  const sel = window.getSelection();
  if (sel.rangeCount === 0) return null;
  
  let node = sel.anchorNode;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode;
  }
  
  while (node && node !== editorEl) {
    const tagName = node.tagName.toUpperCase();
    if (['P', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'PRE', 'LI', 'TD', 'TH'].includes(tagName)) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

/**
 * Get active formats (e.g. bold, italic) at the cursor position
 * @returns {Object}
 */
export function getActiveFormats() {
  return {
    bold: document.queryCommandState("bold"),
    italic: document.queryCommandState("italic"),
    underline: document.queryCommandState("underline"),
    strikeThrough: document.queryCommandState("strikeThrough"),
    justifyLeft: document.queryCommandState("justifyLeft"),
    justifyCenter: document.queryCommandState("justifyCenter"),
    justifyRight: document.queryCommandState("justifyRight"),
    justifyFull: document.queryCommandState("justifyFull"),
    insertOrderedList: document.queryCommandState("insertOrderedList"),
    insertUnorderedList: document.queryCommandState("insertUnorderedList"),
  };
}
