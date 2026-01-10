/**
 * Copyright © 2025 Asgard Innovations / RNK™
 * All Rights Reserved
 */

import { MODULE_ID, SETTINGS, HOTBAR } from "./constants.js";
import { getSetting, setSetting, isValidSlot, log, notify } from "./utils.js";
import { updateHotbarStyles } from "./styles.js";

/**
 * Configuration form for Hide Hotbar Buttons
 */
export class HideHotbarConfig extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: game.i18n.localize("RNKHTM.Config.Title"),
      id: "hide-hotbar-config",
      template: `modules/${MODULE_ID}/templates/settings.html`,
      width: 700,
      height: "auto",
      closeOnSubmit: true,
      tabs: [
        {
          navSelector: ".main-tabs",
          contentSelector: ".content",
          initial: "gm"
        }
      ]
    });
  }

  getData() {
    const hiddenSlots = getSetting(SETTINGS.HIDDEN_SLOTS);
    const hideBackground = getSetting(SETTINGS.HIDE_BACKGROUND);
    const applyToGM = getSetting(SETTINGS.APPLY_TO_GM);
    const hideLeftControls = getSetting(SETTINGS.HIDE_LEFT_CONTROLS);
    const hideRightControls = getSetting(SETTINGS.HIDE_RIGHT_CONTROLS);
    const hideSidebar = getSetting(SETTINGS.HIDE_SIDEBAR);
    const hideSceneControls = getSetting(SETTINGS.HIDE_SCENE_CONTROLS);
    const hideEntireHotbar = getSetting(SETTINGS.HIDE_ENTIRE_HOTBAR);
    const hideChat = getSetting(SETTINGS.HIDE_CHAT);
    const hidePlayers = getSetting(SETTINGS.HIDE_PLAYERS);
    const hideSceneNavigation = getSetting(SETTINGS.HIDE_SCENE_NAVIGATION);
    const hiddenSidebarTabs = getSetting(SETTINGS.HIDDEN_SIDEBAR_TABS) || [];
    const opacity = getSetting(SETTINGS.OPACITY);
    const animationDuration = getSetting(SETTINGS.ANIMATION_DURATION);
    const hiddenPages = getSetting(SETTINGS.HIDDEN_PAGES);
    const presets = getSetting(SETTINGS.PRESETS);
    const activePreset = getSetting(SETTINGS.ACTIVE_PRESET);
    const perPlayerSettings = getSetting(SETTINGS.PER_PLAYER_SETTINGS) || {};
    
    log(`getData: hiddenSidebarTabs from settings: ${hiddenSidebarTabs.join(", ")}`);

    // Build slots array
    const slots = [];
    for (let i = 1; i <= HOTBAR.MAX_SLOTS; i++) {
      slots.push({
        n: i,
        hidden: hiddenSlots[i] || false,
        page: Math.ceil(i / HOTBAR.SLOTS_PER_PAGE)
      });
    }

    // Build pages array
    const pages = [];
    for (let i = 1; i <= HOTBAR.MAX_PAGES; i++) {
      pages.push({
        n: i,
        hidden: hiddenPages.includes(i)
      });
    }

    // Build sidebar tabs array
    const sidebarTabs = [
      { id: "chat", label: "Chat Log", icon: "fas fa-comments" },
      { id: "combat", label: "Combat Tracker", icon: "fas fa-swords" },
      { id: "scenes", label: "Scene Directory", icon: "fas fa-map" },
      { id: "actors", label: "Actor Directory", icon: "fas fa-users" },
      { id: "items", label: "Item Directory", icon: "fas fa-suitcase" },
      { id: "journal", label: "Journal Notes", icon: "fas fa-book-open" },
      { id: "tables", label: "Rollable Tables", icon: "fas fa-th-list" },
      { id: "cards", label: "Card Stacks", icon: "fas fa-cards" },
      { id: "playlists", label: "Audio Playlists", icon: "fas fa-music" },
      { id: "compendium", label: "Compendium Packs", icon: "fas fa-atlas" },
      { id: "settings", label: "Game Settings", icon: "fas fa-cogs" },
      { id: "macros", label: "Macro Directory", icon: "fas fa-code" }
    ].map(tab => ({
      ...tab,
      hidden: hiddenSidebarTabs.includes(tab.id)
    }));

    // Build players array with their settings
    const players = game.users.filter(u => !u.isGM).map(user => ({
      id: user.id,
      name: user.name,
      color: user.color,
      settings: perPlayerSettings[user.id] || {}
    }));

    return {
      slots,
      pages,
      sidebarTabs,
      players,
      hideBackground,
      applyToGM,
      hideLeftControls,
      hideRightControls,
      hideSidebar,
      hideSceneControls,
      hideEntireHotbar,
      hideChat,
      hidePlayers,
      hideSceneNavigation,
      opacity,
      animationDuration,
      presets,
      activePreset,
      logoUrl: `modules/${MODULE_ID}/assets/rnk-0.jpg`
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Select all/none buttons
    html.find(".select-all-slots").click(() => this._selectAllSlots(html, true));
    html.find(".select-none-slots").click(() => this._selectAllSlots(html, false));
    
    // Page selection
    html.find(".page-checkbox").change((ev) => this._onPageCheckboxChange(ev, html));
    
    // Preset buttons
    html.find(".save-preset").click(() => this._savePreset(html));
    html.find(".load-preset").change((ev) => this._loadPreset(ev));
    html.find(".delete-preset").click(() => this._deletePreset(html));
    
    // Export/Import
    html.find(".export-config").click(() => this._exportConfig());
    html.find(".import-config").click(() => this._importConfig());

    // Per-player controls
    html.find(".select-all-player-slots").click((ev) => this._selectAllPlayerSlots(ev, html, true));
    html.find(".select-none-player-slots").click((ev) => this._selectAllPlayerSlots(ev, html, false));
    html.find(".page-checkbox-player").change((ev) => this._onPlayerPageCheckboxChange(ev, html));
  }

  _selectAllSlots(html, select) {
    html.find("input[name^='slot-']").prop("checked", select);
  }

  _onPageCheckboxChange(event, html) {
    const page = parseInt(event.target.dataset.page);
    const checked = event.target.checked;
    const slots = Array.from({ length: 10 }, (_, i) => (page - 1) * 10 + i + 1);
    
    slots.forEach(slot => {
      html.find(`input[name='slot-${slot}']`).prop("checked", checked);
    });
  }

  _selectAllPlayerSlots(event, html, select) {
    const playerId = $(event.target).data("player");
    html.find(`input[name^='player-${playerId}-slot-']`).prop("checked", select);
  }

  _onPlayerPageCheckboxChange(event, html) {
    const playerId = $(event.target).data("player");
    const page = parseInt($(event.target).data("page"));
    const checked = event.target.checked;
    const slots = Array.from({ length: 10 }, (_, i) => (page - 1) * 10 + i + 1);
    
    slots.forEach(slot => {
      html.find(`input[name='player-${playerId}-slot-${slot}']`).prop("checked", checked);
    });
  }

  async _savePreset() {
    const name = await Dialog.prompt({
      title: "Save Preset",
      content: "<input type=\"text\" name=\"preset-name\" placeholder=\"Preset Name\" autofocus>",
      callback: (html) => html.find("input[name='preset-name']").val()
    });

    if (!name) return;

    const presets = getSetting(SETTINGS.PRESETS) || [];
    const config = {
      hiddenSlots: getSetting(SETTINGS.HIDDEN_SLOTS),
      hideBackground: getSetting(SETTINGS.HIDE_BACKGROUND),
      hideLeftControls: getSetting(SETTINGS.HIDE_LEFT_CONTROLS),
      hideRightControls: getSetting(SETTINGS.HIDE_RIGHT_CONTROLS),
      opacity: getSetting(SETTINGS.OPACITY),
      hiddenPages: getSetting(SETTINGS.HIDDEN_PAGES)
    };

    presets.push({ name, config });
    await setSetting(SETTINGS.PRESETS, presets);
    notify(`Preset "${name}" saved!`, "info");
    this.render();
  }

  async _loadPreset(event) {
    const index = parseInt(event.target.value);
    const presets = getSetting(SETTINGS.PRESETS) || [];
    const preset = presets[index];

    if (!preset) return;

    const { config } = preset;
    await setSetting(SETTINGS.HIDDEN_SLOTS, config.hiddenSlots);
    await setSetting(SETTINGS.HIDE_BACKGROUND, config.hideBackground);
    await setSetting(SETTINGS.HIDE_LEFT_CONTROLS, config.hideLeftControls);
    await setSetting(SETTINGS.HIDE_RIGHT_CONTROLS, config.hideRightControls);
    await setSetting(SETTINGS.OPACITY, config.opacity);
    await setSetting(SETTINGS.HIDDEN_PAGES, config.hiddenPages);
    await setSetting(SETTINGS.ACTIVE_PRESET, preset.name);

    updateHotbarStyles();
    notify(`Preset "${preset.name}" loaded!`, "info");
    this.render();
  }

  async _deletePreset(html) {
    const select = html.find("select[name='load-preset']");
    const index = parseInt(select.val());
    const presets = getSetting(SETTINGS.PRESETS) || [];

    if (index < 0 || index >= presets.length) return;

    const confirmed = await Dialog.confirm({
      title: "Delete Preset",
      content: `<p>Are you sure you want to delete preset "${presets[index].name}"?</p>`
    });

    if (!confirmed) return;

    presets.splice(index, 1);
    await setSetting(SETTINGS.PRESETS, presets);
    notify("Preset deleted!", "info");
    this.render();
  }

  async _exportConfig() {
    const config = {
      hiddenSlots: getSetting(SETTINGS.HIDDEN_SLOTS),
      hideBackground: getSetting(SETTINGS.HIDE_BACKGROUND),
      applyToGM: getSetting(SETTINGS.APPLY_TO_GM),
      hideLeftControls: getSetting(SETTINGS.HIDE_LEFT_CONTROLS),
      hideRightControls: getSetting(SETTINGS.HIDE_RIGHT_CONTROLS),
      opacity: getSetting(SETTINGS.OPACITY),
      animationDuration: getSetting(SETTINGS.ANIMATION_DURATION),
      hiddenPages: getSetting(SETTINGS.HIDDEN_PAGES),
      presets: getSetting(SETTINGS.PRESETS)
    };

    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rnk-htm-config.json";
    a.click();
    URL.revokeObjectURL(url);
    notify("Configuration exported!", "info");
  }

  async _importConfig() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const config = JSON.parse(text);

        // Validate and apply
        if (config.hiddenSlots) await setSetting(SETTINGS.HIDDEN_SLOTS, config.hiddenSlots);
        if (config.hideBackground !== undefined) await setSetting(SETTINGS.HIDE_BACKGROUND, config.hideBackground);
        if (config.applyToGM !== undefined) await setSetting(SETTINGS.APPLY_TO_GM, config.applyToGM);
        if (config.hideLeftControls !== undefined) await setSetting(SETTINGS.HIDE_LEFT_CONTROLS, config.hideLeftControls);
        if (config.hideRightControls !== undefined) await setSetting(SETTINGS.HIDE_RIGHT_CONTROLS, config.hideRightControls);
        if (config.opacity !== undefined) await setSetting(SETTINGS.OPACITY, config.opacity);
        if (config.animationDuration !== undefined) await setSetting(SETTINGS.ANIMATION_DURATION, config.animationDuration);
        if (config.hiddenPages) await setSetting(SETTINGS.HIDDEN_PAGES, config.hiddenPages);
        if (config.presets) await setSetting(SETTINGS.PRESETS, config.presets);

        updateHotbarStyles();
        notify("Configuration imported!", "info");
        this.render();
      } catch (error) {
        log(`Error importing config: ${error}`, "error");
        notify("Error importing configuration!", "error");
      }
    };

    input.click();
  }

  async _updateObject(event, formData) {
    try {
      const hiddenSlots = {};
      const hiddenPages = [];
      const hiddenSidebarTabs = [];
      const perPlayerSettings = {};

      // Process slots
      for (let i = 1; i <= HOTBAR.MAX_SLOTS; i++) {
        if (!isValidSlot(i)) continue;
        hiddenSlots[i] = formData[`slot-${i}`] || false;
      }

      // Process pages
      for (let i = 1; i <= HOTBAR.MAX_PAGES; i++) {
        if (formData[`page-${i}`]) {
          hiddenPages.push(i);
        }
      }

      // Process sidebar tabs
      const tabIds = ["chat", "combat", "scenes", "actors", "items", "journal", "tables", "cards", "playlists", "compendium", "settings"];
      tabIds.forEach(id => {
        const key = `sidebar-tab-${id}`;
        if (formData[key]) {
          hiddenSidebarTabs.push(id);
        }
      });

      // Process per-player settings
      game.users.filter(u => !u.isGM).forEach(user => {
        const playerSettings = {
          hideSceneControls: formData[`player-${user.id}-hideSceneControls`] || false,
          hideSidebar: formData[`player-${user.id}-hideSidebar`] || false,
          hideEntireHotbar: formData[`player-${user.id}-hideEntireHotbar`] || false,
          hideBackground: formData[`player-${user.id}-hideBackground`] || false,
          hideLeftControls: formData[`player-${user.id}-hideLeftControls`] || false,
          hideRightControls: formData[`player-${user.id}-hideRightControls`] || false,
          hideChat: formData[`player-${user.id}-hideChat`] || false,
          hidePlayers: formData[`player-${user.id}-hidePlayers`] || false,
          hideSceneNavigation: formData[`player-${user.id}-hideSceneNavigation`] || false,
          hiddenSlots: {},
          hiddenPages: [],
          hiddenSidebarTabs: []
        };

        // Process player-specific slots
        for (let i = 1; i <= HOTBAR.MAX_SLOTS; i++) {
          if (formData[`player-${user.id}-slot-${i}`]) {
            playerSettings.hiddenSlots[i] = true;
          }
        }

        // Process player-specific pages
        for (let i = 1; i <= HOTBAR.MAX_PAGES; i++) {
          if (formData[`player-${user.id}-page-${i}`]) {
            playerSettings.hiddenPages.push(i);
          }
        }

        // Process player-specific sidebar tabs
        const sidebarTabIds = ["chat", "combat", "scenes", "actors", "items", "journal", "tables", "cards", "playlists", "compendium", "settings"];
        sidebarTabIds.forEach(id => {
          const key = `player-${user.id}-sidebar-tab-${id}`;
          if (formData[key]) {
            playerSettings.hiddenSidebarTabs.push(id);
          }
        });

        perPlayerSettings[user.id] = playerSettings;
      });

      log(`Saving settings. FormData:`, "log");
      console.log(formData);
      log(`Hidden tabs to save: ${hiddenSidebarTabs.join(", ")}`);

      await setSetting(SETTINGS.HIDDEN_SLOTS, hiddenSlots);
      await setSetting(SETTINGS.HIDE_BACKGROUND, formData.hideBackground || false);
      await setSetting(SETTINGS.APPLY_TO_GM, formData.applyToGM || false);
      await setSetting(SETTINGS.HIDE_LEFT_CONTROLS, formData.hideLeftControls || false);
      await setSetting(SETTINGS.HIDE_RIGHT_CONTROLS, formData.hideRightControls || false);
      await setSetting(SETTINGS.HIDE_SIDEBAR, formData.hideSidebar || false);
      await setSetting(SETTINGS.HIDE_SCENE_CONTROLS, formData.hideSceneControls || false);
      await setSetting(SETTINGS.HIDE_ENTIRE_HOTBAR, formData.hideEntireHotbar || false);
      await setSetting(SETTINGS.HIDE_CHAT, formData.hideChat || false);
      await setSetting(SETTINGS.HIDE_PLAYERS, formData.hidePlayers || false);
      await setSetting(SETTINGS.HIDE_SCENE_NAVIGATION, formData.hideSceneNavigation || false);
      await setSetting(SETTINGS.HIDDEN_SIDEBAR_TABS, hiddenSidebarTabs);
      await setSetting(SETTINGS.OPACITY, parseInt(formData.opacity) || 100);
      await setSetting(SETTINGS.ANIMATION_DURATION, parseInt(formData.animationDuration) || 300);
      await setSetting(SETTINGS.HIDDEN_PAGES, hiddenPages);
      await setSetting(SETTINGS.PER_PLAYER_SETTINGS, perPlayerSettings);
      
      updateHotbarStyles();
      notify("Settings saved!", "info");
    } catch (error) {
      log(`Error saving settings: ${error}`, "error");
      notify("Error saving settings!", "error");
    }
  }
}
