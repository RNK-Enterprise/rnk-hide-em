import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  exportConfiguration,
  processImportedFile,
  importConfiguration,
  shareConfiguration,
  loadSharedConfiguration
} from "../scripts/features/export-import.js";
import { SETTINGS } from "../scripts/constants.js";

function makeFile(data) {
  return {
    text: () => Promise.resolve(JSON.stringify(data))
  };
}

describe("export/import", () => {
  beforeEach(() => {
    __testUtils.resetSettings();
    vi.clearAllMocks();

    globalThis.URL.createObjectURL = vi.fn(() => "blob:url");
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  it("exports configuration", () => {
    const originalCreate = document.createElement.bind(document);
    const anchor = originalCreate("a");
    anchor.click = vi.fn();
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "a") return anchor;
      return originalCreate(tag);
    });
    const appendSpy = vi.spyOn(document.body, "appendChild");
    const removeSpy = vi.spyOn(document.body, "removeChild");

    exportConfiguration();

    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(ui.notifications.info).toHaveBeenCalled();
  });

  it("processes imported files with validation and confirmation", async () => {
    const empty = await processImportedFile(null);
    expect(empty).toBe(false);

    const invalid = await processImportedFile(makeFile({}));
    expect(invalid).toBe(false);
    expect(ui.notifications.error).toHaveBeenCalled();

    Dialog.confirm.mockResolvedValueOnce(false);
    const blocked = await processImportedFile(
      makeFile({ version: "2.0.4", exportDate: new Date().toISOString(), settings: {} })
    );
    expect(blocked).toBe(false);

    Dialog.confirm.mockResolvedValueOnce(true);
    const applied = await processImportedFile(
      makeFile({
        version: "2.0.4",
        exportDate: new Date().toISOString(),
        settings: { hideBackground: true }
      })
    );
    expect(applied).toBe(true);
    expect(game.settings.set).toHaveBeenCalledWith(
      expect.any(String),
      SETTINGS.HIDE_BACKGROUND,
      true
    );

    Dialog.confirm.mockResolvedValueOnce(true);
    await processImportedFile(
      makeFile({
        version: "2.0.4",
        exportDate: new Date().toISOString(),
        settings: {
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
          opacity: 50,
          animationDuration: 200,
          hiddenPages: [1],
          hiddenSidebarTabs: ["chat"],
          presets: [],
          perPlayerSettings: {}
        }
      })
    );
  });

  it("imports configuration through the file input", async () => {
    const file = makeFile({
      version: "2.0.4",
      exportDate: new Date().toISOString(),
      settings: { hideBackground: true }
    });
    const input = {
      type: "",
      accept: "",
      onchange: null,
      click: vi.fn(() => {
        input.onchange({ target: { files: [file] } });
      })
    };

    const createSpy = vi.spyOn(document, "createElement").mockReturnValue(input);
    Dialog.confirm.mockResolvedValueOnce(true);

    const result = await importConfiguration();
    expect(result).toBe(true);
    expect(createSpy).toHaveBeenCalledWith("input");
  });

  it("shares configuration and loads shared configuration", async () => {
    __testUtils.setSettings({
      [SETTINGS.HIDDEN_SLOTS]: { 1: true }
    });

    const base64 = shareConfiguration();
    expect(base64).toBeTypeOf("string");
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    navigator.clipboard.writeText.mockRejectedValueOnce(new Error("nope"));
    shareConfiguration();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(ui.notifications.error).toHaveBeenCalled();

    const invalid = await loadSharedConfiguration(btoa(JSON.stringify({})));
    expect(invalid).toBe(false);

    const valid = await loadSharedConfiguration(base64);
    expect(valid).toBe(true);
  });
});
