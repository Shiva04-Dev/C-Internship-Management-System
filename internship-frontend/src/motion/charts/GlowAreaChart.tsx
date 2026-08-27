import { useId } from "react";
import { motion } from "framer-motion";
import { normalizePoints, areaPathD, linePathD } from "./chartMath";
import { prefersReducedMotion } from "../reducedMotion";

export interface GlowAreaChartPoint {
  date: string;
  count: number;
}

export interface GlowAreaChartProps {
  data: GlowAreaChartPoint[];
  color: string;
  height?: number;
  emptyLabel?: string;
}

const VIEW_WIDTH = 600;

export default function GlowAreaChart({
  data,
  color,
  height = 160,
  emptyLabel = "No application activity yet",
}: GlowAreaChartProps) {
  const filterId = useId();
  const reduced = prefersReducedMotion();

  if (data.length < 2) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <p
          className="font-['Share_Tech_Mono'] text-xs"
          style={{ color: "rgba(160,180,200,0.4)" }}
        >
          {emptyLabel}
        </p>
      </div>
    );
  }

  const points = normalizePoints(data.map((d) => d.count), VIEW_WIDTH, height, 12);
  const area = areaPathD(points, height);
  const line = linePathD(points);

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d={area}
        fill={color}
        fillOpacity={0.12}
        stroke="none"
        initial={reduced ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: reduced ? 0 : 0.3 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        filter={`url(#${filterId})`}
        initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}
