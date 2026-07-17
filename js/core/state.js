/* Core Application State Manager */

class StateManager {
  constructor() {
    this._state = {
      documents: [],          // Array of document metadata { id, title, starred, updatedAt, template }
      currentDoc: null,       // Active document object { id, title, content, starred, updatedAt }
      theme: "light",         // light | dark | sepia
      zoom: 1.0,              // 0.5 | 0.75 | 1.0 | 1.25 | 1.5
      saved: true,            // Is the current work persisted
      fullscreen: false,      // Fullscreen state
      sidebarCollapsed: false,// Sidebar collapse state
      searchQuery: "",        // Search search term
      currentSearchIndex: -1, // Current highlight item index
      searchResultsCount: 0,  // Total highlights found
    };
    
    this._listeners = {};
  }

  /**
   * Get a state value
   * @param {string} key 
   */
  get(key) {
    return this._state[key];
  }

  /**
   * Set a state value and notify subscribers
   * @param {string} key 
   * @param {any} value 
   */
  set(key, value) {
    // Basic structural comparison for nested updates (like currentDoc or arrays)
    if (JSON.stringify(this._state[key]) === JSON.stringify(value)) {
      return;
    }
    
    this._state[key] = value;
    this.notify(key, value);
  }

  /**
   * Set key-value without triggering immediate notification
   * @param {string} key 
   * @param {any} value 
   */
  setSilent(key, value) {
    this._state[key] = value;
  }

  /**
   * Register a state change listener
   * @param {string} key 
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this._listeners[key]) {
      this._listeners[key] = [];
    }
    this._listeners[key].push(callback);
    
    // Call back immediately with initial value
    callback(this._state[key]);
    
    return () => {
      this._listeners[key] = this._listeners[key].filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners of a state change
   * @param {string} key 
   * @param {any} value 
   */
  notify(key, value) {
    if (this._listeners[key]) {
      this._listeners[key].forEach(callback => {
        try {
          callback(value);
        } catch (err) {
          console.error(`Error in state listener for key "${key}":`, err);
        }
      });
    }
  }
}

export const state = new StateManager();
