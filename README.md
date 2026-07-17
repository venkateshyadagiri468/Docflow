# 📄 DocFlow — Production-Grade Vanilla Document Editor

🚀 **Live Demo**: [https://docflow-omega-one.vercel.app/](https://docflow-omega-one.vercel.app/)

DocFlow is a production-style, high-performance client-side document editor built purely with **Vanilla HTML5, CSS3, and JavaScript (ES2024)**. It runs entirely in the browser with **no frameworks, no bundlers, and no external dependencies**, ensuring maximum execution speed, offline readiness, and client data privacy.

> [!NOTE]
> All document caching is performed locally inside the browser using IndexedDB. No server connections are initiated, making DocFlow completely secure and fully functional without an internet connection.

---

## 🚀 Key Features

| Category | Features | Details |
| :--- | :--- | :--- |
| **Document Mgmt** | Star, delete, template selection, and rename | Switch files instantly from the sidebar; select templates to begin |
| **Rich Editing** | Header levels (H1-H3), code blocks, custom fonts | Alignments, bold, italic, underline, highlights, text color picker |
| **Media & Grids** | Dynamic tables, resizable images | Drag-and-drop file upload; scale images proportionally using corner handles |
| **Operations** | Global Search & Replace, Import / Export | Find queries, step through matches, and replace single or all instances |
| **History** | Caret-aware Undo/Redo & Autosave | Revert changes (Ctrl+Z) without losing caret position; autosaves every 2 seconds |
| **Aesthetics** | Light, Dark, Sepia themes & zoom scaling | Page sheets render with shadows; zoom between 50% and 150% fluidly |

---

## 📁 Project Directory & Module Mapping

Below is the directory map of the DocFlow editor. Clicking on any file will open it directly.

```
docflow/
├── index.html                  # Main markup entry shell and modal blocks
├── README.md                   # Documentation guide
│
├── css/
│   ├── reset.css               # Reset typography and padding standards
│   ├── variables.css           # Color tokens, themes, shadows, and fonts
│   ├── layout.css              # Header navigation, sidebar, and workspace grid layouts
│   ├── toolbar.css             # Formatting bar buttons and color picker swatches
│   ├── editor.css              # Page canvas, headings, blockquotes, and resize bounds
│   ├── sidebar.css             # Accodion selectors, file lists, and outline trees
│   ├── modal.css               # Overlay dialogs, backdrop animations, and toast elements
│   ├── themes.css              # Selection background overrides and image opacities
│   └── responsive.css          # Mobile and tablet layouts and screen collapses
│
└── js/
    ├── app.js                  # Main coordinator and router bootstrap
    ├── core/
    │   ├── state.js            # Reactive global state engine
    │   ├── storage.js          # Promise-based IndexedDB database operations
    │   ├── history.js          # Character-offset history manager
    │   ├── autosave.js         # Debounced database saving
    │   ├── keyboard.js         # Global shortcuts and Fullscreen API triggers
    │   └── theme.js            # LocalStorage theme toggles
    ├── editor/
    │   ├── editor.js           # Selection loops, file readers, and page exports
    │   ├── selection.js        # Selection range capture and caret restoration
    │   ├── formatting.js       # execCommand block and inline wrappers
    │   ├── clipboard.js        # Paste event handlers and HTML cleaners
    │   ├── shortcuts.js        # Caret hotkeys (Ctrl+B / Ctrl+I / Ctrl+U)
    │   ├── tables.js           # Dynamic grid builder and cell controls
    │   ├── images.js           # Image resizing handles and drop listeners
    │   └── links.js            # Anchor nodes inserter and remover
    ├── ui/
    │   ├── toolbar.js          # Toolbar states and commands bindings
    │   ├── sidebar.js          # Collapsible sections and TOC update listeners
    │   ├── modals.js           # Modals showing/hiding and selection saving
    │   ├── toast.js            # Slide-in alert indicators
    │   └── statusbar.js        # Zoom display, theme metrics, and counters
    └── utils/
        ├── constants.js        # Initial templates, zoom steps, and database names
        ├── debounce.js         # Performance debouncing timers
        ├── sanitizer.js        # Node XSS sanitizer parser
        └── helpers.js          # DOM selectors, UUID, and date formats
```

### Direct Code Links:
- **Core App Shell**: [index.html](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/index.html) | [app.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/app.js)
- **CSS Stylesheets**: [reset.css](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/css/reset.css) | [variables.css](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/css/variables.css) | [layout.css](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/css/layout.css) | [toolbar.css](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/css/toolbar.css) | [editor.css](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/css/editor.css) | [sidebar.css](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/css/sidebar.css) | [modal.css](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/css/modal.css) | [themes.css](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/css/themes.css) | [responsive.css](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/css/responsive.css)
- **Core Engines**: [state.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/core/state.js) | [storage.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/core/storage.js) | [history.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/core/history.js) | [autosave.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/core/autosave.js) | [keyboard.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/core/keyboard.js) | [theme.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/core/theme.js)
- **Editor Functions**: [editor.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/editor/editor.js) | [selection.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/editor/selection.js) | [formatting.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/editor/formatting.js) | [clipboard.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/editor/clipboard.js) | [shortcuts.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/editor/shortcuts.js) | [tables.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/editor/tables.js) | [images.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/editor/images.js) | [links.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/editor/links.js)
- **UI Renderers**: [toolbar.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/ui/toolbar.js) | [sidebar.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/ui/sidebar.js) | [modals.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/ui/modals.js) | [toast.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/ui/toast.js) | [statusbar.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/ui/statusbar.js)
- **Utilities**: [constants.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/utils/constants.js) | [debounce.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/utils/debounce.js) | [sanitizer.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/utils/sanitizer.js) | [helpers.js](file:///home/venky/Documents/PERSONAL%20PROJECTS/Docflow/js/utils/helpers.js)

---

## ⌨️ Keyboard Shortcuts Reference

| Command | Key Combination | Action |
| :--- | :--- | :--- |
| **Save** | `Ctrl` + `S` | Saves current editor content to IndexedDB immediately |
| **Undo** | `Ctrl` + `Z` | Reverts editor to previous history snapshot |
| **Redo** | `Ctrl` + `Shift` + `Z` or `Ctrl` + `Y` | Reapplies next popped history snapshot |
| **Print / PDF** | `Ctrl` + `P` | Triggers clean document print layout (removes UI panels) |
| **Bold** | `Ctrl` + `B` | Formats selection in bold text |
| **Italic** | `Ctrl` + `I` | Formats selection in italic text |
| **Underline** | `Ctrl` + `U` | Formats selection in underlined text |
| **Fullscreen** | `F11` | Toggles browser fullscreen viewport styling |

---

## 🛠️ How to Run Locally

Because the project is built on standard **ES6 Modules**, your browser requires files to be served via HTTP protocol rather than loading direct file pathways to satisfy CORS security requirements.

### Option A: Using Python (Recommended)
If you have Python installed, launch a local server inside the root directory:
```bash
python3 -m http.server 8000
```
Then navigate to: [http://localhost:8000](http://localhost:8000)

### Option B: Using Node.js
If you have Node.js installed, run live-server or local http-server:
```bash
npx live-server ./
```
Or:
```bash
npx http-server -p 8080
```
Then navigate to: [http://localhost:8080](http://localhost:8080)

---

## 📄 License
This project is open-source and free to modify. Created with clean Vanilla JS practices.
