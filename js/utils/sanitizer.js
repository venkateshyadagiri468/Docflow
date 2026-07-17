/**
 * Basic HTML Sanitizer to prevent XSS on pasting or importing
 */

const ALLOWED_TAGS = new Set([
  'H1', 'H2', 'H3', 'P', 'BR', 'DIV', 'UL', 'OL', 'LI', 'SPAN', 
  'A', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'IMG', 
  'PRE', 'CODE', 'BLOCKQUOTE', 'HR', 'B', 'I', 'U', 'STRIKE', 
  'STRONG', 'EM', 'SUB', 'SUP'
]);

const ALLOWED_ATTRS = new Set([
  'href', 'src', 'alt', 'width', 'height', 'style', 'target', 'class', 'colspan', 'rowspan'
]);

/**
 * Sanitizes an HTML string
 * @param {string} html 
 * @returns {string}
 */
export function sanitizeHTML(html) {
  if (!html) return '';
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;
  
  sanitizeNode(body);
  
  return body.innerHTML;
}

/**
 * Recursively clean a node and its children
 * @param {HTMLElement} node 
 */
function sanitizeNode(node) {
  const children = Array.from(node.childNodes);
  
  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const tagName = child.tagName.toUpperCase();
      
      // If tag is not allowed, remove it or replace with text content
      if (!ALLOWED_TAGS.has(tagName)) {
        // If it's a scripting element, delete it completely
        if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'APPLET', 'NOSCRIPT'].includes(tagName)) {
          node.removeChild(child);
        } else {
          // Replace element with its text contents
          const textNode = document.createTextNode(child.textContent);
          node.replaceChild(textNode, child);
        }
        continue;
      }
      
      // Sanitize attributes
      const attrs = Array.from(child.attributes);
      for (const attr of attrs) {
        const attrName = attr.name.toLowerCase();
        
        // Remove unsafe attribute
        if (!ALLOWED_ATTRS.has(attrName) || attrName.startsWith('on')) {
          child.removeAttribute(attr.name);
          continue;
        }
        
        // Check href and src values for javascript protocols
        if (['href', 'src'].includes(attrName)) {
          const value = attr.value.trim().toLowerCase();
          if (value.startsWith('javascript:') || value.startsWith('data:text/html')) {
            child.removeAttribute(attr.name);
          }
        }
      }
      
      // Recurse into children
      sanitizeNode(child);
      
    } else if (child.nodeType !== Node.TEXT_NODE && child.nodeType !== Node.COMMENT_NODE) {
      // Remove other node types like CDATA, processing instructions, etc.
      node.removeChild(child);
    }
  }
}
