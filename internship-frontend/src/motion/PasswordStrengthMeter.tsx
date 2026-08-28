import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CheckCircle, XCircle } from "lucide-react";
import { prefersReducedMotion } from "./reducedMotion";

export interface PasswordRequirementItem {
  met: boolean;
  text: string;
}

export interface PasswordStrengthMeterProps {
  score: number;
  label: string;
  color: string;
  requirements: PasswordRequirementItem[];
}

export default function PasswordStrengthMeter({ score, label, color, requirements }: PasswordStrengthMeterProps) {
  const barRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!barRef.current) return;
      const width = `${score * 25}%`;
      if (prefersReducedMotion()) {
        gsap.set(barRef.current, { width });
        return;
      }
      gsap.to(barRef.current, { width, duration: 0.6, ease: "elastic.out(1, 0.5)", overwrite: "auto" });
    },
    { dependencies: [score] }
  );

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div ref={barRef} className="h-full rounded-full" style={{ width: "0%", background: color, boxShadow: `0 0 6px ${color}` }} />
        </div>
        <span className="font-['Orbitron'] text-xs" style={{ color, letterSpacing: "0.05em" }}>
          {label}
        </span>
      </div>
      <div className="space-y-1">
        {requirements.map((r, i) => (
          <RequirementRow key={i} met={r.met} text={r.text} />
        ))}
      </div>
    </div>
  );
}

function RequirementRow({ met, text }: PasswordRequirementItem) {
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const wasMet = useRef(met);

  useGSAP(
    () => {
      if (!iconRef.current || prefersReducedMotion() || wasMet.current === met) {
        wasMet.current = met;
        return;
      }
      wasMet.current = met;
      gsap.fromTo(iconRef.current, { scale: 0.3 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
    },
    { dependencies: [met] }
  );

  return (
    <div
      className="flex items-center gap-2 text-xs"
      style={{ fontFamily: "Share Tech Mono, monospace", color: met ? "#00cc66" : "rgba(120,140,160,0.5)" }}
    >
      <span ref={iconRef} style={{ display: "inline-flex" }}>
        {met ? (
          <CheckCircle className="h-3 w-3 flex-shrink-0" style={{ color: "#00cc66" }} />
        ) : (
          <XCircle className="h-3 w-3 flex-shrink-0" style={{ color: "rgba(120,140,160,0.4)" }} />
        )}
      </span>
      {text}
    </div>
  );
}
