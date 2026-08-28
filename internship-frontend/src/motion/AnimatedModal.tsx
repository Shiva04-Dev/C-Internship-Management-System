import { ReactNode, useEffect, useRef, KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import { FOCUSABLE_SELECTOR, getFocusWrapTarget } from "./focusTrap";
import { ScrollSmoother } from "./gsapSetup";
import { prefersReducedMotion } from "./reducedMotion";

export interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  ariaLabel: string;
  className?: string;
}

export default function AnimatedModal({ isOpen, onClose, children, maxWidth = "640px", ariaLabel, className }: AnimatedModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ScrollSmoother.get()?.paused(true);

    const raf = requestAnimationFrame(() => {
      const first = modalRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (first ?? modalRef.current)?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = originalOverflow;
      ScrollSmoother.get()?.paused(false);
      previouslyFocused.current?.focus();
    };
  }, [isOpen]);

  function handleKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;

    const focusables = Array.from(modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);
    if (focusables.length === 0) {
      // No focusable content in the dialog — pin focus on the dialog
      // container itself so Tab can't escape into the page behind it.
      e.preventDefault();
      modalRef.current?.focus();
      return;
    }
    const target = getFocusWrapTarget(focusables, document.activeElement, e.shiftKey);
    if (target) {
      e.preventDefault();
      target.focus();
    }
  }

  const overlayTransition: Transition = reduced ? { duration: 0 } : { duration: 0.2, ease: "easeOut" };
  const modalTransition: Transition = reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="retro-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            ref={modalRef}
            className={className ? `retro-modal ${className}` : "retro-modal"}
            style={{ maxWidth }}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={modalTransition}
            onKeyDown={handleKeyDown}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
