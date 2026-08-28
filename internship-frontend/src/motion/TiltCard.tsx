import { useRef, ReactNode, CSSProperties, MouseEvent } from "react";
import { prefersReducedMotion } from "./reducedMotion";

export interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  maxTilt?: number;
  onClick?: () => void;
}

export default function TiltCard({ children, className, style, maxTilt = 8, onClick }: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = prefersReducedMotion();

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 2 * maxTilt;
    const rotateX = (0.5 - py) * 2 * maxTilt;
    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{ transition: "transform 0.25s ease", transformStyle: "preserve-3d", ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
