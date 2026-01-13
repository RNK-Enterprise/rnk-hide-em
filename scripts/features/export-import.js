/**
 * Copyright © 2025 Asgard Innovations / RNK™
 * All Rights Reserved
 * 
 * Export/Import Feature Module
 */

import { SETTINGS } from "../constants.js";
import { getSetting, setSetting, notify, log } from "../utils.js";

/**
 * Export current configuration to JSON file
 */
export function exportConfiguration() {
  const config = {
    version: "2.0.4",
    exportDate: new Date().toISOString(),
    settings: {
      hiddenSlots: getSetting(SETTINGS.HIDDEN_SLOTS),
      hideBackground: getSetting(SETTINGS.HIDE_BACKGROUND),
      applyToGM: getSetting(SETTINGS.APPLY_TO_GM),
      hideLeftControls: getSetting(SETTINGS.HIDE_LEFT_CONTROLS),
      hideRightControls: getSetting(SETTINGS.HIDE_RIGHT_CONTROLS),
      hideSidebar: getSetting(SETTINGS.HIDE_SIDEBAR),
      hideSceneControls: getSetting(SETTINGS.HIDE_SCENE_CONTROLS),
      hideEntireHotbar: getSetting(SETTINGS.HIDE_ENTIRE_HOTBAR),
      hideChat: getSetting(SETTINGS.HIDE_CHAT),
      hidePlayers: getSetting(SETTINGS.HIDE_PLAYERS),
      hideSceneNavigation: getSetting(SETTINGS.HIDE_SCENE_NAVIGATION),
      hideMacroDirectory: getSetting(SETTINGS.HIDE_MACRO_DIRECTORY),
      opacity: getSetting(SETTINGS.OPACITY),
      animationDuration: getSetting(SETTINGS.ANIMATION_DURATION),
      hiddenPages: getSetting(SETTINGS.HIDDEN_PAGES),
      hiddenSidebarTabs: getSetting(SETTINGS.HIDDEN_SIDEBAR_TABS),
      presets: getSetting(SETTINGS.PRESETS),
      perPlayerSettings: getSetting(SETTINGS.PER_PLAYER_SETTINGS)
    }
  };

  const json = JSON.stringify(config, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `rnk-hide-em-config-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  notify("Configuration exported successfully!", "info");
  log("Configuration exported");
}

/**
 * Process imported configuration file
 * Extracted for testability
 * @param {File} file - The imported file
 * @returns {Promise<boolean>} Success status
 */
export async function processImportedFile(file) {
  if (!file) {
    return false;
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Validate format
    if (!data.settings || !data.version) {
      throw new Error("Invalid configuration file format");
    }

    // Show confirmation dialog
    const confirmed = await Dialog.confirm({
      title: "Import Configuration",
      content: `
        <p><strong>Import configuration?</strong></p>
        <p>Version: ${data.version}</p>
        <p>Exported: ${new Date(data.exportDate).toLocaleDateString()}</p>
        <p class="notification warning">This will overwrite your current settings!</p>
      `
    });

    if (!confirmed) {
      return false;
    }

    // Apply settings
    const settings = data.settings;
    if (settings.hiddenSlots) await setSetting(SETTINGS.HIDDEN_SLOTS, settings.hiddenSlots);
    if (settings.hideBackground !== undefined) await setSetting(SETTINGS.HIDE_BACKGROUND, settings.hideBackground);
    if (settings.applyToGM !== undefined) await setSetting(SETTINGS.APPLY_TO_GM, settings.applyToGM);
    if (settings.hideLeftControls !== undefined) await setSetting(SETTINGS.HIDE_LEFT_CONTROLS, settings.hideLeftControls);
    if (settings.hideRightControls !== undefined) await setSetting(SETTINGS.HIDE_RIGHT_CONTROLS, settings.hideRightControls);
    if (settings.hideSidebar !== undefined) await setSetting(SETTINGS.HIDE_SIDEBAR, settings.hideSidebar);
    if (settings.hideSceneControls !== undefined) await setSetting(SETTINGS.HIDE_SCENE_CONTROLS, settings.hideSceneControls);
    if (settings.hideEntireHotbar !== undefined) await setSetting(SETTINGS.HIDE_ENTIRE_HOTBAR, settings.hideEntireHotbar);
    if (settings.hideChat !== undefined) await setSetting(SETTINGS.HIDE_CHAT, settings.hideChat);
    if (settings.hidePlayers !== undefined) await setSetting(SETTINGS.HIDE_PLAYERS, settings.hidePlayers);
    if (settings.hideSceneNavigation !== undefined) await setSetting(SETTINGS.HIDE_SCENE_NAVIGATION, settings.hideSceneNavigation);
    if (settings.hideMacroDirectory !== undefined) await setSetting(SETTINGS.HIDE_MACRO_DIRECTORY, settings.hideMacroDirectory);
    if (settings.opacity !== undefined) await setSetting(SETTINGS.OPACITY, settings.opacity);
    if (settings.animationDuration !== undefined) await setSetting(SETTINGS.ANIMATION_DURATION, settings.animationDuration);
    if (settings.hiddenPages) await setSetting(SETTINGS.HIDDEN_PAGES, settings.hiddenPages);
    if (settings.hiddenSidebarTabs) await setSetting(SETTINGS.HIDDEN_SIDEBAR_TABS, settings.hiddenSidebarTabs);
    if (settings.presets) await setSetting(SETTINGS.PRESETS, settings.presets);
    if (settings.perPlayerSettings) await setSetting(SETTINGS.PER_PLAYER_SETTINGS, settings.perPlayerSettings);

    notify("Configuration imported successfully!", "info");
    log("Configuration imported");
    return true;
  } catch (error) {
    log(`Error importing config: ${error.message}`, "error");
    notify("Error importing configuration! Check console for details.", "error");
    return false;
  }
}

/**
 * Import configuration from JSON file
 * @returns {Promise<boolean>} Success status
 */
export function importConfiguration() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const result = await processImportedFile(file);
      resolve(result);
    };

    input.click();
  });
}

/**
 * Share configuration as Base64 string
 * @returns {string} Base64 encoded configuration
 */
export function shareConfiguration() {
  const config = {
    hiddenSlots: getSetting(SETTINGS.HIDDEN_SLOTS),
    hideBackground: getSetting(SETTINGS.HIDE_BACKGROUND),
    hideLeftControls: getSetting(SETTINGS.HIDE_LEFT_CONTROLS),
    hideRightControls: getSetting(SETTINGS.HIDE_RIGHT_CONTROLS),
    hideSidebar: getSetting(SETTINGS.HIDE_SIDEBAR),
    hideSceneControls: getSetting(SETTINGS.HIDE_SCENE_CONTROLS),
    hideEntireHotbar: getSetting(SETTINGS.HIDE_ENTIRE_HOTBAR),
    hideChat: getSetting(SETTINGS.HIDE_CHAT),
    hidePlayers: getSetting(SETTINGS.HIDE_PLAYERS),
    hideSceneNavigation: getSetting(SETTINGS.HIDE_SCENE_NAVIGATION),
    hideMacroDirectory: getSetting(SETTINGS.HIDE_MACRO_DIRECTORY),
    opacity: getSetting(SETTINGS.OPACITY),
    animationDuration: getSetting(SETTINGS.ANIMATION_DURATION),
    hiddenPages: getSetting(SETTINGS.HIDDEN_PAGES),
    hiddenSidebarTabs: getSetting(SETTINGS.HIDDEN_SIDEBAR_TABS),
    presets: getSetting(SETTINGS.PRESETS),
    perPlayerSettings: getSetting(SETTINGS.PER_PLAYER_SETTINGS)
  };

  const json = JSON.stringify(config);
  const base64 = btoa(json);
  
  // Copy to clipboard
  navigator.clipboard.writeText(base64).then(() => {
    notify("Configuration code copied to clipboard!", "info");
  }).catch(() => {
    notify("Failed to copy to clipboard", "error");
  });
  
  return base64;
}

/**
 * Load configuration from Base64 string
 * @param {string} base64 - Base64 encoded configuration
 * @returns {Promise<boolean>} Success status
 */
export async function loadSharedConfiguration(base64) {
  try {
    const json = atob(base64);
    const config = JSON.parse(json);

    // Validate
    if (!config.hiddenSlots) {
      throw new Error("Invalid configuration code");
    }

    // Apply
    await setSetting(SETTINGS.HIDDEN_SLOTS, config.hiddenSlots);
    await setSetting(SETTINGS.HIDE_BACKGROUND, config.hideBackground || false);
    await setSetting(SETTINGS.HIDE_LEFT_CONTROLS, config.hideLeftControls || false);
    await setSetting(SETTINGS.HIDE_RIGHT_CONTROLS, config.hideRightControls || false);
    await setSetting(SETTINGS.HIDE_SIDEBAR, config.hideSidebar || false);
    await setSetting(SETTINGS.HIDE_SCENE_CONTROLS, config.hideSceneControls || false);
    await setSetting(SETTINGS.HIDE_ENTIRE_HOTBAR, config.hideEntireHotbar || false);
    await setSetting(SETTINGS.HIDE_CHAT, config.hideChat || false);
    await setSetting(SETTINGS.HIDE_PLAYERS, config.hidePlayers || false);
    await setSetting(SETTINGS.HIDE_SCENE_NAVIGATION, config.hideSceneNavigation || false);
    await setSetting(SETTINGS.HIDE_MACRO_DIRECTORY, config.hideMacroDirectory || false);
    await setSetting(SETTINGS.OPACITY, config.opacity || 100);
    await setSetting(SETTINGS.ANIMATION_DURATION, config.animationDuration || 300);
    await setSetting(SETTINGS.HIDDEN_PAGES, config.hiddenPages || []);
    await setSetting(SETTINGS.HIDDEN_SIDEBAR_TABS, config.hiddenSidebarTabs || []);
    await setSetting(SETTINGS.PRESETS, config.presets || []);
    await setSetting(SETTINGS.PER_PLAYER_SETTINGS, config.perPlayerSettings || {});

    notify("Shared configuration loaded!", "info");
    return true;
  } catch (error) {
    log(`Error loading shared config: ${error.message}`, "error");
    notify("Invalid configuration code!", "error");
    return false;
  }
}
