/* Editor-Specific Keyboard Shortcuts */

import { format } from "./formatting.js";

const editorShortcuts = {
  "KeyB": (e) => { e.preventDefault(); format("bold"); },
  "KeyI": (e) => { e.preventDefault(); format("italic"); },
  "KeyU": (e) => { e.preventDefault(); format("underline"); },
};

/**
 * Handle keydown events inside the editor to process formatting hotkeys
 * @param {KeyboardEvent} event 
 * @returns {boolean} True if a shortcut was matched and executed
 */
export function handleEditorShortcuts(event) {
  const isModifier = event.ctrlKey || event.metaKey;
  if (!isModifier) return false;

  const handler = editorShortcuts[event.code];
  if (handler) {
    handler(event);
    return true;
  }
  
  return false;
}
