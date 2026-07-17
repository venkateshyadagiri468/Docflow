/* Theme Controller */

import { state } from "./state.js";
import { THEMES } from "../utils/constants.js";

/**
 * Initializes theme management by loading the theme from storage 
 * and subscribing to state changes to toggle CSS classes on body.
 */
export function initTheme() {
  const savedTheme = localStorage.getItem("docflow_theme") || THEMES.LIGHT;
  state.set("theme", savedTheme);

  // Monitor theme changes
  state.subscribe("theme", (newTheme) => {
    document.body.classList.remove("theme-light", "theme-dark", "theme-sepia");
    
    if (newTheme === THEMES.DARK) {
      document.body.classList.add("theme-dark");
    } else if (newTheme === THEMES.SEPIA) {
      document.body.classList.add("theme-sepia");
    } else {
      document.body.classList.add("theme-light");
    }
    
    localStorage.setItem("docflow_theme", newTheme);
  });
}
