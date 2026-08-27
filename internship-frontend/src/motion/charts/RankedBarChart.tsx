import { motion } from "framer-motion";
import StatCounter from "../StatCounter";
import { staggerContainer, staggerItem } from "../staggerVariants";

export interface RankedBarItem {
  label: string;
  value: number;
  sublabel?: string;
}

export interface RankedBarChartProps {
  items: RankedBarItem[];
  color: string;
  emptyLabel?: string;
}

export default function RankedBarChart({
  items,
  color,
  emptyLabel = "No data available",
}: RankedBarChartProps) {
  if (items.length === 0) {
    return (
      <p
        className="font-['Share_Tech_Mono'] text-xs text-center py-4"
        style={{ color: "rgba(160,180,200,0.4)" }}
      >
        {emptyLabel}
      </p>
    );
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <motion.div className="space-y-3" variants={staggerContainer()} initial="hidden" animate="show">
      {items.map((item, i) => (
        <motion.div key={`${item.label}-${i}`} variants={staggerItem()}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-['Orbitron'] text-xs text-white truncate">{item.label}</span>
            <span className="font-['Share_Tech_Mono'] text-xs" style={{ color }}>
              <StatCounter value={item.value} />
              {item.sublabel ? ` · ${item.sublabel}` : ""}
            </span>
          </div>
          <div
            className="h-2 w-full rounded-full overflow-hidden"
            style={{ background: "rgba(160,180,200,0.1)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: color, boxShadow: `0 0 8px ${color}` }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
