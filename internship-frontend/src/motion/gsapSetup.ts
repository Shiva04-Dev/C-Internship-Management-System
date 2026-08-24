import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

let registered = false;

/** Registers every GSAP plugin this app uses. Safe to call from multiple modules. */
export function registerGsapPlugins() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, DrawSVGPlugin);
  registered = true;
}

export { gsap, ScrollTrigger, ScrollSmoother, DrawSVGPlugin };
