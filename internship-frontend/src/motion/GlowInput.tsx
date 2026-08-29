import { forwardRef, useEffect, useRef, InputHTMLAttributes, ReactNode } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "./reducedMotion";

export interface GlowInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  icon?: ReactNode;
  trailing?: ReactNode;
}

/** Text input whose border draws itself in (SVG stroke-dashoffset) on focus and retracts on blur, instead of a plain CSS border-color transition. */
const GlowInput = forwardRef<HTMLInputElement, GlowInputProps>(function GlowInput(
  { icon, trailing, onFocus, onBlur, ...inputProps },
  ref
) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const traceRef = useRef<SVGRectElement | null>(null);
  const perimeterRef = useRef(0);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    const el = wrapperRef.current;
    const trace = traceRef.current;
    if (!el || !trace || prefersReducedMotion()) return;

    const updatePerimeter = () => {
      // Use the rect's actual traced path length, not the sharp-corner
      // 2*(w+h) formula — with rx set, the real path is shorter than that
      // by the rounded-corner arcs, and the mismatch left a permanently
      // visible seam (and an unlit gap on focus) at the path's start point.
      const perimeter = trace.getTotalLength();
      perimeterRef.current = perimeter;
      gsap.set(trace, { strokeDasharray: perimeter });

      if (isFocusedRef.current) {
        gsap.set(trace, { strokeDashoffset: 0 });
      } else {
        gsap.set(trace, { strokeDashoffset: perimeter });
      }
    };

    updatePerimeter();

    const resizeObserver = new ResizeObserver(() => {
      updatePerimeter();
    });

    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    isFocusedRef.current = true;
    if (!prefersReducedMotion() && traceRef.current) {
      gsap.to(traceRef.current, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out", overwrite: "auto" });
    }
    onFocus?.(e);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    isFocusedRef.current = false;
    if (!prefersReducedMotion() && traceRef.current) {
      gsap.to(traceRef.current, { strokeDashoffset: perimeterRef.current, duration: 0.4, ease: "power2.in", overwrite: "auto" });
    }
    onBlur?.(e);
  }

  return (
    <div ref={wrapperRef} className="relative">
      {!prefersReducedMotion() && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
          <rect
            ref={traceRef}
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx="2"
            fill="none"
            stroke="var(--neon-cyan)"
            strokeWidth="1.5"
            style={{ filter: "drop-shadow(0 0 4px var(--neon-cyan))" }}
          />
        </svg>
      )}
      {icon && (
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "rgba(0,243,255,0.4)" }}
        >
          {icon}
        </span>
      )}
      <input
        {...inputProps}
        ref={ref}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="retro-input"
        style={{
          paddingLeft: icon ? "2.5rem" : undefined,
          paddingRight: trailing ? "2.75rem" : undefined,
          ...inputProps.style,
        }}
      />
      {trailing && <span className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</span>}
    </div>
  );
});

export default GlowInput;
