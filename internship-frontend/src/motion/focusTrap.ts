export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
