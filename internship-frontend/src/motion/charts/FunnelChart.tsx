import { motion } from "framer-motion";
import { funnelWidths } from "./chartMath";

export interface FunnelStage {
  label: string;
  value: number;
}

export interface FunnelChartProps {
  stages: FunnelStage[];
  color: string;
  emptyLabel?: string;
}

export default function FunnelChart({
  stages,
  color,
  emptyLabel = "No applications yet",
}: FunnelChartProps) {
  const widths = funnelWidths(stages.map((s) => s.value));
  const isEmpty = widths.length === 0 || widths.every((w) => w === 0);

  if (isEmpty) {
    return (
      <p
        className="font-['Share_Tech_Mono'] text-xs text-center py-4"
        style={{ color: "rgba(160,180,200,0.4)" }}
      >
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => (
        <div key={stage.label} className="flex flex-col items-center">
          <div
            className="font-['Share_Tech_Mono'] text-xs mb-1"
            style={{ color: "rgba(200,210,225,0.7)" }}
          >
            {stage.label} ·{" "}
            <span className="font-['Orbitron']" style={{ color }}>
              {stage.value}
            </span>
          </div>
          <motion.div
            className="h-6 rounded-sm"
            style={{ background: `${color}22`, border: `1px solid ${color}` }}
            initial={{ width: 0 }}
            animate={{ width: `${widths[i]}%` }}
            transition={{ duration: 0.7, delay: i * 0.15, ease: "easeOut" }}
          />
        </div>
      ))}
    </div>
  );
}
