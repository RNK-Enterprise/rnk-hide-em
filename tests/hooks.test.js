import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const renderSpy = vi.fn();

vi.mock("../scripts/config.js", () => {
  return {
    HideHotbarConfig: class {
      render() {
        renderSpy();
      }
    }
  };
});

vi.mock("../scripts/styles.js", () => {
  return {
    updateHotbarStyles: vi.fn()
  };
});

describe("hooks", () => {
  let initHook;
  let readyHook;
  let renderMacroDirectoryHook;
  let hotbarCollapseHook;
  let updateHotbarStyles;

  beforeEach(async () => {
    vi.clearAllMocks();
    const hooksModule = await import("../scripts/hooks.js");
    initHook = hooksModule.initHook;
    readyHook = hooksModule.readyHook;
    renderMacroDirectoryHook = hooksModule.renderMacroDirectoryHook;
    hotbarCollapseHook = hooksModule.hotbarCollapseHook;
    updateHotbarStyles = (await import("../scripts/styles.js")).updateHotbarStyles;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("registers the keybinding and opens config for GMs", () => {
    game.user.isGM = true;
    initHook();

    const registration = game.keybindings.register.mock.calls[0][2];
    expect(registration.name).toContain("Open");

    registration.onDown();
    expect(renderSpy).toHaveBeenCalled();
  });

  it("does not open config for non-GMs", () => {
    game.user.isGM = false;
    initHook();
    const registration = game.keybindings.register.mock.calls[0][2];
    registration.onDown();
  });

  it("applies styles on ready", () => {
    readyHook();
    expect(updateHotbarStyles).toHaveBeenCalled();
  });

  it("adds config button to macro directory footer", () => {
    game.user.isGM = true;
    const container = document.createElement("div");
    renderMacroDirectoryHook(null, container);

    const footer = container.querySelector(".directory-footer");
    expect(footer).not.toBeNull();
    const button = footer.querySelector("button");
    expect(button).not.toBeNull();
    button.click();
    expect(renderSpy).toHaveBeenCalled();
  });

  it("handles html arrays and non-GM users", () => {
    game.user.isGM = false;
    const container = document.createElement("div");
    renderMacroDirectoryHook(null, [container]);
    expect(container.querySelector("button")).toBeNull();
  });

  it("ignores invalid macro directory elements", () => {
    game.user.isGM = true;
    renderMacroDirectoryHook(null, {});
  });

  it("reapplies styles after collapse", () => {
    vi.useFakeTimers();
    hotbarCollapseHook();
    vi.advanceTimersByTime(150);
    expect(updateHotbarStyles).toHaveBeenCalled();
  });
});
