/* Core Editor Manager */

import { state } from "../core/state.js";
import { editorHistory, getCaretCharacterOffsetWithin, setCaretCharacterOffsetWithin } from "../core/history.js";
import { triggerAutosave } from "../core/autosave.js";
import { initClipboard } from "./clipboard.js";
import { initImages } from "./images.js";
import { handleEditorShortcuts } from "./shortcuts.js";
import { debounce } from "../utils/debounce.js";
import { updateStats, updateCursorPos } from "../ui/statusbar.js";
import { updateOutline } from "../ui/sidebar.js";
import { updateToolbarState } from "../ui/toolbar.js";

// Debounced history snapshot pusher (runs 1 second after typing pauses)
const debouncedHistoryPush = debounce((editorEl) => {
  const html = editorEl.innerHTML;
  const offset = getCaretCharacterOffsetWithin(editorEl);
  editorHistory.push(html, offset);
}, 1000);

/**
 * Initializes the main contenteditable editor element
 * @param {HTMLElement} editorEl 
 */
export function initEditor(editorEl) {
  // Setup Clipboard cleaning
  initClipboard(editorEl);

  // Setup Image resizing & drop
  initImages(editorEl, () => {
    handleContentChange(editorEl);
  });

  // Track initial state on focus
  editorEl.addEventListener("focus", () => {
    if (editorHistory.undoStack.length === 0) {
      editorHistory.push(editorEl.innerHTML, getCaretCharacterOffsetWithin(editorEl));
    }
  });

  // Handle typing & modifications
  editorEl.addEventListener("input", () => {
    handleContentChange(editorEl);
  });

  // Keyboard shortcut routing
  editorEl.addEventListener("keydown", (e) => {
    const isShortcutHandled = handleEditorShortcuts(e);
    if (isShortcutHandled) {
      handleContentChange(editorEl);
    }
  });

  // Selection & caret movement listener
  document.addEventListener("selectionchange", () => {
    // Only track if cursor is actually inside the active editor sheet
    const sel = window.getSelection();
    if (sel.rangeCount > 0 && editorEl.contains(sel.anchorNode)) {
      updateToolbarState();
      
      // Calculate cursor position coordinates (rough line/col count)
      const offset = getCaretCharacterOffsetWithin(editorEl);
      const leadingText = editorEl.innerText.substring(0, offset);
      const lines = leadingText.split("\n");
      const lineNum = lines.length;
      const colNum = lines[lines.length - 1].length + 1;
      updateCursorPos(lineNum, colNum);
    }
  });
}

/**
 * Executes a state push, updates stats/outlines, and schedules an autosave
 * @param {HTMLElement} editorEl 
 */
export function handleContentChange(editorEl) {
  const content = editorEl.innerHTML;
  
  // Sync editor content to current document state
  const currentDoc = state.get("currentDoc");
  if (currentDoc) {
    currentDoc.content = content;
    state.setSilent("currentDoc", currentDoc); // silent to avoid infinite loops
  }

  // Update Status Bar counts and Document Outline
  updateStats(editorEl.innerText);
  updateOutline(editorEl);

  // Push to undo stack
  debouncedHistoryPush(editorEl);

  // Trigger 2s autosave countdown
  triggerAutosave();
}

/**
 * Triggers Undo action and restores caret position
 * @param {HTMLElement} editorEl 
 */
export function undoAction(editorEl) {
  const currentHtml = editorEl.innerHTML;
  const currentOffset = getCaretCharacterOffsetWithin(editorEl);
  
  const prevState = editorHistory.undo(currentHtml, currentOffset);
  if (prevState) {
    editorEl.innerHTML = prevState.html;
    setCaretCharacterOffsetWithin(editorEl, prevState.caretOffset);
    handleContentChange(editorEl);
  }
}

/**
 * Triggers Redo action and restores caret position
 * @param {HTMLElement} editorEl 
 */
export function redoAction(editorEl) {
  const currentHtml = editorEl.innerHTML;
  const currentOffset = getCaretCharacterOffsetWithin(editorEl);

  const nextState = editorHistory.redo(currentHtml, currentOffset);
  if (nextState) {
    editorEl.innerHTML = nextState.html;
    setCaretCharacterOffsetWithin(editorEl, nextState.caretOffset);
    handleContentChange(editorEl);
  }
}

/**
 * Imports content from a raw text or html file
 * @param {File} file 
 * @param {HTMLElement} editorEl 
 * @returns {Promise<void>}
 */
export function importFromFile(file, editorEl) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target.result;
      
      if (file.name.endsWith(".html") || file.type === "text/html") {
        editorEl.innerHTML = result;
      } else {
        // Plain text: escape and replace linebreaks
        const escaped = result
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        editorEl.innerHTML = `<p>${escaped.replace(/\n/g, "</p><p>")}</p>`;
      }
      
      handleContentChange(editorEl);
      resolve();
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Downloads editor contents as file
 * @param {string} format 'txt' | 'html' | 'pdf'
 * @param {HTMLElement} editorEl 
 * @param {string} filename 
 */
export function exportToFile(format, editorEl, filename) {
  const cleanFilename = filename.trim().replace(/\s+/g, "_") || "document";

  if (format === "pdf") {
    // Print stylesheet overrides layout and triggers standard system save-to-pdf
    window.print();
    return;
  }

  let mimeType = "text/plain";
  let content = "";
  let ext = "txt";

  if (format === "html") {
    mimeType = "text/html";
    content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${filename}</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #1e293b; }
    h1 { font-size: 2.25rem; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
    h2 { font-size: 1.75rem; margin-top: 1.5rem; }
    blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; color: #64748b; font-style: italic; }
    pre { background: #f8fafc; padding: 1rem; border-radius: 6px; overflow-x: auto; border: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 12px; }
    th { background: #f8fafc; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  ${editorEl.innerHTML}
</body>
</html>`;
    ext = "html";
  } else {
    // Plain text format
    content = editorEl.innerText;
    ext = "txt";
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = `${cleanFilename}.${ext}`;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
