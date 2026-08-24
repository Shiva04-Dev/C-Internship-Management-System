import { ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { registerGsapPlugins, ScrollSmoother } from "./gsapSetup";
import { prefersReducedMotion } from "./reducedMotion";

registerGsapPlugins();

/**
 * Wraps the app in GSAP ScrollSmoother for inertia scrolling. IMPORTANT: any
 * `position: fixed` element (e.g. CustomCursor) must be rendered as a SIBLING
 * of this provider, never as a child — ScrollSmoother applies a CSS
 * `transform` to its content element, which creates a new containing block
 * and breaks `position: fixed` children.
 */
export default function ScrollSmootherProvider({ children }: { children: ReactNode }) {
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.2,
      effects: true,
      normalizeScroll: true,
    });
    return () => {
      smootherRef.current?.kill();
      smootherRef.current = null;
    };
  }, []);

  return (
    <div id="smooth-wrapper" data-testid="smooth-wrapper">
      <div id="smooth-content" data-testid="smooth-content">
        {children}
      </div>
    </div>
  );
}
