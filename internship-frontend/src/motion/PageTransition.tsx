import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollSmoother, ScrollTrigger } from "./gsapSetup";
import { prefersReducedMotion } from "./reducedMotion";

export interface PageTransitionProps {
  children: ReactNode;
  locationKey: string;
}

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
