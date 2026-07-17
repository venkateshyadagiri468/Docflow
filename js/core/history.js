/* Editor Undo/Redo Snapshots Manager */

class HistoryManager {
  constructor(maxSize = 50) {
    this.maxSize = maxSize;
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Save a content snapshot to the history stack
   * @param {string} html 
   * @param {number} caretOffset 
   */
  push(html, caretOffset = 0) {
    // If the new state matches the current top of the undo stack, skip
    if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1].html === html) {
      return;
    }

    this.undoStack.push({ html, caretOffset });
    this.redoStack = []; // Clear redo stack on new action
    
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }
  }

  /**
   * Reverts to the previous state
   * @param {string} currentHtml 
   * @param {number} currentOffset
   * @returns {Object|null} { html, caretOffset } or null if empty
   */
  undo(currentHtml, currentOffset = 0) {
    if (this.undoStack.length === 0) return null;
    
    // Push current state to redo stack
    this.redoStack.push({ html: currentHtml, caretOffset: currentOffset });
    
    // Pop the previous state
    return this.undoStack.pop();
  }

  /**
   * Reapplies the next reverted state
   * @param {string} currentHtml 
   * @param {number} currentOffset
   * @returns {Object|null} { html, caretOffset } or null if empty
   */
  redo(currentHtml, currentOffset = 0) {
    if (this.redoStack.length === 0) return null;
    
    // Push current state to undo stack
    this.undoStack.push({ html: currentHtml, caretOffset: currentOffset });
    
    // Pop the next state
    return this.redoStack.pop();
  }

  /**
   * Reset the history stacks
   */
  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}

/**
 * Calculates caret character offset relative to an element
 * @param {HTMLElement} element 
 * @returns {number}
 */
export function getCaretCharacterOffsetWithin(element) {
  let caretOffset = 0;
  const doc = element.ownerDocument || element.document;
  const win = doc.defaultView || doc.parentWindow;
  const sel = win.getSelection();
  
  if (sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length;
  }
  
  return caretOffset;
}

/**
 * Restores caret selection to the specified character offset
 * @param {HTMLElement} element 
 * @param {number} offset 
 */
export function setCaretCharacterOffsetWithin(element, offset) {
  if (offset < 0) return;
  
  const sel = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(true);
  
  const nodeQueue = [element];
  let currentOffset = 0;
  let found = false;
  
  while (nodeQueue.length > 0 && !found) {
    const node = nodeQueue.shift();
    
    if (node.nodeType === Node.TEXT_NODE) {
      const nextOffset = currentOffset + node.length;
      if (offset >= currentOffset && offset <= nextOffset) {
        try {
          range.setStart(node, offset - currentOffset);
          range.collapse(true);
          found = true;
        } catch (e) {
          // Fallback if index mismatch
        }
      }
      currentOffset = nextOffset;
    } else {
      // Push children nodes
      for (let i = 0; i < node.childNodes.length; i++) {
        nodeQueue.push(node.childNodes[i]);
      }
    }
  }
  
  if (found) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

export const editorHistory = new HistoryManager();
