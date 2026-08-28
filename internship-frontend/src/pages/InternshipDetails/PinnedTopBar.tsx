import { useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { registerGsapPlugins, ScrollTrigger } from '../../motion/gsapSetup';
import { prefersReducedMotion } from '../../motion/reducedMotion';

registerGsapPlugins();

// Pinned via GSAP ScrollTrigger (not CSS sticky — ScrollSmoother transforms
// content instead of scrolling). Split out so useGSAP attaches after mount.
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
