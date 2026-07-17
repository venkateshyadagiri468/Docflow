/* Autosave and Manual Save Interface */

import { state } from "./state.js";
import { storage } from "./storage.js";
import { debounce } from "../utils/debounce.js";

// Debounced save executor (runs 2 seconds after the last content change)
const debouncedSave = debounce(async () => {
  await saveActiveDocument();
}, 2000);

/**
 * Triggers save timer on editor change
 */
export function triggerAutosave() {
  state.set("saved", false);
  debouncedSave();
}

/**
 * Immediately persists the current active document to IndexedDB
 */
export async function saveActiveDocument() {
  const currentDoc = state.get("currentDoc");
  if (!currentDoc) return;

  // Set status state to saving
  const saveIndicator = document.getElementById("save-indicator");
  if (saveIndicator) {
    saveIndicator.className = "save-badge unsaved";
    saveIndicator.innerHTML = `<span>⏳ Saving...</span>`;
  }

  try {
    const updatedDoc = await storage.save(currentDoc);
    
    // Update local state metadata without triggering unnecessary renders
    state.setSilent("currentDoc", updatedDoc);
    
    // Update document list in sidebar
    const docList = state.get("documents");
    const docIndex = docList.findIndex(d => d.id === updatedDoc.id);
    
    if (docIndex !== -1) {
      docList[docIndex] = {
        id: updatedDoc.id,
        title: updatedDoc.title,
        starred: updatedDoc.starred,
        updatedAt: updatedDoc.updatedAt,
      };
      state.set("documents", [...docList]);
    }
    
    // Set saved state
    state.set("saved", true);
    
    if (saveIndicator) {
      saveIndicator.className = "save-badge saved";
      saveIndicator.innerHTML = `<span>✓ Saved just now</span>`;
    }
  } catch (error) {
    console.error("Autosave failed:", error);
    if (saveIndicator) {
      saveIndicator.className = "save-badge unsaved";
      saveIndicator.innerHTML = `<span>⚠ Save Failed</span>`;
    }
  }
}
