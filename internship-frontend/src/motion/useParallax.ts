import { useEffect, useRef } from "react";
import { registerGsapPlugins, gsap } from "./gsapSetup";
import { prefersReducedMotion } from "./reducedMotion";

registerGsapPlugins();

export function useParallax<T extends HTMLElement>(speed = 0.3) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const trigger = el.parentElement ?? el;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [speed]);

  return ref;
}
