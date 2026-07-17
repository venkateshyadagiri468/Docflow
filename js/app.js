/* Main Application Bootstrapper & Document Controller */

import { state } from "./core/state.js";
import { storage } from "./core/storage.js";
import { initTheme } from "./core/theme.js";
import { initStatusbar } from "./ui/statusbar.js";
import { initModals, openModal, closeModal } from "./ui/modals.js";
import { initToolbar, updateToolbarState } from "./ui/toolbar.js";
import { initSidebar, renderDocList, updateOutline } from "./ui/sidebar.js";
import { initEditor, undoAction, redoAction, handleContentChange, importFromFile, exportToFile } from "./editor/editor.js";
import { initKeyboard } from "./core/keyboard.js";
import { $, $$, generateUUID } from "./utils/helpers.js";
import { TEMPLATES } from "./utils/constants.js";
import { showToast } from "./ui/toast.js";
import { insertTable, insertRow, insertColumn, deleteRow, deleteColumn } from "./editor/tables.js";
import { insertImage } from "./editor/images.js";
import { insertLink, removeLink, getSelectedLink } from "./editor/links.js";

// DOM references
const editorEl = $("#editor");
const titleInput = $("#doc-title");

// Application bootstrap entrypoint
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1. Storage DB Initialization
    await storage.init();
    const seededDocs = await storage.seedIfEmpty();
    state.set("documents", seededDocs);

    // 2. Core Controllers Initialization
    initTheme();
    initStatusbar();
    initModals();
    
    // 3. UI Actions Binding
    initToolbar({
      onInsertLink: handleOpenLinkModal,
      onInsertTable: () => openModal("modal-table-backdrop"),
      onInsertImage: () => openModal("modal-image-backdrop"),
      onSearchReplace: () => openModal("modal-search-backdrop", setupSearchAndReplace),
    });

    initSidebar({
      onSelectDoc: openDocument,
      onCreateDoc: () => createNewDoc(),
      onDeleteDoc: deleteDocument,
      onToggleStar: toggleDocumentStar,
      onSelectTemplate: handleTemplateSelection,
    });

    // 4. Editor Canvas Initialization
    initEditor(editorEl);
    initKeyboard(editorEl, () => undoAction(editorEl), () => redoAction(editorEl));

    // 5. Setup Action Listeners (Menus, Forms, Star status)
    setupMenuBarActions();
    setupModalConfirmations();
    setupDocumentTitleRename();
    setupDocumentStarring();
    setupZoomHandler();
    setupThemeCycler();

    // 6. Router: Open initial document (last active, or first in index)
    const initialDocId = localStorage.getItem("docflow_active_doc_id");
    const docExists = seededDocs.some(d => d.id === initialDocId);
    
    if (initialDocId && docExists) {
      await openDocument(initialDocId);
    } else if (seededDocs.length > 0) {
      await openDocument(seededDocs[0].id);
    } else {
      await createNewDoc();
    }

    showToast("DocFlow initialized", "info");
  } catch (err) {
    console.error("Bootstrapping failed:", err);
    showToast("Failed to initialize DocFlow database", "error");
  }
});

/* Router & Document Handlers */

async function openDocument(id) {
  try {
    const doc = await storage.get(id);
    if (!doc) {
      showToast("Document not found", "error");
      return;
    }

    // Update active document state
    state.set("currentDoc", doc);
    localStorage.setItem("docflow_active_doc_id", id);
    
    // Refresh active state selection in sidebar
    const allDocs = state.get("documents");
    renderDocList(allDocs, id);
    
  } catch (err) {
    console.error("Failed to load document:", err);
    showToast("Error opening document", "error");
  }
}

async function createNewDoc(title = "Untitled Document", content = "") {
  const newDoc = {
    id: generateUUID(),
    title: title.trim(),
    content: content,
    starred: false
  };

  try {
    const saved = await storage.save(newDoc);
    
    // Prepend to current list
    const currentList = state.get("documents");
    state.set("documents", [saved, ...currentList]);

    // Open it
    await openDocument(saved.id);
    showToast("Document created", "success");
    
    // Put caret focus in editor
    setTimeout(() => editorEl.focus(), 150);
  } catch (err) {
    console.error("Creation failed:", err);
    showToast("Error creating document", "error");
  }
}

