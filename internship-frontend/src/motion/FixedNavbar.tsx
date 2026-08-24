import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { getFixedChromeHost } from "./portalHost";

export interface FixedNavbarProps {
  children: ReactNode;
  className?: string;
}

/**
 * The dashboards' `position: fixed` top navbar, portalled out of the smoothed
 * content into the shared fixed-chrome host.
 *
 * See `portalHost.ts` for the full reasoning: ScrollSmoother's `transform` on
 * `#smooth-content` makes it the containing block for `position: fixed`
 * descendants, so a navbar rendered inline resolves `top: 0` against that div
 * rather than the viewport and scrolls off-screen with the page. Measured live
 * before this fix: at `window.scrollY === 539` the navbar's
 * `getBoundingClientRect().top` was `-539`.
 *
 * The host sits BEFORE `#root`, so the navbar's controls stay first in tab and
 * screen-reader order — an earlier revision of this component portalled
 * straight to `document.body`, which appended it and pushed those controls
 * after all the page content.
 *
 * Trade-off worth knowing: outside `PageTransition`'s animated wrapper the
 * navbar doesn't take part in the route-change clip-path wipe — it stays fully
 * opaque until the outgoing route unmounts instead of wiping with it. That's a
 * small cosmetic difference against a navbar that otherwise scrolls away.
 */
export default function FixedNavbar({ children, className = "retro-navbar" }: FixedNavbarProps) {
  return createPortal(<header className={className}>{children}</header>, getFixedChromeHost());
}
