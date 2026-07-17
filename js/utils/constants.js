/* Global Constants */

export const DB_NAME = "DocFlowDatabase";
export const DB_VERSION = 1;
export const STORE_NAME = "documents";

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SEPIA: "sepia",
};

export const ZOOM_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5];

export const TEMPLATES = [
  {
    id: "blank",
    name: "Blank Document",
    icon: "📄",
    title: "Untitled Document",
    content: "",
  },
  {
    id: "meeting",
    name: "Meeting Notes",
    icon: "📅",
    title: "Project Sync Meeting Notes",
    content: `<h1>📅 Project Sync Meeting Notes</h1>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Attendees:</strong> Participant A, Participant B, Participant C</p>
<hr>
<h2>Agenda</h2>
<ul>
  <li>Review status updates for Q3 key deliverables.</li>
  <li>Discuss blockages in database migration path.</li>
  <li>Align on DocFlow UI formatting styles.</li>
</ul>
<h2>Discussion Details</h2>
<p>We discussed the vanilla design system and finalized that all modal overlays will have smooth scaling transitions. Drag and resize handles for images are functioning as expected.</p>
<h2>Action Items</h2>
<ul>
  <li><strong>@Design Team:</strong> Finalize the dark and sepia color palettes.</li>
  <li><strong>@Eng Team:</strong> Set up IndexedDB tables for multi-document document cache.</li>
  <li><strong>@Product:</strong> Validate copy and paste format sanitization workflow.</li>
</ul>`,
  },
  {
    id: "proposal",
    name: "Project Proposal",
    icon: "💡",
    title: "New Product Proposal",
    content: `<h1>💡 New Product Proposal: DocFlow</h1>
<h2>1. Executive Summary</h2>
<p>DocFlow is a production-style, lightweight document editor built strictly with vanilla JavaScript and standard HTML5/CSS3 APIs. It delivers performance, security, and portability for modern web applications.</p>
<h2>2. Proposed Specifications</h2>
<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Details</th>
      <th>Priority</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>IndexedDB</td>
      <td>Document caching and offline support</td>
      <td>High</td>
    </tr>
    <tr>
      <td>Canvas & Resize</td>
      <td>Interactive image sizing handles</td>
      <td>Medium</td>
    </tr>
    <tr>
      <td>State Manager</td>
      <td>Single source of truth tracking</td>
      <td>High</td>
    </tr>
  </tbody>
</table>
<h2>3. Timeline</h2>
<p>The phase 1 baseline features will be delivered and verified within the week. Subsequent Phase 2 extensions will support markdown exports and PWA setup.</p>`,
  },
];
