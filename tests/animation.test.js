import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getAnimationCSS, animateElement } from "../scripts/features/animation.js";
import { SETTINGS } from "../scripts/constants.js";

describe("animation", () => {
  beforeEach(() => {
    __testUtils.resetSettings();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds animation CSS using the configured duration", () => {
    __testUtils.setSettings({ [SETTINGS.ANIMATION_DURATION]: 450 });
    const css = getAnimationCSS();
    expect(css).toContain("450ms");
  });

  it("animates elements and cleans up classes", () => {
    __testUtils.setSettings({ [SETTINGS.ANIMATION_DURATION]: 100 });
    vi.useFakeTimers();

    const element = document.createElement("div");
    animateElement(element, true);
    expect(element.classList.contains("rnk-hidden")).toBe(true);

    vi.advanceTimersByTime(200);
    expect(element.classList.contains("rnk-hidden")).toBe(false);

    animateElement(element, false);
    expect(element.classList.contains("rnk-visible")).toBe(true);
    vi.advanceTimersByTime(200);
    expect(element.classList.contains("rnk-visible")).toBe(false);
  });

  it("ignores null elements", () => {
    animateElement(null, true);
  });
});
