import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { prefersReducedMotion } from "./reducedMotion";

gsap.registerPlugin(SplitText, useGSAP);

export interface SplitRevealProps {
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  children: string;
  delay?: number;
  stagger?: number;
}

/** Animates its text in character-by-character on mount. Renders plain text with no split when reduced motion is preferred. */
export default function SplitReveal({
  as = "h1",
  className,
  children,
  delay = 0,
  stagger = 0.02,
}: SplitRevealProps) {
  const ref = useRef<HTMLHeadingElement | HTMLParagraphElement | null>(null);
  const Tag = as;

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      const el = ref.current;

      const computedBg = getComputedStyle(el).backgroundImage;
      const hasGradientClipText = computedBg !== "none";

      const split = new SplitText(el, { type: "chars, words", charsClass: "split-char", wordsClass: "split-word" });

      if (hasGradientClipText) {
        const containerRect = el.getBoundingClientRect();
        split.chars.forEach((charEl) => {
          const charRect = (charEl as HTMLElement).getBoundingClientRect();
          Object.assign((charEl as HTMLElement).style, {
            backgroundImage: computedBg,
            backgroundSize: `${containerRect.width}px ${containerRect.height}px`,
            backgroundPosition: `${-(charRect.left - containerRect.left)}px ${-(charRect.top - containerRect.top)}px`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          });
        });
      }

      gsap.set(split.chars, { yPercent: 120, opacity: 0 });
      gsap.to(split.chars, {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        delay,
        stagger,
        ease: "power4.out",
      });

      return () => split.revert();
    },
    { scope: ref as never, dependencies: [children, delay, stagger] }
  );

  return (
    <Tag ref={ref as never} className={className} style={{ overflow: "hidden", display: "block" }}>
      {children}
    </Tag>
  );
}
