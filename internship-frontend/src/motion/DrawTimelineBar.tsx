import { useId, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { registerGsapPlugins, gsap } from "./gsapSetup";
import { prefersReducedMotion } from "./reducedMotion";

registerGsapPlugins();

export interface DrawTimelineBarProps {
  startDate: string;
  endDate: string;
}

/**
 * Horizontal start-to-end date bar that draws itself in ONCE when scrolled
 * into view (toggleActions "play none none none") — unlike LandingPage's
 * HowItWorks timeline, which continuously scrubs its draw-in with scroll
 * position, this plays a single reveal and then holds. A "today" marker is
 * positioned proportionally along the bar when today falls within range.
 */
export default function DrawTimelineBar({ startDate, endDate }: DrawTimelineBarProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<SVGLineElement | null>(null);
  const gradientId = useId();

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const inRange = now >= start && now <= end && end > start;
  const progress = inRange ? Math.min(1, Math.max(0, (now - start) / (end - start))) : null;

  useGSAP(
    () => {
      if (!lineRef.current || prefersReducedMotion()) return;

      gsap.set(lineRef.current, { drawSVG: "0%" });
      gsap.to(lineRef.current, {
        drawSVG: "100%",
        duration: 1.1,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <div ref={sectionRef} className="relative pt-2 pb-1">
      <div className="relative w-full" style={{ height: 4 }}>
        <svg
          viewBox="0 0 100 4"
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: 4, overflow: "visible" }}
          aria-hidden="true"
        >
          <line x1="1" y1="2" x2="99" y2="2" stroke="rgba(0,243,255,0.15)" strokeWidth="2" />
          <line
            ref={lineRef}
            x1="1"
            y1="2"
            x2="99"
            y2="2"
            stroke={`url(#${gradientId})`}
            strokeWidth="2"
          />
          <defs>
            <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="0">
              <stop offset="0%" stopColor="#00f3ff" />
              <stop offset="100%" stopColor="#b026ff" />
            </linearGradient>
          </defs>
        </svg>
        {progress !== null && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: `${1 + progress * 98}%`,
              top: "50%",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00cc66",
              border: "1px solid #050510",
              transform: "translate(-50%, -50%)",
              zIndex: 1,
            }}
          />
        )}
      </div>
      <div className="flex justify-between mt-3">
        <div>
          <p className="font-['Orbitron'] text-xs mb-1" style={{ color: "rgba(0,243,255,0.4)", letterSpacing: "0.1em" }}>
            START
          </p>
          <p className="font-['Share_Tech_Mono'] text-sm text-white">
            {new Date(startDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p className="font-['Orbitron'] text-xs mb-1" style={{ color: "rgba(176,38,255,0.5)", letterSpacing: "0.1em" }}>
            END
          </p>
          <p className="font-['Share_Tech_Mono'] text-sm text-white">
            {new Date(endDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  );
}
