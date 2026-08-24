import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollSmoother, ScrollTrigger } from "./gsapSetup";
import { prefersReducedMotion } from "./reducedMotion";

export interface PageTransitionProps {
  children: ReactNode;
  locationKey: string;
}

/**
 * Wraps route content in a Framer Motion AnimatePresence keyed on the
 * current route so navigating plays a short clip-path wipe instead of an
 * instant hard cut. `locationKey` is passed in by the caller (rather than
 * this component calling `useLocation()` itself) so it stays in lockstep
 * with the `location` prop the caller also passes to `<Routes>` — see the
 * comment in App.tsx's `AppRoutes` for why that pairing matters. Falls back
 * to rendering `children` directly, with no wrapping motion element at all,
 * under reduced motion.
 *
 * `onExitComplete` resets scroll position and re-measures ScrollTrigger only
 * once the outgoing page's exit animation has genuinely finished and it's
 * about to unmount — not the instant the URL changes. Doing this any earlier
 * (e.g. off a raw `location.pathname` effect, as `ScrollSmootherProvider`
 * used to) measures the departing page's layout, not the arriving page's, and
 * visibly snaps the departing page to the top mid-wipe. `ScrollSmoother.get()`
 * fetches the live singleton instance directly so this doesn't need a ref
 * threaded in from `ScrollSmootherProvider`. Under reduced motion this
 * handler simply never runs, since `AnimatePresence` isn't rendered at all —
 * consistent with `ScrollSmootherProvider`'s own former `prefersReducedMotion`
 * guard, just implicit instead of explicit.
 */
export default function PageTransition({ children, locationKey }: PageTransitionProps) {
  if (prefersReducedMotion()) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        ScrollSmoother.get()?.scrollTop(0);
        ScrollTrigger.refresh();
      }}
    >
      <motion.div
        key={locationKey}
        initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
        animate={{ opacity: 1, clipPath: "inset(0% 0 0 0)" }}
        exit={{ opacity: 0, clipPath: "inset(100% 0 0 0)" }}
        transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
