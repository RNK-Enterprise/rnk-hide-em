/**
 * Copyright © 2025 Asgard Innovations / RNK™
 * All Rights Reserved
 * 
 * Main Module Entry Point
 */

import { log } from "./utils.js";
import { registerSettings } from "./settings.js";
import { initHook, readyHook, renderMacroDirectoryHook, hotbarCollapseHook } from "./hooks.js";

// Verification instance
let rnkVerification = null;

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

// Register init hook
Hooks.once("init", async () => {
  log("Initializing RNK Hide 'Em");
  
  // Initialize verification
  rnkVerification = new RNKVerification('rnk-hide-em', "RNK™ Hide 'Em");
  const isVerified = await rnkVerification.initialize();
  
  if (!isVerified) {
    console.warn("RNK Hide 'Em | Subscription verification required");
    ui.notifications.warn("RNK™ Hide 'Em requires an active Patreon subscription");
    return;
  }
  
  log("RNK Hide 'Em | Verified successfully");
  registerSettings();
  registerHandlebarsHelpers();
  initHook();
});

// Register ready hook
Hooks.once("ready", () => {
  if (!rnkVerification || !rnkVerification.isVerified) {
    console.warn("RNK Hide 'Em | Not verified, features disabled");
    return;
  }
  log("RNK Hide 'Em ready");
  readyHook();
});

// Register render hooks
Hooks.on("renderMacroDirectory", renderMacroDirectoryHook);
Hooks.on("collapseHotbar", hotbarCollapseHook);
Hooks.on("expandHotbar", hotbarCollapseHook);

log("Module loaded");
