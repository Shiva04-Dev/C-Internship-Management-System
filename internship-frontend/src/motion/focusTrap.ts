export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Pure focus-wrap logic for a Tab-trapped dialog: given the dialog's current
 * focusable elements (in DOM order), the currently focused element, and
 * whether Shift was held, returns the element focus should jump to in order
 * to WRAP AROUND instead of escaping the dialog — or null if the browser's
 * default Tab behavior should be left alone (focus is somewhere in the
 * middle of the list, not on either boundary element, so no wrap is needed).
 */
export function getFocusWrapTarget(
  focusables: HTMLElement[],
  current: Element | null,
  shiftKey: boolean
): HTMLElement | null {
  if (focusables.length === 0) return null;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (shiftKey && current === first) return last;
  if (!shiftKey && current === last) return first;
  return null;
}
