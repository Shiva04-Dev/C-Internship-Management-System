import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { getFixedChromeHost } from "./portalHost";

export interface FixedNavbarProps {
  children: ReactNode;
  className?: string;
}

export default function FixedNavbar({ children, className = "retro-navbar" }: FixedNavbarProps) {
  return createPortal(<header className={className}>{children}</header>, getFixedChromeHost());
}
