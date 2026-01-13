import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllPresets, savePreset, loadPreset, deletePreset } from "../scripts/features/presets.js";
import { SETTINGS } from "../scripts/constants.js";

describe("presets", () => {
  beforeEach(() => {
    __testUtils.resetSettings();
    vi.clearAllMocks();
  });

  it("returns built-in and custom presets", () => {
    __testUtils.setSettings({
      [SETTINGS.PRESETS]: [{ name: "Custom", config: { opacity: 50 } }]
    });
    const presets = getAllPresets();
    expect(presets.some((preset) => preset.name === "Custom")).toBe(true);
    expect(presets.some((preset) => preset.builtIn)).toBe(true);
  });

  it("returns built-ins when no presets are stored", () => {
    __testUtils.resetSettings();
    const presets = getAllPresets();
    expect(presets.length).toBeGreaterThan(0);
  });

  it("saves presets and blocks duplicates", async () => {
    __testUtils.resetSettings();
    const auto = await savePreset("Auto");
    expect(auto).toBe(true);

    __testUtils.setSettings({ [SETTINGS.PRESETS]: [] });

    const emptyResult = await savePreset(" ");
    expect(emptyResult).toBe(false);
    expect(ui.notifications.warning).toHaveBeenCalled();

    const first = await savePreset("New Preset");
    expect(first).toBe(true);

    const duplicate = await savePreset("New Preset");
    expect(duplicate).toBe(false);
    expect(ui.notifications.warning).toHaveBeenCalled();
  });

  it("loads presets and handles missing presets", async () => {
    __testUtils.setSettings({
      [SETTINGS.PRESETS]: []
    });

    const missing = await loadPreset("Missing");
    expect(missing).toBe(false);
    expect(ui.notifications.error).toHaveBeenCalled();

    const loaded = await loadPreset("Minimal");
    expect(loaded).toBe(true);
    expect(game.settings.set).toHaveBeenCalledWith(
      expect.any(String),
      SETTINGS.ACTIVE_PRESET,
      "Minimal"
    );

    __testUtils.setSettings({
      [SETTINGS.PRESETS]: [{ name: "Sparse", config: { hiddenSlots: {} } }]
    });
    const sparseLoaded = await loadPreset("Sparse");
    expect(sparseLoaded).toBe(true);
  });

  it("deletes custom presets and blocks built-ins", async () => {
    __testUtils.setSettings({
      [SETTINGS.PRESETS]: [{ name: "User", config: {}, builtIn: false }]
    });

    const removed = await deletePreset("User");
    expect(removed).toBe(true);

    __testUtils.setSettings({
      [SETTINGS.PRESETS]: [{ name: "BuiltIn", config: {}, builtIn: true }]
    });
    const blocked = await deletePreset("BuiltIn");
    expect(blocked).toBe(false);
    expect(ui.notifications.warning).toHaveBeenCalled();

    __testUtils.setSettings({ [SETTINGS.PRESETS]: [] });
    const missing = await deletePreset("Missing");
    expect(missing).toBe(false);
    expect(ui.notifications.error).toHaveBeenCalled();

    __testUtils.resetSettings();
    const missingWithNoStore = await deletePreset("Missing");
    expect(missingWithNoStore).toBe(false);
  });
});
