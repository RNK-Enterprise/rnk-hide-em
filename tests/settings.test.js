import { describe, it, expect, vi, beforeEach } from "vitest";
import { SETTINGS } from "../scripts/constants.js";

const updateHotbarStyles = vi.fn();

vi.mock("../scripts/styles.js", () => ({
  updateHotbarStyles
}));

describe("settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers all module settings and menu", async () => {
    const { registerSettings } = await import("../scripts/settings.js");
    registerSettings();

    const registeredKeys = game.settings.register.mock.calls.map((call) => call[1]);
    expect(registeredKeys).toContain(SETTINGS.HIDDEN_SLOTS);
    expect(registeredKeys).toContain(SETTINGS.HIDE_MACRO_DIRECTORY);
    expect(game.settings.registerMenu).toHaveBeenCalled();

    game.settings.register.mock.calls.forEach((call) => {
      const options = call[2];
      if (options.onChange) {
        options.onChange();
      }
    });
    expect(updateHotbarStyles).toHaveBeenCalled();
  });
});
