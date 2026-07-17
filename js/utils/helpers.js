/**
 * DOM selector helper
 * @param {string} selector 
 * @param {HTMLElement} [parent=document]
 * @returns {HTMLElement|null}
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * DOM selector all helper
 * @param {string} selector 
 * @param {HTMLElement} [parent=document]
 * @returns {NodeList}
 */
export function $$(selector, parent = document) {
  return parent.querySelectorAll(selector);
}

/**
 * Generate a unique ID (RFC4122 v4 compliant mock)
 * @returns {string}
 */
export function generateUUID() {
  return 'doc_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

/**
 * Format date string
 * @param {number|Date} timestamp 
 * @returns {string}
 */
export function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
