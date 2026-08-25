import { useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getFixedChromeHost } from "@/motion/portalHost";
import { ScrollSmoother, ScrollTrigger } from "@/motion/gsapSetup";

const navItems = [
  { name: "Mission", href: "#hero" },
  { name: "Features", href: "#features" },
  { name: "Initiate", href: "#join" },
];

/**
 * Portalled into the shared fixed-chrome host (see `motion/portalHost.ts`)
 * rather than rendered in place. This nav is `position: fixed`, and
 * `ScrollSmootherProvider` wraps the whole app, so left inside
 * `#smooth-content` its `top: 0` resolves against that transformed div instead
 * of the viewport and the bar scrolls off the top of the screen with the page
 * — the same defect that was measured and fixed on the three dashboard
 * navbars. The host sits before `#root`, so the nav keeps its natural
 * first-in-document position for tab and screen-reader order.
 *
 * Portalled DOM stays in the React tree, so `useAuth`/`useNavigate` context,
 * the `isOpen` mobile-menu state and the framer-motion entrance below all
 * behave exactly as before; only the DOM parent changes.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    setIsOpen(false);

    const smoother = ScrollSmoother.get();

    // "#hero" is itself the trigger of IntroSequence's pin — asking
    // ScrollSmoother to look up that element's position while it's actively
    // pinned returns whatever transient rect the pin currently holds it at,
    // not its true top-of-page offset. "Mission" always means the very top,
    // so target the absolute scroll position instead of resolving the DOM node.
    if (href === "#hero" && smoother) {
      smoother.scrollTo(0, true);
      return;
    }

    // "#features" sits inside IntroSequence's pinned/scrubbed scroll sequence,
    // where a DOM offset doesn't correspond to a stable visual state — resolve
    // it via the labeled position on that ScrollTrigger's timeline instead.
    if (href === "#features") {
      const st = ScrollTrigger.getById("hero-sequence");
      if (st && smoother) {
        smoother.scrollTo(st.labelToScroll("features"), true);
        return;
      }
    }

    // ScrollSmoother drives scroll via a transform, not native window scroll —
    // native scrollIntoView() fights it, so route through the smoother when
    // it's active (it isn't created at all under reduced motion).
    if (smoother) {
      smoother.scrollTo(href, true, "top top");
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return createPortal(
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/60 border-b border-cyan-500/30 shadow-[0_0_15px_rgba(0,243,255,0.1)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 flex items-center gap-2" data-cursor-hover>
            <div className="relative w-10 h-10 flex items-center justify-center bg-cyan-900/20 border border-cyan-500 rounded-lg shadow-[0_0_10px_rgba(0,243,255,0.3)]">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="font-display font-bold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              IMS
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                data-cursor-hover
                onClick={(e) => handleNavClick(e, item.href)}
                className="relative px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {item.name}
              </a>
            ))}
            <button
              data-cursor-hover
              onClick={() => navigate(user ? `/${user.userType.toLowerCase()}` : "/login")}
              className="ml-4 px-6 py-2 bg-transparent border border-cyan-500 text-cyan-300 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] transition-all duration-300 font-display text-sm tracking-wider uppercase rounded-sm"
            >
              {user ? "Dashboard" : "Login"}
            </button>
          </div>

          <button
            className="md:hidden p-2 text-cyan-400"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="md:hidden bg-black/90 border-b border-cyan-500/30"
        >
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="block px-3 py-2 text-base text-gray-300 hover:text-white"
              >
                {item.name}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </motion.nav>,
    getFixedChromeHost()
  );
}