async function deleteDocument(id) {
  // Confirm deletion
  if (!confirm("Are you sure you want to delete this document? This cannot be undone.")) {
    return;
  }

  try {
    await storage.delete(id);
    showToast("Document deleted", "info");

    const updatedList = state.get("documents").filter(d => d.id !== id);
    state.set("documents", updatedList);

    // If active document was deleted, open the next available one
    const activeDoc = state.get("currentDoc");
    if (activeDoc && activeDoc.id === id) {
      if (updatedList.length > 0) {
        await openDocument(updatedList[0].id);
      } else {
        await createNewDoc();
      }
    }
  } catch (err) {
    console.error("Deletion failed:", err);
    showToast("Error deleting document", "error");
  }
}

async function toggleDocumentStar(id) {
  try {
    const doc = await storage.get(id);
    if (!doc) return;

    doc.starred = !doc.starred;
    const saved = await storage.save(doc);

    // Update state documents list
    const allDocs = state.get("documents");
    const index = allDocs.findIndex(d => d.id === id);
    if (index !== -1) {
      allDocs[index].starred = saved.starred;
      // Sort: starred documents first, then updatedAt desc
      state.set("documents", [...allDocs]);
    }

    // If currently active, sync properties
    const activeDoc = state.get("currentDoc");
    if (activeDoc && activeDoc.id === id) {
      state.set("currentDoc", saved);
    }
    
    showToast(saved.starred ? "Document starred" : "Star removed", "success");
  } catch (err) {
    console.error("Star toggle failed:", err);
  }
}

function handleTemplateSelection(templateId) {
  const template = TEMPLATES.find(t => t.id === templateId);
  if (!template) return;
  
  const title = template.id === "blank" ? "Untitled Document" : `New ${template.name}`;
  createNewDoc(title, template.content);
}

/* UI Listeners & Sync Handlers */

// Sync active document contents to editor canvas
state.subscribe("currentDoc", (doc) => {
  if (!doc) return;

  // Update topbar title input (if user not editing it right now)
  if (document.activeElement !== titleInput) {
    titleInput.value = doc.title;
  }

  // Update editor innerHTML ONLY if the file was switched
  if (editorEl.dataset.currentId !== doc.id) {
    editorEl.dataset.currentId = doc.id;
    editorEl.innerHTML = doc.content;
    
    // Clear history stacks for fresh file
    state.set("saved", true);
  }
  
  // Set Star Button active state
  const starBtn = $("#doc-star-btn");
  if (starBtn) {
    starBtn.classList.toggle("starred", doc.starred);
  }
  
  // Update sidebar outlines and status bar counts
  updateOutline(editorEl);
  updateToolbarState();
});

// Update editor zoom scale factor
setupZoomHandler();
function setupZoomHandler() {
  state.subscribe("zoom", (factor) => {
    const pageEl = $("#editor-page-element");
    if (pageEl) {
      pageEl.style.transform = `scale(${factor})`;
      
      // Dynamic padding to preserve layout and allow scrolling
      const workspace = $("#editor-workspace");
      if (workspace) {
        // base spacing 2rem (32px) + letter page height scaled
        const scaledHeight = 1056 * factor; // 11 inches in pixels
        workspace.style.minHeight = `${scaledHeight + 100}px`;
      }
    }
  });
}

// Cycle color themes
function setupThemeCycler() {
  const themeCycleBtn = $("#btn-theme-cycle");
  const themeStatusBtn = $("#theme-status-btn");

  const cycle = () => {
    const currentTheme = state.get("theme");
    let nextTheme = "light";
    if (currentTheme === "light") nextTheme = "dark";
    else if (currentTheme === "dark") nextTheme = "sepia";
    state.set("theme", nextTheme);
  };

  if (themeCycleBtn) themeCycleBtn.addEventListener("click", cycle);
  if (themeStatusBtn) themeStatusBtn.addEventListener("click", cycle);
}

