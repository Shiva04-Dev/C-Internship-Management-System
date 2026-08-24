import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { prefersReducedMotion } from "./reducedMotion";

export interface StatCounterProps {
  value: number;
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
  formatter?: (n: number) => string;
}

/**
 * Animated count-up/count-down tile number. Renders NO text as a React
 * child — the span starts empty and every render of its displayed digits is
 * done imperatively (`el.textContent = ...`) inside the effect below. This
 * is deliberate: if React itself managed the text child, a parent re-render
 * for an unrelated reason would reconcile the span back to whatever value
 * was last stored in a ref, clobbering GSAP's in-flight tween mid-animation.
 * Tweens from whatever the counter currently reads, not always from zero —
 * so calling this again with a smaller `value` counts DOWN, which is what
 * you want when a dashboard refresh changes a stat naturally.
 */
export default function StatCounter({
  value,
  className,
  style,
  duration = 0.8,
  formatter = (n) => String(n),
}: StatCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const state = useRef({ val: 0 });

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        state.current.val = value;
        el.textContent = formatter(value);
        return;
      }

      gsap.to(state.current, {
        val: value,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = formatter(Math.round(state.current.val));
        },
      });
    },
    { dependencies: [value] }
  );

  return <span ref={ref} className={className} style={style} />;
}
