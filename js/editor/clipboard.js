/* Clipboard Events and Format Stripping */

import { sanitizeHTML } from "../utils/sanitizer.js";

/**
 * Attaches clipboard listeners to the editor content area
 * @param {HTMLElement} editorEl 
 */
export function initClipboard(editorEl) {
  editorEl.addEventListener("paste", (e) => {
    e.preventDefault();
    
    // Attempt to retrieve HTML first, fallback to plain text
    const clipboardData = e.clipboardData || window.clipboardData;
    const htmlData = clipboardData.getData("text/html");
    const plainText = clipboardData.getData("text/plain");
    
    let contentToInsert = "";
    
    if (htmlData) {
      // Clean HTML before injecting
      contentToInsert = sanitizeHTML(htmlData);
    } else {
      // Escape plain text and wrap newlines in paragraphs/brs
      contentToInsert = escapeHTML(plainText).replace(/\n/g, "<br>");
    }
    
    // Inject content at current selection
    insertHTMLAtCaret(contentToInsert);
  });
}

/**
 * Escapes unsafe characters for HTML safety
 * @param {string} text 
 * @returns {string}
 */
function escapeHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Safely inserts HTML at current caret position
 * @param {string} html 
 */
export function insertHTMLAtCaret(html) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  
  const range = sel.getRangeAt(0);
  range.deleteContents();
  
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  
  const fragment = document.createDocumentFragment();
  while (tempDiv.firstChild) {
    fragment.appendChild(tempDiv.firstChild);
  }
  
  // Keep track of the last node to position the caret after it
  const lastInsertedNode = fragment.lastChild;
  range.insertNode(fragment);
  
  if (lastInsertedNode) {
    const newRange = document.createRange();
    newRange.setStartAfter(lastInsertedNode);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
}