// Watch window resize for mobile collapsing sidebar
window.addEventListener("resize", () => {
  if (window.innerWidth <= 1024) {
    state.setSilent("sidebarCollapsed", true);
    $(".sidebar").classList.add("collapsed");
  } else {
    state.setSilent("sidebarCollapsed", false);
    $(".sidebar").classList.remove("collapsed");
  }
});

/* Menu Bar Layout & Dropdowns */

function setupMenuBarActions() {
  // Dropdowns click controls
  const triggers = $$(".menu-trigger");
  
  triggers.forEach(trigger => {
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const dropdown = trigger.nextElementSibling;
      const isShowing = dropdown.classList.contains("show");
      
      // Hide all other dropdowns
      $$(".menu-dropdown").forEach(d => d.classList.remove("show"));
      $$(".menu-trigger").forEach(t => t.classList.remove("active"));
      
      if (!isShowing) {
        dropdown.classList.add("show");
        trigger.classList.add("active");
      }
    });
  });

  // Hide dropdowns on document clicks
  document.addEventListener("click", () => {
    $$(".menu-dropdown").forEach(d => d.classList.remove("show"));
    $$(".menu-trigger").forEach(t => t.classList.remove("active"));
  });

  // Wire menu buttons to functions
  $("#menu-new-doc").addEventListener("click", () => createNewDoc());
  $("#menu-save-doc").addEventListener("click", () => handleContentChange(editorEl));
  $("#menu-delete-doc").addEventListener("click", () => {
    const doc = state.get("currentDoc");
    if (doc) deleteDocument(doc.id);
  });
  
  // Imports
  const fileImportInput = $("#file-import-input");
  $("#menu-import-file").addEventListener("click", () => fileImportInput.click());
  fileImportInput.addEventListener("change", async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      await importFromFile(files[0], editorEl);
      showToast("Document imported", "success");
      // Reset value so same file can be selected again
      fileImportInput.value = "";
    }
  });

  // Exports
  $("#menu-export-txt").addEventListener("click", () => {
    const doc = state.get("currentDoc");
    if (doc) exportToFile("txt", editorEl, doc.title);
  });
  $("#menu-export-html").addEventListener("click", () => {
    const doc = state.get("currentDoc");
    if (doc) exportToFile("html", editorEl, doc.title);
  });
  $("#menu-export-pdf").addEventListener("click", () => {
    exportToFile("pdf", editorEl, "");
  });

  // Edits
  $("#menu-undo").addEventListener("click", () => undoAction(editorEl));
  $("#menu-redo").addEventListener("click", () => redoAction(editorEl));
  $("#menu-search").addEventListener("click", () => openModal("modal-search-backdrop", setupSearchAndReplace));

  // Inserts
  $("#menu-insert-link").addEventListener("click", handleOpenLinkModal);
  $("#menu-insert-image").addEventListener("click", () => openModal("modal-image-backdrop"));
  $("#menu-insert-table").addEventListener("click", () => openModal("modal-table-backdrop"));
  $("#menu-insert-hr").addEventListener("click", () => {
    document.execCommand("insertHorizontalRule");
    handleContentChange(editorEl);
  });

  // Formats
  $("#menu-format-bold").addEventListener("click", () => { document.execCommand("bold"); handleContentChange(editorEl); });
  $("#menu-format-italic").addEventListener("click", () => { document.execCommand("italic"); handleContentChange(editorEl); });
  $("#menu-format-underline").addEventListener("click", () => { document.execCommand("underline"); handleContentChange(editorEl); });
  $("#menu-format-clear").addEventListener("click", () => { document.execCommand("removeFormat"); handleContentChange(editorEl); });

  // Help
  $("#menu-help-shortcuts").addEventListener("click", () => openModal("modal-help-backdrop"));
}

/* Modals Submission and Callbacks */

