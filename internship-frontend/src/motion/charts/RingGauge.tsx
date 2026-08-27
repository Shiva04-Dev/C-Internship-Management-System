import { motion } from "framer-motion";
import { ringSegments, clampPercent } from "./chartMath";
import { prefersReducedMotion } from "../reducedMotion";

export interface RingGaugeProps {
  value: number;
  total: number;
  label: string;
  color: string;
  size?: number;
  strokeWidth?: number;
  emptyLabel?: string;
}

export default function RingGauge({
  value,
  total,
  label,
  color,
  size = 140,
  strokeWidth = 14,
  emptyLabel = "No decisions yet",
}: RingGaugeProps) {
  const reduced = prefersReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;
  const percent = clampPercent(value, total);
  const [filled] = ringSegments([percent, 100 - percent], circumference);

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
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <motion.circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={filled.dashArray}
            initial={
              reduced
                ? { strokeDashoffset: filled.dashOffset }
                : { strokeDashoffset: circumference }
            }
            animate={{ strokeDashoffset: filled.dashOffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </g>
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          className="font-['Orbitron']"
          style={{ fill: color, fontSize: 26, fontWeight: 800 }}
        >
          {total > 0 ? `${Math.round(percent)}%` : "—"}
        </text>
      </svg>
      <p
        className="font-['Orbitron'] text-xs tracking-widest uppercase mt-2"
        style={{ color: "rgba(160,180,200,0.5)" }}
      >
        {label}
      </p>
      <p
        className="font-['Share_Tech_Mono'] text-xs mt-1"
        style={{ color: "rgba(160,180,200,0.4)" }}
      >
        {total > 0 ? `${value}/${total}` : emptyLabel}
      </p>
    </div>
  );
}
