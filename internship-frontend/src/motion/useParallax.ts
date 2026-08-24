import { useEffect, useRef } from "react";
import { registerGsapPlugins, gsap } from "./gsapSetup";
import { prefersReducedMotion } from "./reducedMotion";

registerGsapPlugins();

/**
 * Attach to a background layer (position: absolute, inset: 0) inside a
 * normally-scrolling container to make it drift at a fraction of scroll
 * speed — classic parallax depth. Not pinned, not scroll-jacked: the
 * container itself scrolls at normal speed, only this layer's own
 * translateY is scroll-linked.
 *
 * WARNING: the effect below is one-shot (its deps array is fixed to
 * [speed], not the ref target), so it only ever wires up ScrollTrigger
 * once, on this hook's owning component's FIRST mount. If the calling
 * component renders the ref'd element conditionally (e.g. behind a
 * `loading` gate) so the DOM node doesn't exist yet on that first mount,
 * the effect finds `ref.current === null`, bails out, and never re-runs
 * once the element finally appears — the parallax silently does nothing.
 * Mount the ref target unconditionally from the owning component's first
 * render (extract a child component if needed, as InternshipDetails.tsx's
 * HeroPanel does) rather than gating it behind a loading state.
 */
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