function setupModalConfirmations() {
  // Link insert
  $("#modal-link-confirm-btn").addEventListener("click", () => {
    const url = $("#link-url-input").value.trim();
    const text = $("#link-text-input").value.trim();
    if (url) {
      insertLink(url, text);
      handleContentChange(editorEl);
      closeModal("modal-link-backdrop");
    }
  });

  // Image insert
  const imgFileInput = $("#image-file-input");
  const imgUrlInput = $("#image-url-input");

  $("#modal-image-confirm-btn").addEventListener("click", () => {
    const url = imgUrlInput.value.trim();
    const file = imgFileInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        insertImage(e.target.result);
        handleContentChange(editorEl);
        closeModal("modal-image-backdrop");
      };
      reader.readAsDataURL(file);
    } else if (url) {
      insertImage(url);
      handleContentChange(editorEl);
      closeModal("modal-image-backdrop");
    }
    
    // Clear fields
    imgUrlInput.value = "";
    imgFileInput.value = "";
  });

  // Table insert
  $("#modal-table-confirm-btn").addEventListener("click", () => {
    const rows = parseInt($("#table-rows-input").value, 10);
    const cols = parseInt($("#table-cols-input").value, 10);
    if (rows > 0 && cols > 0) {
      insertTable(rows, cols);
      handleContentChange(editorEl);
      closeModal("modal-table-backdrop");
    }
  });
}

function handleOpenLinkModal() {
  openModal("modal-link-backdrop", () => {
    const activeLink = getSelectedLink();
    const urlInput = $("#link-url-input");
    const textInput = $("#link-text-input");
    
    if (activeLink) {
      urlInput.value = activeLink.href;
      textInput.value = activeLink.textContent;
    } else {
      urlInput.value = "";
      textInput.value = window.getSelection().toString();
    }
  });
}

// Rename Document Input handler
function setupDocumentTitleRename() {
  const saveTitle = () => {
    const newTitle = titleInput.value.trim();
    const currentDoc = state.get("currentDoc");
    if (currentDoc && newTitle && newTitle !== currentDoc.title) {
      currentDoc.title = newTitle;
      state.setSilent("currentDoc", currentDoc);
      handleContentChange(editorEl);
    }
  };

  titleInput.addEventListener("blur", saveTitle);
  titleInput.addEventListener("keydown", (e) => {
    if (e.code === "Enter" || e.code === "NumpadEnter") {
      titleInput.blur();
      saveTitle();
    }
  });
}

// Star button topbar trigger
function setupDocumentStarring() {
  $("#doc-star-btn").addEventListener("click", () => {
    const doc = state.get("currentDoc");
    if (doc) {
      toggleDocumentStar(doc.id);
    }
  });
}

/* ================= SEARCH & REPLACE LOGIC ================= */

let searchMatches = [];
let activeSearchIndex = -1;

