import { motion } from "framer-motion";
import { ringSegments } from "./chartMath";
import { prefersReducedMotion } from "../reducedMotion";

export interface RadialSegment {
  label: string;
  value: number;
  color: string;
}

export interface RadialChartProps {
  segments: RadialSegment[];
  size?: number;
  strokeWidth?: number;
  emptyLabel?: string;
}

export default function RadialChart({
  segments,
  size = 140,
  strokeWidth = 24,
  emptyLabel = "No data available",
}: RadialChartProps) {
  const reduced = prefersReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const rings = ringSegments(
    segments.map((s) => s.value),
    circumference
  );
  const primary = segments[0];

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(160,180,200,0.1)"
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
                strokeLinecap="butt"
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
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="font-['Orbitron']"
          style={{ fill: "#fff", fontSize: 22, fontWeight: 800 }}
        >
          {total > 0 && primary ? primary.value : "—"}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          className="font-['Share_Tech_Mono']"
          style={{ fill: "rgba(160,180,200,0.6)", fontSize: 9 }}
        >
          {total > 0 && primary ? primary.label.toUpperCase() : ""}
        </text>
      </svg>
      {total === 0 ? (
        <p
          className="font-['Share_Tech_Mono'] text-xs mt-2"
          style={{ color: "rgba(160,180,200,0.4)" }}
        >
          {emptyLabel}
        </p>
      ) : (
        <div className="flex gap-4 mt-2">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              <span
                className="font-['Share_Tech_Mono'] text-xs"
                style={{ color: "rgba(200,210,225,0.7)" }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
