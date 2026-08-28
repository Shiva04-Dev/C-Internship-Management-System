import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { prefersReducedMotion } from "./reducedMotion";

export interface SlidingTabOption {
  value: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

export interface SlidingTabsProps {
  options: SlidingTabOption[];
  active: string;
}

/** Tab switcher whose background indicator slides to the active tab, instead of restyling each tab's background/border in place. */
export default function SlidingTabs({ options, active }: SlidingTabsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const activeIndex = Math.max(0, options.findIndex((o) => o.value === active));

  useGSAP(
    () => {
      const tab = tabRefs.current[activeIndex];
      const indicator = indicatorRef.current;
      if (!tab || !indicator) return;

      const target = { x: tab.offsetLeft, width: tab.offsetWidth };

      const hasInlineWidth = indicator.style.width !== "";
      const isFirstMount = !hasInlineWidth || prefersReducedMotion();

      if (isFirstMount) {
        gsap.set(indicator, target);
        return;
      }
      gsap.to(indicator, { ...target, duration: 0.4, ease: "power3.out", overwrite: "auto" });
    },
    { dependencies: [activeIndex], scope: containerRef }
  );

  useEffect(() => {
    const container = containerRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;

    const resizeObserver = new ResizeObserver(() => {
      const tab = tabRefs.current[activeIndex];
      if (!tab || !indicator) return;
      gsap.set(indicator, { x: tab.offsetLeft, width: tab.offsetWidth });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className="relative flex gap-1 mb-7 p-1"
      style={{ background: "rgba(0,0,20,0.6)", border: "1px solid rgba(0,243,255,0.15)" }}
    >
      <div
        ref={indicatorRef}
        className="absolute top-1 bottom-1 rounded-sm"
        style={{
          background: "linear-gradient(135deg, rgba(0,100,200,0.4), rgba(100,0,200,0.4))",
          border: "1px solid var(--neon-cyan)",
          boxShadow: "0 0 12px rgba(0,243,255,0.2)",
        }}
      />
      {options.map((option, i) => (
        <Link
          key={option.value}
          ref={(el) => {
            tabRefs.current[i] = el;
          }}
          to={option.href}
          aria-current={option.value === active ? "page" : undefined}
          className="relative z-10 flex items-center justify-center gap-1 flex-1 py-2 px-2 font-display font-bold uppercase transition-colors"
          style={{
            fontSize: "0.55rem",
            letterSpacing: "0.1em",
            color: option.value === active ? "#fff" : "rgba(180,200,220,0.5)",
            textDecoration: "none",
          }}
        >
          {option.icon}
          {option.label}
        </Link>
      ))}
    </div>
  );
}
