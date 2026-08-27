import { motion } from "framer-motion";
import { ringSegments } from "./chartMath";
import { prefersReducedMotion } from "../reducedMotion";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  emptyLabel?: string;
}

export default function DonutChart({
  segments,
  size = 140,
  strokeWidth = 18,
  emptyLabel = "No data available",
}: DonutChartProps) {
  const reduced = prefersReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;
  const rings = ringSegments(
    segments.map((s) => s.value),
    circumference
  );

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(160,180,200,0.12)"
          strokeWidth={strokeWidth}
        />
        {rings.length > 0 && (
          <g transform={`rotate(-90 ${cx} ${cy})`}>
            {rings.map((ring, i) => (
              <motion.circle
                key={i}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={segments[i].color}
                strokeWidth={strokeWidth}
                strokeDasharray={ring.dashArray}
                initial={
                  reduced
                    ? { strokeDashoffset: ring.dashOffset }
                    : { strokeDashoffset: circumference }
                }
                animate={{ strokeDashoffset: ring.dashOffset }}
                transition={{ duration: 0.9, delay: reduced ? 0 : i * 0.12, ease: "easeOut" }}
              />
            ))}
          </g>
        )}
      </svg>
      <div className="space-y-1.5">
        {rings.length === 0 ? (
          <p
            className="font-['Share_Tech_Mono'] text-xs"
            style={{ color: "rgba(160,180,200,0.4)" }}
          >
            {emptyLabel}
          </p>
        ) : (
          segments.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              <span className="font-['Share_Tech_Mono'] text-xs text-white">{s.label}</span>
              <span className="font-['Orbitron'] text-xs" style={{ color: s.color }}>
                {s.value}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
