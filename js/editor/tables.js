/* Table Manipulation Module */

import { insertHTMLAtCaret } from "./clipboard.js";

/**
 * Creates and inserts a table at the cursor position
 * @param {number} rows 
 * @param {number} cols 
 */
export function insertTable(rows, cols) {
  let tableHTML = "<table><tbody>";
  for (let r = 0; r < rows; r++) {
    tableHTML += "<tr>";
    for (let c = 0; c < cols; c++) {
      tableHTML += "<td><br></td>"; // Add break tag to ensure editable height
    }
    tableHTML += "</tr>";
  }
  tableHTML += "</tbody></table>";
  insertHTMLAtCaret(tableHTML);
}

/**
 * Helper to find current selected td/th cell
 * @returns {HTMLTableCellElement|null}
 */
function getSelectedCell() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  let node = sel.anchorNode;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode;
  }
  return node.closest("td, th");
}

/**
 * Insert row before or after the selected cell
 * @param {string} direction 'before' | 'after'
 */
export function insertRow(direction = "after") {
  const cell = getSelectedCell();
  if (!cell) return;

  const row = cell.closest("tr");
  const table = cell.closest("table");
  if (!row || !table) return;

  const numCells = row.cells.length;
  const newRow = document.createElement("tr");
  for (let i = 0; i < numCells; i++) {
    const newCell = document.createElement("td");
    newCell.innerHTML = "<br>";
    newRow.appendChild(newCell);
  }

  if (direction === "before") {
    row.parentNode.insertBefore(newRow, row);
  } else {
    row.parentNode.insertBefore(newRow, row.nextSibling);
  }
}

/**
 * Insert column before or after the selected cell
 * @param {string} direction 'before' | 'after'
 */
export function insertColumn(direction = "after") {
  const cell = getSelectedCell();
  if (!cell) return;

  const row = cell.closest("tr");
  const table = cell.closest("table");
  if (!row || !table) return;

  const cellIndex = cell.cellIndex;
  const rows = table.rows;

  for (let i = 0; i < rows.length; i++) {
    const targetRow = rows[i];
    const newCell = document.createElement(targetRow.parentNode.tagName === "THEAD" ? "th" : "td");
    newCell.innerHTML = "<br>";
    
    if (direction === "before") {
      targetRow.insertBefore(newCell, targetRow.cells[cellIndex]);
    } else {
      targetRow.insertBefore(newCell, targetRow.cells[cellIndex].nextSibling);
    }
  }
}

/**
 * Delete the row containing current selection
 */
export function deleteRow() {
  const cell = getSelectedCell();
  if (!cell) return;

  const row = cell.closest("tr");
  const table = cell.closest("table");
  if (!row || !table) return;

  row.parentNode.removeChild(row);
  
  // If table has no rows left, delete table itself
  if (table.rows.length === 0) {
    table.parentNode.removeChild(table);
  }
}

/**
 * Delete the column containing current selection
 */
export function deleteColumn() {
  const cell = getSelectedCell();
  if (!cell) return;

  const table = cell.closest("table");
  if (!table) return;

  const cellIndex = cell.cellIndex;
  const rows = table.rows;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.cells[cellIndex]) {
      row.removeChild(row.cells[cellIndex]);
    }
  }

  // If table has no columns left, delete table
  if (rows.length === 0 || rows[0].cells.length === 0) {
    table.parentNode.removeChild(table);
  }
}
