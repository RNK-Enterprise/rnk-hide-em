import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateHotbarStyles } from "../scripts/styles.js";
import { SETTINGS, CSS_IDS } from "../scripts/constants.js";

function setDefaults(overrides = {}) {
  __testUtils.setSettings({
    [SETTINGS.HIDDEN_SLOTS]: {},
    [SETTINGS.HIDE_BACKGROUND]: false,
    [SETTINGS.APPLY_TO_GM]: false,
    [SETTINGS.HIDE_LEFT_CONTROLS]: false,
    [SETTINGS.HIDE_RIGHT_CONTROLS]: false,
    [SETTINGS.HIDE_SIDEBAR]: false,
    [SETTINGS.HIDE_SCENE_CONTROLS]: false,
    [SETTINGS.HIDE_ENTIRE_HOTBAR]: false,
    [SETTINGS.HIDE_CHAT]: false,
    [SETTINGS.HIDE_PLAYERS]: false,
    [SETTINGS.HIDE_SCENE_NAVIGATION]: false,
    [SETTINGS.HIDE_MACRO_DIRECTORY]: false,
    [SETTINGS.HIDDEN_SIDEBAR_TABS]: [],
    [SETTINGS.OPACITY]: 100,
    [SETTINGS.ANIMATION_DURATION]: 300,
    [SETTINGS.HIDDEN_PAGES]: [],
    [SETTINGS.PER_PLAYER_SETTINGS]: {},
    ...overrides
  });
}

describe("styles", () => {
  beforeEach(() => {
    __testUtils.resetSettings();
    vi.clearAllMocks();
    document.getElementById(CSS_IDS.STYLE_ELEMENT)?.remove();
  });

  it("applies per-player settings and hidden UI elements", () => {
    game.user.isGM = false;
    const userId = game.user.id;
    setDefaults({
      [SETTINGS.PER_PLAYER_SETTINGS]: {
        [userId]: {
          hiddenSlots: { 1: true },
          hideBackground: true,
          hideLeftControls: true,
          hideRightControls: true,
          hideSidebar: false,
          hideSceneControls: true,
          hideEntireHotbar: true,
          hideChat: true,
          hidePlayers: true,
          hideSceneNavigation: true,
          hiddenPages: [1],
          hiddenSidebarTabs: ["chat"]
        }
      },
      [SETTINGS.HIDE_MACRO_DIRECTORY]: true,
      [SETTINGS.OPACITY]: 80,
      [SETTINGS.ANIMATION_DURATION]: 150
    });

    updateHotbarStyles();
    const css = document.getElementById(CSS_IDS.STYLE_ELEMENT).textContent;
    expect(css).toContain("#hotbar");
    expect(css).toContain('data-slot="1"');
    expect(css).toContain("#sidebar-tabs");
    expect(css).toContain('data-tab="macros"');
    expect(css).toContain("#chat");
    expect(css).toContain("#players");
    expect(css).toContain("#navigation");
    expect(css).toContain("#controls");
  });

  it("uses per-player defaults when settings are missing", () => {
    game.user.isGM = false;
    const userId = game.user.id;
    setDefaults({
      [SETTINGS.PER_PLAYER_SETTINGS]: {
        [userId]: {}
      }
    });

    updateHotbarStyles();
    const css = document.getElementById(CSS_IDS.STYLE_ELEMENT).textContent;
    expect(css).toContain("#hotbar");
  });

  it("handles GM settings without applyToGM", () => {
    game.user.isGM = true;
    setDefaults({
      [SETTINGS.APPLY_TO_GM]: false,
      [SETTINGS.HIDE_ENTIRE_HOTBAR]: true,
      [SETTINGS.HIDDEN_SLOTS]: { 2: true },
      [SETTINGS.HIDE_CHAT]: false,
      [SETTINGS.HIDE_SCENE_CONTROLS]: true,
      [SETTINGS.HIDE_SCENE_NAVIGATION]: false
    });

    updateHotbarStyles();
    const css = document.getElementById(CSS_IDS.STYLE_ELEMENT).textContent;
    expect(css).not.toContain('data-slot="2"');
    expect(css).toContain("#controls");
    expect(css).toContain("#navigation");
  });

  it("uses global settings with applyToGM and visible states", () => {
    game.user.isGM = true;
    setDefaults({
      [SETTINGS.APPLY_TO_GM]: true,
      [SETTINGS.HIDE_LEFT_CONTROLS]: false,
      [SETTINGS.HIDE_RIGHT_CONTROLS]: false,
      [SETTINGS.HIDE_SIDEBAR]: false
    });

    updateHotbarStyles();
    const css = document.getElementById(CSS_IDS.STYLE_ELEMENT).textContent;
    expect(css).toContain("#hotbar .bar-controls:first-child");
    expect(css).toContain("#sidebar {");
    expect(css).toContain("opacity: 1");
  });

  it("hides the sidebar when configured", () => {
    game.user.isGM = false;
    setDefaults({
      [SETTINGS.HIDE_SIDEBAR]: true
    });

    updateHotbarStyles();
    const css = document.getElementById(CSS_IDS.STYLE_ELEMENT).textContent;
    expect(css).toContain("#sidebar {");
    expect(css).toContain("visibility: hidden");
  });
});
