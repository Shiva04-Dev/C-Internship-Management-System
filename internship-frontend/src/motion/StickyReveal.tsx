import { useRef, ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { registerGsapPlugins, gsap, ScrollTrigger } from "./gsapSetup";
import { prefersReducedMotion } from "./reducedMotion";

registerGsapPlugins();

export interface StickyRevealProps {
  children: ReactNode;
  topOffset?: number;
  className?: string;
  /**
   * Viewport width at or above which pinning is allowed, in px. Defaults to
   * Tailwind's `md` breakpoint, since the multi-column layouts this component
   * is designed for collapse to a single column below it — see the pin
   * preconditions in the component doc.
   */
  pinMinWidth?: number;
}

/**
 * Keeps its content pinned `topOffset` px below the top of the viewport while
 * the reader scrolls through its containing column, and plays a one-shot
 * fade/slide-up entrance the first time it scrolls into view (toggleActions
 * "play none none none" — plays once, not a continuous scroll-scrub).
 *
 * The pin is a `ScrollTrigger.create({ pin })`, NOT CSS `position: sticky`.
 * `ScrollSmootherProvider` is mounted globally in `App.tsx`, and GSAP's
 * ScrollSmoother simulates scrolling by transforming `#smooth-content` rather
 * than natively scrolling any ancestor — so native `position: sticky` inside
 * it has nothing real to stick against and silently does nothing. GSAP's own
 * ScrollSmoother docs call this out and name `pin: true` as the replacement,
 * which is what this does.
 *
 * The pin target and the entrance-animation target are deliberately two
 * DIFFERENT elements. A GSAP pin drives the pinned element's own `transform`
 * to hold it in place; the entrance tween animates `y` (also `transform`) on
 * its target. Pointing both at one node makes them fight over the same matrix.
 * So the outer div is pinned and the inner div is animated.
 *
 * The pin end is derived from the element's own parent (`endTrigger`, "bottom
 * bottom") rather than anything specific to a caller's markup, so this stays a
 * reusable component: drop it in any column and it releases when that column
 * ends, at whatever `topOffset` the caller asks for. `pinSpacing: false`
 * because the parent column is expected to already own its own height (e.g. a
 * stretched grid/flex track) — inserting extra spacer height would push the
 * surrounding layout around.
 *
 * That last point is a real PRECONDITION, not just a note: the pin only makes
 * sense when the parent's height is determined INDEPENDENTLY of this element.
 * In a stretched grid/flex track it is. But when the surrounding grid collapses
 * to a single column (mobile), the parent's height comes from its own children
 * — this element included — so the parent's bottom sits barely below the
 * element's own bottom, the "bottom bottom" end lands before the
 * `top top+=topOffset` start, and the pin window is empty or inverted. Two
 * guards handle that:
 *
 *  1. `gsap.matchMedia` limits the pin to `min-width: pinMinWidth`, and
 *     creates/reverts it automatically as the viewport crosses that breakpoint
 *     — a plain one-shot check couldn't react to a resize.
 *  2. Inside that, a layout-agnostic height check: pin only if the parent is
 *     meaningfully taller than this element. That catches short-content cases
 *     above the breakpoint too, without hardcoding any caller's structure.
 *
 * Below the breakpoint the content is simply a static block. CSS `position:
 * sticky` is NOT used as a fallback there, because under ScrollSmoother it does
 * nothing anyway (that is the whole reason this component moved to a pin) — a
 * fallback that silently no-ops would be worse than an honest static element.
 *
 * Both the pin and the entrance are gated behind `prefersReducedMotion()`.
 * Under reduced motion `ScrollSmootherProvider` never creates a smoother, so
 * the page scrolls natively and plain CSS `position: sticky` DOES work — that
 * path falls back to it, keeping the sticky behaviour for those users while
 * still running no GSAP at all. The effect otherwise unconditionally sets up
 * the same hidden-then-visible sequence on every run with no ref-latch branch,
 * so it's safe under React StrictMode's double-invoke — `useGSAP` reverts the
 * context (tweens AND ScrollTriggers) between invocations, and a replay just
 * re-plays the identical correct animation, never a wrong end state.
 */
export default function StickyReveal({ children, topOffset = 96, className, pinMinWidth = 768 }: StickyRevealProps) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const reduced = prefersReducedMotion();

  useGSAP(
    () => {
      const outer = outerRef.current;
      const inner = innerRef.current;
      if (!outer || !inner || prefersReducedMotion()) return;

      gsap.set(inner, { autoAlpha: 0, y: 40 });
      gsap.to(inner, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: inner,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      // Safety net: if the page isn't scrollable at all, the ScrollTrigger's
      // "top 85%" start point may never be reached, which would leave this
      // panel permanently hidden (autoAlpha: 0). Force it visible immediately
      // in that case rather than relying on a scroll event that can't happen.
      // A pin would be equally pointless on an unscrollable page, so skip it.
      if (document.documentElement.scrollHeight <= window.innerHeight) {
        gsap.set(inner, { autoAlpha: 1, y: 0 });
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(`(min-width: ${pinMinWidth}px)`, () => {
        const parent = outer.parentElement;
        // Guard 2: only pin when the parent owns height beyond this element's
        // own, i.e. there is a real window to travel through. `topOffset` is
        // included because the element also has to climb that far up the
        // viewport before the pin can even start.
        if (!parent || parent.offsetHeight - outer.offsetHeight <= topOffset) return;

        ScrollTrigger.create({
          trigger: outer,
          start: `top top+=${topOffset}`,
          endTrigger: parent,
          end: "bottom bottom",
          pin: outer,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
      });

      return () => mm.revert();
    },
    { scope: outerRef, dependencies: [topOffset, pinMinWidth] }
  );

  return (
    <div
      ref={outerRef}
      className={className}
      style={reduced ? { position: "sticky", top: topOffset } : undefined}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
