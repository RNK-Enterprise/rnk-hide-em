import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSetting,
  setSetting,
  isValidSlot,
  isValidPage,
  getSlotsForPage,
  toggleClass,
  updateStyleElement,
  log,
  notify
} from "../scripts/utils.js";
import { CSS_IDS, MODULE_ID } from "../scripts/constants.js";

describe("utils", () => {
  beforeEach(() => {
    __testUtils.resetSettings();
    vi.clearAllMocks();
  });

  it("gets and sets settings", async () => {
    __testUtils.setSettings({ testKey: "value" });
    expect(getSetting("testKey")).toBe("value");

    await setSetting("newKey", 123);
    expect(game.settings.set).toHaveBeenCalledWith(MODULE_ID, "newKey", 123);
    expect(getSetting("newKey")).toBe(123);
  });

  it("handles setting errors", async () => {
    const error = new Error("fail");
    game.settings.get.mockImplementationOnce(() => {
      throw error;
    });
    expect(getSetting("missing")).toBeNull();
    expect(ui.notifications.error).toHaveBeenCalled();

    game.settings.set.mockImplementationOnce(() => {
      throw error;
    });
    await expect(setSetting("badKey", "value")).rejects.toThrow("fail");
    expect(ui.notifications.error).toHaveBeenCalled();
  });

  it("validates slots and pages", () => {
    expect(isValidSlot(1)).toBe(true);
    expect(isValidSlot(50)).toBe(true);
    expect(isValidSlot(0)).toBe(false);
    expect(isValidSlot(51)).toBe(false);
    expect(isValidSlot(1.5)).toBe(false);

    expect(isValidPage(1)).toBe(true);
    expect(isValidPage(5)).toBe(true);
    expect(isValidPage(0)).toBe(false);
    expect(isValidPage(6)).toBe(false);
    expect(isValidPage(2.5)).toBe(false);
  });

  it("builds slots for pages", () => {
    expect(getSlotsForPage(0)).toEqual([]);
    expect(getSlotsForPage(1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(getSlotsForPage(5)).toEqual([41, 42, 43, 44, 45, 46, 47, 48, 49, 50]);
  });

  it("toggles classes on elements", () => {
    toggleClass(null, "test", true);
    const element = document.createElement("div");
    toggleClass(element, "test", true);
    expect(element.classList.contains("test")).toBe(true);
    toggleClass(element, "test", false);
    expect(element.classList.contains("test")).toBe(false);
  });

  it("updates the style element", () => {
    const css = ".test { color: red; }";
    updateStyleElement(css);
    const styleElement = document.getElementById(CSS_IDS.STYLE_ELEMENT);
    expect(styleElement).not.toBeNull();
    expect(styleElement.textContent).toContain("color: red");

    updateStyleElement(".test { color: blue; }");
    expect(styleElement.textContent).toContain("color: blue");
  });

  it("logs and notifies", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    log("message");
    expect(consoleSpy).toHaveBeenCalledWith(`${MODULE_ID} | message`);

    notify("info message", "info");
    expect(ui.notifications.info).toHaveBeenCalledWith("info message");
  });
});
