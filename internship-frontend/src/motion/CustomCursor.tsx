import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { prefersReducedMotion } from "./reducedMotion";
import "./CustomCursor.css";

/** Site-wide custom cursor. Renders nothing on touch devices or when reduced motion is preferred. */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    setEnabled(!isTouch && !prefersReducedMotion());
  }, []);

  useEffect(() => {
    dotRef.current?.classList.remove("custom-cursor--hover");
  }, [location.pathname]);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    if (!dot) return;

    document.body.classList.add("custom-cursor-active");
    const quickX = gsap.quickTo(dot, "x", { duration: 0.18, ease: "power3" });
    const quickY = gsap.quickTo(dot, "y", { duration: 0.18, ease: "power3" });

    function handleMove(event: MouseEvent) {
      quickX(event.clientX);
      quickY(event.clientY);
    }
    function handleOver(event: MouseEvent) {
      if ((event.target as HTMLElement).closest("[data-cursor-hover]")) {
        dot!.classList.add("custom-cursor--hover");
      }
    }
    function handleOut(event: MouseEvent) {
      if ((event.target as HTMLElement).closest("[data-cursor-hover]")) {
        dot!.classList.remove("custom-cursor--hover");
      }
    }

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <div ref={dotRef} className="custom-cursor" data-testid="custom-cursor" />;
}
