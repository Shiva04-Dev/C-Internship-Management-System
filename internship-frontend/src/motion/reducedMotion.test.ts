import { describe, it, expect, vi } from "vitest";
import { prefersReducedMotion, onReducedMotionChange } from "./reducedMotion";

function mockMatchMedia(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  const mql = {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
      listeners.push(cb);
    },
    removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
      const i = listeners.indexOf(cb);
      if (i >= 0) listeners.splice(i, 1);
    },
  };
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return { mql, listeners };
}

describe("prefersReducedMotion", () => {
  it("returns false when the media query does not match", () => {
    mockMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it("returns true when the media query matches", () => {
    mockMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);
  });
});

describe("onReducedMotionChange", () => {
  it("invokes the callback when the media query changes", () => {
    const { listeners } = mockMatchMedia(false);
    const callback = vi.fn();
    onReducedMotionChange(callback);
    expect(listeners).toHaveLength(1);
    listeners[0]({ matches: true } as MediaQueryListEvent);
    expect(callback).toHaveBeenCalledWith(true);
  });

  it("returns an unsubscribe function that removes the listener", () => {
    const { listeners } = mockMatchMedia(false);
    const unsubscribe = onReducedMotionChange(vi.fn());
    expect(listeners).toHaveLength(1);
    unsubscribe();
    expect(listeners).toHaveLength(0);
  });
});
