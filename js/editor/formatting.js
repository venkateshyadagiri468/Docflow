/* Rich Text Formatting Module */

/**
 * Execute a standard rich text formatting command
 * @param {string} command 
 * @param {any} [value=null] 
 */
export function format(command, value = null) {
  document.execCommand(command, false, value);
}

/**
 * Set font family on current selection
 * @param {string} family 
 */
export function setFontFamily(family) {
  format("fontName", family);
}

/**
 * Set font size on current selection
 * Map UI pt sizes (12, 14, 16, etc.) to execCommand sizes (1-7)
 * @param {string|number} size 
 */
export function setFontSize(size) {
  // execCommand only accepts 1-7. Map standard sizes.
  let sizeVal = 3; // Default 16px/12pt
  const numSize = parseInt(size, 10);
  
  if (numSize <= 10) sizeVal = 1;
  else if (numSize <= 12) sizeVal = 2;
  else if (numSize <= 14) sizeVal = 3;
  else if (numSize <= 18) sizeVal = 4;
  else if (numSize <= 24) sizeVal = 5;
  else if (numSize <= 30) sizeVal = 6;
  else sizeVal = 7;
  
  format("fontSize", sizeVal);
  
  // Optional Enhancement: Standardize generated <font> tags to <span style="font-size: Xpt">
  // but standard font tag works fine for edit-state rendering.
}

/**
 * Set text color on current selection
 * @param {string} color hex or rgb 
 */
export function setTextColor(color) {
  format("foreColor", color);
}

/**
 * Set background highlight color
 * @param {string} color hex or rgb
 */
export function setBackgroundColor(color) {
  format("hiliteColor", color);
}

/**
 * Set block type (H1, H2, H3, P, BLOCKQUOTE, PRE)
 * @param {string} tag 
 */
export function setBlockFormat(tag) {
  const formatTag = `<${tag.toLowerCase()}>`;
  format("formatBlock", formatTag);
}

/**
 * Strips all rich text formatting from the selection
 */
export function clearFormatting() {
  format("removeFormat");
}
