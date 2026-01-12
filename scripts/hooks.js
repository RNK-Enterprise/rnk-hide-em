/**
 * Copyright © 2025 Asgard Innovations / RNK™
 * All Rights Reserved
 */

import { MODULE_ID, KEYBINDINGS } from "./constants.js";
import { HideHotbarConfig } from "./config.js";
import { updateHotbarStyles } from "./styles.js";
import { log } from "./utils.js";

/**
 * Initialize hook - register keybindings
 */
export function initHook() {
  game.keybindings.register(MODULE_ID, KEYBINDINGS.OPEN_CONFIG, {
    name: "Open Configuration",
    hint: "Opens the Hide Hotbar Buttons configuration menu.",
    editable: [
      { key: "KeyH", modifiers: ["Control", "Alt"] }
    ],
    onDown: () => {
      if (game.user.isGM) {
        new HideHotbarConfig().render(true);
      }
    },
    restricted: true,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
}

/**
 * Ready hook - apply initial styles
 */
export function readyHook() {
  log("Applying hotbar styles");
  updateHotbarStyles();
}

/**
 * Render macro directory hook - add config button
 */
export function renderMacroDirectoryHook(app, html) {
  if (!game.user.isGM) return;

  const button = document.createElement("button");
  button.className = "rnk-hide-em-config";
  button.innerHTML = "<i class=\"fas fa-eye-slash\"></i> RNK Hide 'Em";
  button.addEventListener("click", () => {
    new HideHotbarConfig().render(true);
  });

  // Handle both jQuery array and DOM element
  const element = html[0] || html;
  if (!element || !element.querySelector) return;

  let footer = element.querySelector(".directory-footer");
  if (!footer) {
    footer = document.createElement("footer");
    footer.className = "directory-footer";
    element.appendChild(footer);
  }
  footer.appendChild(button);
}

/**
 * Hotbar collapse/expand hook - reapply styles
 */
export function hotbarCollapseHook() {
  setTimeout(() => updateHotbarStyles(), 100);
}
