import type { Variants } from "framer-motion";
import { prefersReducedMotion } from "./reducedMotion";


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
