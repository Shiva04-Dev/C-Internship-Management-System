import { useRef, ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { registerGsapPlugins, gsap, ScrollTrigger } from "./gsapSetup";
import { prefersReducedMotion } from "./reducedMotion";

registerGsapPlugins();

export interface StickyRevealProps {
  children: ReactNode;
  topOffset?: number;
  className?: string;
  pinMinWidth?: number;
}

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

      if (document.documentElement.scrollHeight <= window.innerHeight) {
        gsap.set(inner, { autoAlpha: 1, y: 0 });
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(`(min-width: ${pinMinWidth}px)`, () => {
        const parent = outer.parentElement;
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
