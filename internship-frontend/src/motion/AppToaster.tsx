import { Toaster } from "react-hot-toast";
import { prefersReducedMotion } from "./reducedMotion";

export interface AppToasterProps {
  accent?: "cyan" | "red";
}

const ACCENT_BORDERS: Record<NonNullable<AppToasterProps["accent"]>, string> = {
  cyan: "rgba(0,243,255,0.3)",
  red: "rgba(255,80,80,0.3)",
};

export default function AppToaster({ accent = "cyan" }: AppToasterProps) {
  const reduced = prefersReducedMotion();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "app-toast",
        style: {
          background: "#080820",
          border: `1px solid ${ACCENT_BORDERS[accent]}`,
          color: "#d0d8e8",
          fontFamily: "Share Tech Mono, monospace",
          fontSize: "0.8rem",
          animation: reduced ? "none" : "toastPopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        },
      }}
    />
  );
}
