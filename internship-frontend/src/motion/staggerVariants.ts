import type { Variants } from "framer-motion";
import { prefersReducedMotion } from "./reducedMotion";

/**
 * Framer Motion variants for a staggered card-grid/list entrance. Call
 * `staggerContainer()` fresh at render time and pass the result to the list
 * wrapper's `variants` prop (with `initial="hidden" animate="show"`); call
 * `staggerItem()` fresh at render time for each card's `variants` prop (no
 * separate `initial`/`animate` needed on the item — it inherits "hidden"/
 * "show" from the container). Both are functions, not frozen constants, so
 * they re-evaluate `prefersReducedMotion()` on every render like the rest of
 * this codebase's motion components do, instead of freezing the OS
 * preference at module-import time.
 */
export function staggerContainer(staggerEach = 0.06): Variants {
  if (prefersReducedMotion()) {
    return { hidden: {}, show: {} };
  }
  return {
    hidden: {},
    show: { transition: { staggerChildren: staggerEach } },
  };
}

export function staggerItem(): Variants {
  if (prefersReducedMotion()) {
    return { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } };
  }
  return {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };
}
