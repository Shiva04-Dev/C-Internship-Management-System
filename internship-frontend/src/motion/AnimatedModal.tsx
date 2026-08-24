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

/**
 * Replaces the app's plain conditionally-rendered `.retro-modal-overlay` /
 * `.retro-modal` divs with a real animated modal: spring scale+fade on
 * open/close (AnimatePresence lets the close animation actually play before
 * unmount, unlike the previous `{show && <div>...}` pattern which vanished
 * instantly), a focus trap (Tab/Shift+Tab cycle within the dialog instead of
 * escaping into the page behind it), Escape-to-close, focus returned to
 * whichever element opened the modal, a scroll lock while open, and
 * proper `role="dialog"` / `aria-modal="true"` / `aria-label` semantics.
 * Clicking the overlay (not the modal body) closes it, matching the app's
 * existing modal-dismiss convention — callers no longer need to wire that
 * `onClick={e => e.target === e.currentTarget && onClose()}` check
 * themselves, it's owned here.
 *
 * The whole tree is rendered through `createPortal` into `document.body`
 * rather than in place. This is NOT cosmetic: `ScrollSmootherProvider` is
 * mounted globally in `App.tsx` and GSAP's ScrollSmoother puts a CSS
 * `transform` on `#smooth-content`, which makes that div a containing block
 * for every `position: fixed` descendant. Rendered inline, the overlay's
 * `position: fixed` would resolve against `#smooth-content` and scroll away
 * with the page instead of covering the viewport. As a direct child of
 * `<body>` it sits outside that transform and behaves normally. Nothing in
 * the app styles modals by DOM position relative to page content (the
 * overlay's `z-index: 1000` in index.css is absolute, not stacking-context
 * relative), so the portal is safe.
 *
 * The scroll lock likewise has to account for ScrollSmoother: with the
 * smoother active, `document.body.style.overflow = "hidden"` is a no-op
 * because scrolling is simulated via transform, not native body scroll.
 * `ScrollSmoother.get()?.paused(true)` is what actually freezes the page.
 * The `overflow` line is kept as the fallback for reduced-motion sessions,
 * where no smoother instance exists at all and native scrolling applies.
 */
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
