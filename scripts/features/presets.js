/**
 * Copyright © 2025 Asgard Innovations / RNK™
 * All Rights Reserved
 * 
 * Presets Feature Module
 */

import { SETTINGS } from "../constants.js";
import { getSetting, setSetting, notify } from "../utils.js";

/**
 * Built-in preset configurations
 */
const BUILTIN_PRESETS = {
  "Combat Only": {
    hiddenSlots: {},
    hideBackground: false,
    hideLeftControls: false,
    hideRightControls: false,
    opacity: 100,
    hiddenPages: []
  },
  "RP Mode": {
    hiddenSlots: {},
    hideBackground: true,
    hideLeftControls: true,
    hideRightControls: true,
    opacity: 80,
    hiddenPages: []
  },
  "Minimal": {
    hiddenSlots: {},
    hideBackground: true,
    hideLeftControls: true,
    hideRightControls: true,
    opacity: 60,
    hiddenPages: [3, 4, 5]
  },
  "Clean Slate": {
    hiddenSlots: {},
    hideBackground: false,
    hideLeftControls: false,
    hideRightControls: false,
    opacity: 100,
    hiddenPages: []
  }
};

/**
 * Get all presets (built-in + custom)
 * @returns {Array} Array of preset objects
 */
export function getAllPresets() {
  const customPresets = getSetting(SETTINGS.PRESETS) || [];
  const builtIn = Object.entries(BUILTIN_PRESETS).map(([name, config]) => ({
    name,
    config,
    builtIn: true
  }));
  return [...builtIn, ...customPresets];
}

/**
 * Save current configuration as preset
 * @param {string} name - Preset name
 */
export async function savePreset(name) {
  if (!name || !name.trim()) {
    notify("Preset name cannot be empty!", "warning");
    return false;
  }

  const presets = getSetting(SETTINGS.PRESETS) || [];
  
  // Check if name already exists
  if (presets.some(p => p.name === name)) {
    notify(`Preset "${name}" already exists!`, "warning");
    return false;
  }

  const config = {
    hiddenSlots: getSetting(SETTINGS.HIDDEN_SLOTS),
    hideBackground: getSetting(SETTINGS.HIDE_BACKGROUND),
    hideLeftControls: getSetting(SETTINGS.HIDE_LEFT_CONTROLS),
    hideRightControls: getSetting(SETTINGS.HIDE_RIGHT_CONTROLS),
    opacity: getSetting(SETTINGS.OPACITY),
    hiddenPages: getSetting(SETTINGS.HIDDEN_PAGES)
  };

  presets.push({ name, config, builtIn: false });
  await setSetting(SETTINGS.PRESETS, presets);
  notify(`Preset "${name}" saved!`, "info");
  return true;
}

/**
 * Load a preset by name
 * @param {string} name - Preset name
 */
export async function loadPreset(name) {
  const allPresets = getAllPresets();
  const preset = allPresets.find(p => p.name === name);

  if (!preset) {
    notify(`Preset "${name}" not found!`, "error");
    return false;
  }

  const { config } = preset;
  await setSetting(SETTINGS.HIDDEN_SLOTS, config.hiddenSlots);
  await setSetting(SETTINGS.HIDE_BACKGROUND, config.hideBackground);
  await setSetting(SETTINGS.HIDE_LEFT_CONTROLS, config.hideLeftControls);
  await setSetting(SETTINGS.HIDE_RIGHT_CONTROLS, config.hideRightControls);
  await setSetting(SETTINGS.OPACITY, config.opacity);
  await setSetting(SETTINGS.HIDDEN_PAGES, config.hiddenPages || []);
  await setSetting(SETTINGS.ACTIVE_PRESET, name);

  notify(`Preset "${name}" loaded!`, "info");
  return true;
}

/**
 * Delete a custom preset
 * @param {string} name - Preset name
 */
export async function deletePreset(name) {
  const presets = getSetting(SETTINGS.PRESETS) || [];
  const index = presets.findIndex(p => p.name === name);

  if (index === -1) {
    notify(`Preset "${name}" not found!`, "error");
    return false;
  }

  if (presets[index].builtIn) {
    notify("Cannot delete built-in preset!", "warning");
    return false;
  }

  presets.splice(index, 1);
  await setSetting(SETTINGS.PRESETS, presets);
  notify(`Preset "${name}" deleted!`, "info");
  return true;
}
