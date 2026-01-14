/**
 * Copyright © 2025 Asgard Innovations / RNK™
 * All Rights Reserved
 *
 * Main Module Entry Point
 */

import { log } from "./utils.js";
import { registerSettings } from "./settings.js";
import { initHook, readyHook, renderMacroDirectoryHook, hotbarCollapseHook } from "./hooks.js";

/**
 * Handlebars helper functions - extracted for testability
 */
export function mathHelper(a, b) {
  return a * b;
}

export function subtractHelper(a, b) {
  return a - b;
}

export function multiplyHelper(a, b) {
  return a * b;
}

/**
 * Register all Handlebars helpers
 */
export function registerHandlebarsHelpers() {
  Handlebars.registerHelper('math', mathHelper);
  Handlebars.registerHelper('subtract', subtractHelper);
  Handlebars.registerHelper('multiply', multiplyHelper);
}

// ============================================================================
// CODEX REGISTRATION - Module Level (Before Hooks)
// ============================================================================
globalThis.RNK_MODULES = globalThis.RNK_MODULES || [];
globalThis.RNK_MODULES.push({
  id: 'rnk-hide-em',
  title: 'RNK Hide \'Em',
  icon: 'fas fa-eye-slash',
  order: 60,
  quantumPortal: true,
  onClick: () => {
    // Open the hide-em interface
    if (game.rnkHideEm?.openInterface) {
      game.rnkHideEm.openInterface();
    }
  }
});

log('RNK Hide \'Em | Registered with RNK Codex');

// Register init hook
Hooks.once("init", () => {
  log("Initializing RNK Hide 'Em v2.0.4");
  registerSettings();
  registerHandlebarsHelpers();
  initHook();
});

// Register ready hook
Hooks.once("ready", () => {
  log("RNK Hide 'Em ready");
  readyHook();
});

// Register render hooks
Hooks.on("renderMacroDirectory", renderMacroDirectoryHook);
Hooks.on("collapseHotbar", hotbarCollapseHook);
Hooks.on("expandHotbar", hotbarCollapseHook);

log("Module loaded");
