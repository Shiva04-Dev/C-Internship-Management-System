import { useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { registerGsapPlugins, ScrollTrigger } from '../../motion/gsapSetup';
import { prefersReducedMotion } from '../../motion/reducedMotion';

registerGsapPlugins();

/**
 * The page's back-to-dashboard bar. Held at the top of the viewport with a
 * GSAP `ScrollTrigger` pin rather than CSS `position: sticky`: the app is
 * wrapped in ScrollSmoother globally (see `App.tsx`), which simulates
 * scrolling by transforming `#smooth-content` instead of natively scrolling
 * an ancestor — so native sticky inside it has nothing to stick against and
 * silently does nothing. GSAP's ScrollSmoother docs name `pin: true` as the
 * replacement, which is what this uses. `end: "max"` keeps it pinned for the
 * whole remaining page, and `pinSpacing: false` reproduces sticky's layout:
 * the bar keeps its own space in flow and the page scrolls underneath it.
 *
 * Split into its own component (like `HeroPanel` above) so its one-shot
 * `useGSAP` runs on ITS first mount — the parent renders a `loading` early
 * return first, so an effect living up there would fire with the bar's DOM
 * node not yet in the document and never wire the pin up.
 *
 * Under reduced motion no smoother is created at all, so the page scrolls
 * natively and plain CSS sticky works — that path falls back to it and runs
 * no GSAP.
 */
export default function PinnedTopBar({ onBack }: { onBack: () => void }) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const reduced = prefersReducedMotion();

  useGSAP(
    () => {
      if (!barRef.current || reduced) return;
      ScrollTrigger.create({
        trigger: barRef.current,
        start: 'top top',
        end: 'max',
        pin: barRef.current,
        pinSpacing: false,
        invalidateOnRefresh: true,
      });
    },
    { scope: barRef, dependencies: [] }
  );

  return (
    <div
      ref={barRef}
      className="border-b"
      style={{
        position: reduced ? 'sticky' : 'relative',
        top: 0,
        zIndex: 50,
        background: 'rgba(5,5,20,0.95)',
        borderColor: 'rgba(0,243,255,0.15)',
        backdropFilter: 'blur(16px)'
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 transition-colors"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.6rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(0,243,255,0.5)',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
