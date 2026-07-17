/* Link Manipulation Module */

import { insertHTMLAtCaret } from "./clipboard.js";

/**
 * Creates or updates a hyperlink at the selection
 * @param {string} url 
 * @param {string} text 
 */
export function insertLink(url, text) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  const selectedText = range.toString().trim();

  // If selection exists and no custom text is supplied, use selection text
  const linkText = text || selectedText || url;

  const activeLink = getSelectedLink();
  if (activeLink) {
    // Edit existing link
    activeLink.href = url;
    activeLink.textContent = linkText;
  } else {
    // Insert new link
    const linkHTML = `<a href="${url}" target="_blank">${escapeHTML(linkText)}</a>`;
    insertHTMLAtCaret(linkHTML);
  }
}

/**
 * Strips link wrapping from the active selection
 */
export function removeLink() {
  const activeLink = getSelectedLink();
  if (!activeLink) return;

  const parent = activeLink.parentNode;
  const fragment = document.createDocumentFragment();
  
  while (activeLink.firstChild) {
    fragment.appendChild(activeLink.firstChild);
  }
  
  parent.replaceChild(fragment, activeLink);
}

/**
 * Finds the anchor element parent at current selection
 * @returns {HTMLAnchorElement|null}
 */
export function getSelectedLink() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  
  let node = sel.anchorNode;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode;
  }
  
  return node.closest("a");
}

/**
 * Safe HTML escape helper
 * @param {string} text 
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
