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
