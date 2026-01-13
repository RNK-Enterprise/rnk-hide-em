import { describe, it, expect, vi, beforeEach } from "vitest";
import { HideHotbarConfig } from "../scripts/config.js";
import { SETTINGS } from "../scripts/constants.js";
import * as styles from "../scripts/styles.js";
import * as utils from "../scripts/utils.js";

function makeHtmlMock() {
  const handlers = { click: {}, change: {} };
  return {
    handlers,
    find: vi.fn((selector) => ({
      click: (fn) => {
        handlers.click[selector] = fn;
      },
      change: (fn) => {
        handlers.change[selector] = fn;
      },
      prop: vi.fn(),
      val: vi.fn()
    }))
  };
}

describe("config", () => {
  beforeEach(() => {
    __testUtils.resetSettings();
    vi.clearAllMocks();
    game.users = [
      { id: "user-1", name: "Player One", isGM: false, color: "#111111" },
      { id: "user-2", name: "Player Two", isGM: false, color: "#222222" },
      { id: "gm-1", name: "GM", isGM: true, color: "#333333" }
    ];
  });

  it("builds data for the config template", () => {
    const options = HideHotbarConfig.defaultOptions;
    expect(options.id).toBe("hide-hotbar-config");

    __testUtils.setSettings({
      [SETTINGS.HIDDEN_SLOTS]: { 1: true },
      [SETTINGS.HIDDEN_PAGES]: [1],
      [SETTINGS.HIDDEN_SIDEBAR_TABS]: ["chat"],
      [SETTINGS.HIDE_MACRO_DIRECTORY]: true,
      [SETTINGS.PER_PLAYER_SETTINGS]: {
        "user-1": { hiddenSidebarTabs: ["macros"] }
      },
      [SETTINGS.PRESETS]: [],
      [SETTINGS.ACTIVE_PRESET]: null
    });

    const config = new HideHotbarConfig();
    const data = config.getData();
    expect(data.slots[0].hidden).toBe(true);
    expect(data.pages[0].hidden).toBe(true);
    expect(data.sidebarTabs.some((tab) => tab.id === "macros" && tab.hidden)).toBe(true);
    expect(data.players[0].sidebarTabs.some((tab) => tab.id === "macros")).toBe(true);
  });

  it("falls back to default settings when values are missing", () => {
    __testUtils.setSettings({
      [SETTINGS.HIDDEN_SLOTS]: {},
      [SETTINGS.HIDDEN_PAGES]: [],
      [SETTINGS.PRESETS]: []
    });
    game.users = [];

    const config = new HideHotbarConfig();
    const data = config.getData();
    expect(data.sidebarTabs.length).toBeGreaterThan(0);
    expect(data.players.length).toBe(0);
  });

  it("wires listeners and helper actions", async () => {
    const config = new HideHotbarConfig();
    const html = makeHtmlMock();
    vi.spyOn(config, "_savePreset").mockImplementation(async () => {});
    vi.spyOn(config, "_loadPreset").mockImplementation(async () => {});
    vi.spyOn(config, "_deletePreset").mockImplementation(async () => {});
    vi.spyOn(config, "_exportConfig").mockImplementation(() => {});
    vi.spyOn(config, "_importConfig").mockImplementation(async () => {});
    vi.spyOn(config, "_selectAllSlots").mockImplementation(() => {});
    vi.spyOn(config, "_onPageCheckboxChange").mockImplementation(() => {});
    vi.spyOn(config, "_selectAllPlayerSlots").mockImplementation(() => {});
    vi.spyOn(config, "_onPlayerPageCheckboxChange").mockImplementation(() => {});

    config.activateListeners(html);
    expect(html.find).toHaveBeenCalled();

    html.handlers.click[".select-all-slots"]();
    html.handlers.click[".select-none-slots"]();
    html.handlers.change[".page-checkbox"]({ target: { dataset: { page: "2" }, checked: true } });
    html.handlers.click[".save-preset"]();
    html.handlers.change[".load-preset"]({ target: { value: "0" } });
    html.handlers.click[".delete-preset"]();
    html.handlers.click[".export-config"]();
    html.handlers.click[".import-config"]();
    html.handlers.click[".select-all-player-slots"]({ target: { dataset: { player: "user-1" } } });
    html.handlers.click[".select-none-player-slots"]({ target: { dataset: { player: "user-1" } } });
    html.handlers.change[".page-checkbox-player"]({
      target: { dataset: { player: "user-1", page: "1" }, checked: true }
    });
  });

  it("applies helper selections directly", () => {
    const config = new HideHotbarConfig();
    const slotContainer = { find: vi.fn(() => ({ prop: vi.fn() })) };
    config._selectAllSlots(slotContainer, true);
    expect(slotContainer.find).toHaveBeenCalled();

    const pageHtml = { find: vi.fn(() => ({ prop: vi.fn() })) };
    const pageEvent = { target: { dataset: { page: "2" }, checked: true } };
    config._onPageCheckboxChange(pageEvent, pageHtml);
    expect(pageHtml.find).toHaveBeenCalled();

    const playerHtml = { find: vi.fn(() => ({ prop: vi.fn() })) };
    const playerEvent = { target: { dataset: { player: "user-1" } } };
    config._selectAllPlayerSlots(playerEvent, playerHtml, true);
    expect(playerHtml.find).toHaveBeenCalled();

    const playerPageEvent = { target: { dataset: { player: "user-1", page: "1" }, checked: true } };
    config._onPlayerPageCheckboxChange(playerPageEvent, playerHtml);
    expect(playerHtml.find).toHaveBeenCalled();
  });

  it("handles presets in the config UI", async () => {
    __testUtils.setSettings({ [SETTINGS.PRESETS]: [] });
    const config = new HideHotbarConfig();
    const renderSpy = vi.spyOn(config, "render").mockImplementation(() => {});

    Dialog.prompt.mockImplementationOnce(({ callback }) =>
      callback({ find: () => ({ val: () => "" }) })
    );
    await config._savePreset();
    expect(renderSpy).not.toHaveBeenCalled();

    __testUtils.resetSettings();
    Dialog.prompt.mockResolvedValueOnce("Preset Without Store");
    await config._savePreset();

    Dialog.prompt.mockResolvedValueOnce("New Preset");
    await config._savePreset();
    expect(ui.notifications.info).toHaveBeenCalled();

    __testUtils.setSettings({
      [SETTINGS.PRESETS]: [{ name: "Preset One", config: { hiddenSlots: {} } }]
    });
    await config._loadPreset({ target: { value: "0" } });
    expect(game.settings.set).toHaveBeenCalledWith(
      expect.any(String),
      SETTINGS.ACTIVE_PRESET,
      "Preset One"
    );

    await config._loadPreset({ target: { value: "99" } });
    __testUtils.resetSettings();
    await config._loadPreset({ target: { value: "0" } });

    const html = { find: vi.fn(() => ({ val: () => "0" })) };
    Dialog.confirm.mockResolvedValueOnce(false);
    await config._deletePreset(html);
    Dialog.confirm.mockResolvedValueOnce(true);
    await config._deletePreset(html);
    expect(ui.notifications.info).toHaveBeenCalled();

    const outOfRangeHtml = { find: vi.fn(() => ({ val: vi.fn(() => "-1") })) };
    await config._deletePreset(outOfRangeHtml);

    __testUtils.resetSettings();
    const missingHtml = { find: vi.fn(() => ({ val: vi.fn(() => "0") })) };
    await config._deletePreset(missingHtml);
  });

  it("deletes presets when confirmed", async () => {
    __testUtils.setSettings({
      [SETTINGS.PRESETS]: [{ name: "To Delete", config: {} }]
    });
    const config = new HideHotbarConfig();
    const html = { find: vi.fn(() => ({ val: vi.fn(() => "0") })) };

    expect(utils.getSetting(SETTINGS.PRESETS)).toHaveLength(1);
    Dialog.confirm.mockReset();
    Dialog.confirm.mockImplementationOnce(() => false);
    await config._deletePreset(html);
    Dialog.confirm.mockImplementationOnce(() => true);
    await config._deletePreset(html);
    expect(Dialog.confirm).toHaveBeenCalled();
    expect(game.settings.set).toHaveBeenCalledWith(
      expect.any(String),
      SETTINGS.PRESETS,
      []
    );
    expect(ui.notifications.info).toHaveBeenCalled();
  });

  it("exports and imports config payloads", async () => {
    const config = new HideHotbarConfig();
    const anchor = { click: vi.fn() };
    vi.spyOn(document, "createElement").mockReturnValue(anchor);
    globalThis.URL.createObjectURL = vi.fn(() => "blob:url");
    globalThis.URL.revokeObjectURL = vi.fn();

    config._exportConfig();
    expect(anchor.click).toHaveBeenCalled();

    const file = { text: () => Promise.resolve(JSON.stringify({ hiddenSlots: {} })) };
    const input = {
      type: "",
      accept: "",
      onchange: null,
      click: vi.fn(() => input.onchange({ target: { files: [file] } }))
    };
    vi.spyOn(document, "createElement").mockReturnValue(input);

    await config._importConfig();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(ui.notifications.info).toHaveBeenCalled();

    const fullConfigFile = {
      text: () =>
        Promise.resolve(
          JSON.stringify({
            hiddenSlots: { 1: true },
            hideBackground: true,
            applyToGM: true,
            hideLeftControls: true,
            hideRightControls: true,
            hideSidebar: true,
            hideSceneControls: true,
            hideEntireHotbar: true,
            hideChat: true,
            hidePlayers: true,
            hideSceneNavigation: true,
            hideMacroDirectory: true,
            opacity: 70,
            animationDuration: 250,
            hiddenPages: [1],
            hiddenSidebarTabs: ["chat"],
            presets: [],
            perPlayerSettings: {}
          })
        )
    };
    const fullInput = {
      type: "",
      accept: "",
      onchange: null,
      click: vi.fn(() => fullInput.onchange({ target: { files: [fullConfigFile] } }))
    };
    vi.spyOn(document, "createElement").mockReturnValue(fullInput);
    await config._importConfig();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const emptyInput = {
      type: "",
      accept: "",
      onchange: null,
      click: vi.fn(() => emptyInput.onchange({ target: { files: [] } }))
    };
    vi.spyOn(document, "createElement").mockReturnValue(emptyInput);
    await config._importConfig();
  });

  it("saves settings from the form", async () => {
    const config = new HideHotbarConfig();
    vi.spyOn(styles, "updateHotbarStyles").mockImplementation(() => {});

    const formData = {
      "slot-1": true,
      "page-1": true,
      "sidebar-tab-chat": true,
      "sidebar-tab-macros": true,
      "player-user-1-hideSceneControls": true,
      "player-user-1-slot-1": true,
      "player-user-1-page-1": true,
      "player-user-1-sidebar-tab-chat": true,
      hideBackground: true,
      applyToGM: true,
      hideLeftControls: true,
      hideRightControls: true,
      hideSidebar: true,
      hideSceneControls: true,
      hideEntireHotbar: true,
      hideChat: true,
      hidePlayers: true,
      hideSceneNavigation: true,
      hideMacroDirectory: true,
      opacity: "85",
      animationDuration: "400"
    };

    await config._updateObject({}, formData);
    expect(game.settings.set).toHaveBeenCalledWith(
      expect.any(String),
      SETTINGS.HIDE_MACRO_DIRECTORY,
      true
    );
    expect(styles.updateHotbarStyles).toHaveBeenCalled();
  });

  it("saves settings with empty form values", async () => {
    const config = new HideHotbarConfig();
    vi.spyOn(styles, "updateHotbarStyles").mockImplementation(() => {});
    vi.spyOn(utils, "isValidSlot").mockReturnValueOnce(false);

    await config._updateObject({}, {});
    expect(game.settings.set).toHaveBeenCalledWith(
      expect.any(String),
      SETTINGS.HIDE_BACKGROUND,
      false
    );
  });

  it("handles errors when saving settings", async () => {
    const config = new HideHotbarConfig();
    game.settings.set.mockImplementationOnce(() => {
      throw new Error("fail");
    });

    await config._updateObject({}, {});
    expect(ui.notifications.error).toHaveBeenCalled();
  });
});
