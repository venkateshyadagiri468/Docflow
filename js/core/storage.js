/* IndexedDB Storage Interface */

import { DB_NAME, DB_VERSION, STORE_NAME, TEMPLATES } from "../utils/constants.js";
import { generateUUID } from "../utils/helpers.js";

class StorageManager {
  constructor() {
    this.db = null;
  }

  /**
   * Initializes the database connection
   * @returns {Promise<IDBDatabase>}
   */
  init() {
    if (this.db) return Promise.resolve(this.db);

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("IndexedDB open error:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("updatedAt", "updatedAt", { unique: false });
          store.createIndex("starred", "starred", { unique: false });
        }
      };
    });
  }

  /**
   * Run operations inside a transaction
   * @param {string} mode "readonly" | "readwrite"
   * @returns {Promise<IDBObjectStore>}
   */
  async getStore(mode = "readonly") {
    await this.init();
    const tx = this.db.transaction(STORE_NAME, mode);
    return tx.objectStore(STORE_NAME);
  }

  /**
   * Fetch all documents (sorted by updatedAt desc)
   * @returns {Promise<Array>}
   */
  async getAll() {
    const store = await this.getStore("readonly");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        // Sort by updatedAt descending
        const docs = request.result.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(docs);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Fetch a single document by ID
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async get(id) {
    const store = await this.getStore("readonly");
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save (Insert/Update) a document
   * @param {Object} doc 
   * @returns {Promise<Object>} The saved document
   */
  async save(doc) {
    const store = await this.getStore("readwrite");
    const timestamp = Date.now();
    
    const savedDoc = {
      ...doc,
      updatedAt: timestamp,
      createdAt: doc.createdAt || timestamp,
    };

    return new Promise((resolve, reject) => {
      const request = store.put(savedDoc);
      request.onsuccess = () => resolve(savedDoc);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a document by ID
   * @param {string} id 
   * @returns {Promise<void>}
   */
  async delete(id) {
    const store = await this.getStore("readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Seeds the database with template examples if empty
   */
  async seedIfEmpty() {
    const docs = await this.getAll();
    if (docs.length > 0) return docs;

    console.log("Database is empty, seeding initial files...");
    const timestamp = Date.now();
    
    // Seed templates
    const initialDocs = [
      {
        id: generateUUID(),
        title: "Welcome to DocFlow! 🚀",
        content: `<h1>Welcome to DocFlow! 🚀</h1>
<p>DocFlow is a premium, client-side rich text document editor. Everything you write here is saved directly in your browser's IndexedDB, meaning it is 100% private and works completely offline!</p>
<hr>
<h2>Key Features</h2>
<ul>
  <li>📝 <strong>Rich Text Editing:</strong> Headers, blockquotes, code blocks, color pickers, and layout formats.</li>
  <li>📁 <strong>Multi-Document Workspace:</strong> Open, create, delete, and star documents.</li>
  <li>🎨 <strong>Visual Themes:</strong> Toggle between Light, Dark, and Sepia themes easily.</li>
  <li>🔄 <strong>Autosave & History:</strong> Autosaves every 2 seconds. Full Undo (Ctrl+Z) / Redo (Ctrl+Shift+Z) history support.</li>
  <li>🖼️ <strong>Media Elements:</strong> Insert resizable images and interactive tables with rows/columns adjustments.</li>
  <li>🔍 <strong>Search & Replace:</strong> Dynamic highlighting and full document search/replace.</li>
</ul>
<blockquote>Tip: Highlight any text in the editor to inspect selection ranges or use standard shortcuts!</blockquote>`,
        starred: true,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      ...TEMPLATES.filter(t => t.id !== "blank").map((t, idx) => ({
        id: generateUUID(),
        title: t.title,
        content: t.content,
        starred: false,
        createdAt: timestamp - (idx + 1) * 60000, // order them older
        updatedAt: timestamp - (idx + 1) * 60000
      }))
    ];

    for (const doc of initialDocs) {
      await this.save(doc);
    }
    
    return initialDocs;
  }
}

export const storage = new StorageManager();
