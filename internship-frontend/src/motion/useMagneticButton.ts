import { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "./reducedMotion";

export interface MagneticOffset {
  x: number;
  y: number;
}

export function computeMagneticOffset(
  cursorX: number,
  cursorY: number,
  originX: number,
  originY: number,
  radius: number,
  strength: number
): MagneticOffset {
  const dx = cursorX - originX;
  const dy = cursorY - originY;
  const distance = Math.hypot(dx, dy);
  if (radius <= 0 || distance > radius) {
    return { x: 0, y: 0 };
  }
  const pull = (1 - distance / radius) * strength;
  return { x: dx * pull, y: dy * pull };
}

/** Attach the returned ref to a button/link to make it drift toward the cursor within `radius` px. */
export function useMagneticButton<T extends HTMLElement>(radius = 90, strength = 0.4) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const quickX = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const quickY = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

    function handleMove(event: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      const offset = computeMagneticOffset(event.clientX, event.clientY, originX, originY, radius, strength);
      quickX(offset.x);
      quickY(offset.y);
    }

    function handleLeave() {
      quickX(0);
      quickY(0);
    }

    window.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [radius, strength]);

  return ref;
}
