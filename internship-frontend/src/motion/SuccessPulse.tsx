import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { prefersReducedMotion } from "./reducedMotion";

export interface SuccessPulseProps {
  trigger: number;
  color?: string;
}

export default function SuccessPulse({ trigger, color = "#00cc66" }: SuccessPulseProps) {
  const [visible, setVisible] = useState(false);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (trigger === 0 || reduced) return;
    setVisible(true);
    const timeout = setTimeout(() => setVisible(false), 700);
    return () => clearTimeout(timeout);
  }, [trigger, reduced]);

  if (reduced) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ zIndex: 20 }}>
      <AnimatePresence>
        {visible && (
          <motion.div
            key={trigger}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.35, ease: "backOut" }}
            style={{ position: "absolute" }}
          >
            <motion.span
              initial={{ opacity: 0.5, scale: 0.6 }}
              animate={{ opacity: 0, scale: 2.2 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                position: "absolute",
                inset: "-10px",
                borderRadius: "9999px",
                border: `1.5px solid ${color}`,
              }}
            />
            <CheckCircle2 className="h-7 w-7" style={{ color, filter: `drop-shadow(0 0 8px ${color})` }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
