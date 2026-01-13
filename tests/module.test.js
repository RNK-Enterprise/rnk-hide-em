import { describe, it, expect, vi, beforeEach } from "vitest";

const registerSettings = vi.fn();
const initHook = vi.fn();
const readyHook = vi.fn();
const renderMacroDirectoryHook = vi.fn();
const hotbarCollapseHook = vi.fn();

vi.mock("../scripts/settings.js", () => ({
  registerSettings
}));

vi.mock("../scripts/hooks.js", () => ({
  initHook,
  readyHook,
  renderMacroDirectoryHook,
  hotbarCollapseHook
}));

describe("module entry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers hooks on import", async () => {
    vi.resetModules();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await import("../scripts/module.js");

    expect(Hooks.once).toHaveBeenCalledTimes(2);
    expect(Hooks.on).toHaveBeenCalledTimes(3);
    expect(consoleSpy).toHaveBeenCalled();

    const initCallback = Hooks.once.mock.calls.find((call) => call[0] === "init")[1];
    const readyCallback = Hooks.once.mock.calls.find((call) => call[0] === "ready")[1];
    initCallback();
    readyCallback();

    expect(registerSettings).toHaveBeenCalled();
    expect(initHook).toHaveBeenCalled();
    expect(readyHook).toHaveBeenCalled();
  });

  it("registers Handlebars helpers", async () => {
    vi.resetModules();
    const moduleExports = await import("../scripts/module.js");

    expect(moduleExports.mathHelper(2, 3)).toBe(6);
    expect(moduleExports.subtractHelper(5, 2)).toBe(3);
    expect(moduleExports.multiplyHelper(4, 2)).toBe(8);

    moduleExports.registerHandlebarsHelpers();
    expect(Handlebars.registerHelper).toHaveBeenCalledWith(
      "math",
      moduleExports.mathHelper
    );
  });
});