function setupSearchAndReplace(modal) {
  const searchInput = $("#search-input");
  const replaceInput = $("#replace-input");
  const matchesLabel = $("#search-matches-label");

  const runSearch = () => {
    const query = searchInput.value;
    if (!query) {
      clearSearchHighlights();
      searchMatches = [];
      activeSearchIndex = -1;
      matchesLabel.textContent = "Matches: 0 / 0";
      return;
    }

    clearSearchHighlights();
    highlightTextMatches(query);

    searchMatches = Array.from(editorEl.querySelectorAll(".search-highlight"));
    activeSearchIndex = searchMatches.length > 0 ? 0 : -1;
    updateSearchSelection();
  };

  // Debounced search on input typing
  searchInput.addEventListener("input", runSearch);

  // Search Prev button
  $("#search-prev-btn").replaceWith($("#search-prev-btn").cloneNode(true)); // remove previous listners
  $("#search-prev-btn").addEventListener("click", () => {
    if (searchMatches.length === 0) return;
    activeSearchIndex = (activeSearchIndex - 1 + searchMatches.length) % searchMatches.length;
    updateSearchSelection();
  });

  // Search Next button
  $("#search-next-btn").replaceWith($("#search-next-btn").cloneNode(true));
  $("#search-next-btn").addEventListener("click", () => {
    if (searchMatches.length === 0) return;
    activeSearchIndex = (activeSearchIndex + 1) % searchMatches.length;
    updateSearchSelection();
  });

  // Replace Single Button
  $("#search-replace-btn").replaceWith($("#search-replace-btn").cloneNode(true));
  $("#search-replace-btn").addEventListener("click", () => {
    if (searchMatches.length === 0 || activeSearchIndex === -1) return;
    
    const activeSpan = searchMatches[activeSearchIndex];
    const replacement = replaceInput.value;
    
    const textNode = document.createTextNode(replacement);
    activeSpan.parentNode.replaceChild(textNode, activeSpan);
    
    handleContentChange(editorEl);
    runSearch(); // refresh
  });

  // Replace All Button
  $("#search-replace-all-btn").replaceWith($("#search-replace-all-btn").cloneNode(true));
  $("#search-replace-all-btn").addEventListener("click", () => {
    const query = searchInput.value;
    const replacement = replaceInput.value;
    if (!query) return;

    clearSearchHighlights();
    
    // global regex replacement on text nodes
    const walk = document.createTreeWalker(editorEl, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const nodesToReplace = [];
    
    while (node = walk.nextNode()) {
      if (node.nodeValue.includes(query)) {
        nodesToReplace.push(node);
      }
    }

    nodesToReplace.forEach(textNode => {
      const parts = textNode.nodeValue.split(query);
      const parent = textNode.parentNode;
      
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) fragment.appendChild(document.createTextNode(parts[i]));
        if (i < parts.length - 1) fragment.appendChild(document.createTextNode(replacement));
      }
      
      parent.replaceChild(fragment, textNode);
    });

    handleContentChange(editorEl);
    showToast("Replaced all matches", "success");
    closeModal("modal-search-backdrop");
  });

  // Clean highlights when modal closes
  const modalClose = modal.querySelector(".modal-close-btn");
  modalClose.addEventListener("click", clearSearchHighlights, { once: true });
}

function updateSearchSelection() {
  const matchesLabel = $("#search-matches-label");
  searchMatches.forEach(el => el.classList.remove("current"));

  if (searchMatches.length === 0 || activeSearchIndex === -1) {
    matchesLabel.textContent = "Matches: 0 / 0";
    return;
  }

  matchesLabel.textContent = `Matches: ${activeSearchIndex + 1} / ${searchMatches.length}`;
  const target = searchMatches[activeSearchIndex];
  target.classList.add("current");
  target.scrollIntoView({ behavior: "smooth", block: "center" });
}

function highlightTextMatches(query) {
  const walk = document.createTreeWalker(editorEl, NodeFilter.SHOW_TEXT, null, false);
  const nodes = [];
  let node;
  while (node = walk.nextNode()) {
    // Skip if parent is already a highlight span
    if (!node.parentNode.classList.contains("search-highlight") && node.nodeValue.toLowerCase().includes(query.toLowerCase())) {
      nodes.push(node);
    }
  }

  nodes.forEach(textNode => {
    const parent = textNode.parentNode;
    const text = textNode.nodeValue;
    const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
    const parts = text.split(regex);

    const fragment = document.createDocumentFragment();
    parts.forEach(part => {
      if (part.toLowerCase() === query.toLowerCase()) {
        const span = document.createElement("span");
        span.className = "search-highlight";
        span.textContent = part;
        fragment.appendChild(span);
      } else if (part) {
        fragment.appendChild(document.createTextNode(part));
      }
    });

    parent.replaceChild(fragment, textNode);
  });
}

function clearSearchHighlights() {
  const highlights = Array.from(editorEl.querySelectorAll(".search-highlight"));
  highlights.forEach(span => {
    const textNode = document.createTextNode(span.textContent);
    span.parentNode.replaceChild(textNode, span);
  });
  // Normalize editor DOM text nodes structure
  editorEl.normalize();
}

function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
