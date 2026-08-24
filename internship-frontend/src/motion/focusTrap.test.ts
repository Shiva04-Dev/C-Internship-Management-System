import { describe, it, expect } from "vitest";
import { getFocusWrapTarget } from "./focusTrap";

function fakeEl(id: string): HTMLElement {
  return { id } as unknown as HTMLElement;
}

describe("getFocusWrapTarget", () => {
  it("returns null when there are no focusable elements", () => {
    expect(getFocusWrapTarget([], null, false)).toBeNull();
  });

  it("wraps from the last element to the first on Tab", () => {
    const first = fakeEl("first");
    const middle = fakeEl("middle");
    const last = fakeEl("last");
    expect(getFocusWrapTarget([first, middle, last], last, false)).toBe(first);
  });

  it("wraps from the first element to the last on Shift+Tab", () => {
    const first = fakeEl("first");
    const middle = fakeEl("middle");
    const last = fakeEl("last");
    expect(getFocusWrapTarget([first, middle, last], first, true)).toBe(last);
  });

  it("returns null when focus is in the middle of the list (default Tab order is fine)", () => {
    const first = fakeEl("first");
    const middle = fakeEl("middle");
    const last = fakeEl("last");
    expect(getFocusWrapTarget([first, middle, last], middle, false)).toBeNull();
    expect(getFocusWrapTarget([first, middle, last], middle, true)).toBeNull();
  });

  it("wraps to itself on a single-element list, keeping Tab from escaping the trap", () => {
    const only = fakeEl("only");
    expect(getFocusWrapTarget([only], only, false)).toBe(only);
    expect(getFocusWrapTarget([only], only, true)).toBe(only);
  });
});
