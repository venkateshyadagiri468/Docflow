/* Sidebar Navigation & Accordion Components */

import { state } from "../core/state.js";
import { $, $$, formatDate } from "../utils/helpers.js";

/**
 * Initializes sidebar events, panels, template cards, and collapse hooks
 * @param {Object} actions Callbacks for document actions
 */
export function initSidebar(actions) {
  const { onSelectDoc, onCreateDoc, onDeleteDoc, onToggleStar, onSelectTemplate } = actions;

  // Toggle Sidebar Collapse
  const toggleBtn = $("#sidebar-toggle-btn");
  toggleBtn.addEventListener("click", () => {
    const isCollapsed = !state.get("sidebarCollapsed");
    state.set("sidebarCollapsed", isCollapsed);
  });

  state.subscribe("sidebarCollapsed", (isCollapsed) => {
    const sidebar = $(".sidebar");
    if (isCollapsed) {
      sidebar.classList.add("collapsed");
    } else {
      sidebar.classList.remove("collapsed");
    }
  });

  // New Document Button
  const newDocBtn = $("#new-doc-btn");
  if (newDocBtn) {
    newDocBtn.addEventListener("click", () => onCreateDoc());
  }

  // Handle collapsible sidebar panels
  const panelHeaders = $$(".sidebar-panel-header");
  panelHeaders.forEach(header => {
    header.addEventListener("click", () => {
      const panel = header.closest(".sidebar-panel");
      panel.classList.toggle("open");
    });
  });

  // Document list event delegation (for open, star, delete)
  const docListContainer = $("#doc-list");
  if (docListContainer) {
    docListContainer.addEventListener("click", (e) => {
      const docItem = e.target.closest(".doc-item");
      if (!docItem) return;

      const docId = docItem.dataset.id;

      // Clicked Star Button
      if (e.target.closest(".doc-item-action-btn.star")) {
        e.stopPropagation();
        onToggleStar(docId);
        return;
      }

      // Clicked Delete Button
      if (e.target.closest(".doc-item-action-btn.delete")) {
        e.stopPropagation();
        onDeleteDoc(docId);
        return;
      }

      // Default: select/open document
      onSelectDoc(docId);
    });
  }

  // Template cards selection
  const templateGrid = $(".templates-grid");
  if (templateGrid) {
    templateGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".template-card");
      if (!card) return;
      
      const templateId = card.dataset.template;
      onSelectTemplate(templateId);
    });
  }
}

/**
 * Renders all document records into the sidebar list
 * @param {Array} docs Array of document metadata
 * @param {string} activeId Currently active document ID
 */
export function renderDocList(docs, activeId) {
  const container = $("#doc-list");
  if (!container) return;

  if (docs.length === 0) {
    container.innerHTML = `<div class="stats-row" style="padding: 1rem; text-align: center;">No documents found.</div>`;
    return;
  }

  container.innerHTML = docs.map(doc => {
    const isActive = doc.id === activeId ? "active" : "";
    const isStarred = doc.starred ? "starred" : "";
    return `
      <div class="doc-item ${isActive} ${isStarred}" data-id="${doc.id}">
        <span class="doc-item-icon">📄</span>
        <div class="doc-item-title" title="${doc.title || "Untitled Document"}">${doc.title || "Untitled Document"}</div>
        <div class="doc-item-actions">
          <button class="doc-item-action-btn star" data-tooltip="Star Document">★</button>
          <button class="doc-item-action-btn delete" data-tooltip="Delete Document">🗑</button>
        </div>
      </div>
    `;
  }).join("");
}

/**
 * Parses the editor content for H1, H2, and H3 elements to build an interactive outline
 * @param {HTMLElement} editorEl The editor contenteditable element
 */
export function updateOutline(editorEl) {
  const container = $("#outline-list");
  if (!container) return;

  const headings = Array.from(editorEl.querySelectorAll("h1, h2, h3"));

  if (headings.length === 0) {
    container.innerHTML = `<div class="stats-row" style="color: var(--text-muted);">No outline structure.</div>`;
    return;
  }

  container.innerHTML = "";

  headings.forEach((heading, idx) => {
    const item = document.createElement("div");
    const tagName = heading.tagName.toLowerCase();
    item.className = `outline-item outline-${tagName}`;
    item.textContent = heading.textContent.trim() || `Heading ${idx + 1}`;
    
    // Add unique identifier to target heading element
    heading.setAttribute("data-outline-id", `heading-${idx}`);
    item.dataset.target = `heading-${idx}`;

    item.addEventListener("click", () => {
      heading.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Flash highlight visual feedback
      heading.style.transition = "background-color 0.3s ease";
      heading.style.backgroundColor = "var(--primary-light)";
      setTimeout(() => {
        heading.style.backgroundColor = "transparent";
      }, 800);
    });

    container.appendChild(item);
  });
}
