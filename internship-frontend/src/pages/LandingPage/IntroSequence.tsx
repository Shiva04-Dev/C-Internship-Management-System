import { Suspense, lazy, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MonitorPlay, Gamepad2, ChevronDown, Globe, Bot, ShieldCheck, Layers } from "lucide-react";
import SplitReveal from "@/motion/SplitReveal";
import { useMagneticButton } from "@/motion/useMagneticButton";
import { registerGsapPlugins, gsap } from "@/motion/gsapSetup";
import { prefersReducedMotion } from "@/motion/reducedMotion";

const ShaderField = lazy(() => import("@/webgl/ShaderField"));

registerGsapPlugins();

const features = [
  {
    icon: Globe,
    title: "Global Network",
    description: "Access a wide database of corporations and startups looking for students.",
  },
  {
    icon: Bot,
    title: "Personalised Matchmaking",
    description: "Search for internships that relate to your degree and career interests.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Postings",
    description: "Every internship is tied to a real company account, reviewed by an admin team.",
  },
  {
    icon: Layers,
    title: "Available Any Time",
    description: "Search, apply, or post internships whenever suits you — the platform never closes.",
  },
];

function ShaderFallback() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(circle at 30% 20%, rgba(0,243,255,0.18), transparent 55%), radial-gradient(circle at 70% 80%, rgba(176,38,255,0.18), transparent 55%), #050510",
      }}
    />
  );
}

/**
 * Hero + Features as one continuous pinned scroll sequence: the viewport stays
 * fixed on the shader background while the foreground crossfades through the
 * hero intro, then each feature, one full-screen "scene" at a time. Falls back
 * to a normal stacked (unpinned) layout when reduced motion is preferred —
 * pinning/scroll-jacking is itself a motion effect that must be skippable.
 */
export default function IntroSequence() {
  const reduced = prefersReducedMotion();
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLElement | null>(null);
  const heroStageRef = useRef<HTMLDivElement | null>(null);
  const featureStageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const primaryRef = useMagneticButton<HTMLButtonElement>(110, 0.35);
  const secondaryRef = useMagneticButton<HTMLButtonElement>(90, 0.3);

  useGSAP(
    () => {
      if (reduced || !wrapperRef.current || !heroStageRef.current) return;

      const featureStages = featureStageRefs.current.filter(Boolean) as HTMLElement[];
      const stages = [heroStageRef.current, ...featureStages];

      gsap.set(featureStages, { autoAlpha: 0, y: 60 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: `+=${stages.length * 100}%`,
          pin: true,
          scrub: 1,
        },
      });

      // Outgoing and incoming panels only briefly overlap (~0.1 units) rather than
      // sharing the whole transition window — full overlap left two full-viewport
      // headlines readable on top of each other. The outgoing panel also shrinks
      // and blurs so it visually recedes behind the incoming one during that overlap.
      stages.forEach((stage, i) => {
        if (i === 0) return;
        const outStart = i - 0.6;
        const inStart = i - 0.35;
        tl.to(stages[i - 1], { autoAlpha: 0, y: -40, scale: 0.92, filter: "blur(8px)", duration: 0.35 }, outStart).fromTo(
          stage,
          { autoAlpha: 0, y: 60, scale: 1.05, filter: "blur(0px)" },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.35 },
          inStart
        );
      });
    },
    { scope: wrapperRef }
  );

  const stageClasses = reduced
    ? "relative w-full min-h-screen flex flex-col items-center justify-center text-center px-4 gap-6 py-24"
    : "absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-4 gap-6";

  return (
    <section
      id="hero"
      ref={wrapperRef as never}
      className={reduced ? "relative w-full text-white" : "relative w-full h-screen overflow-hidden text-white"}
    >
      {/* Scroll-jump target for the Navbar's "Features" link — lands just past the hero stage. */}
      {!reduced && <div id="features" className="absolute left-0 w-px h-px" style={{ top: "100vh" }} />}

      <Suspense fallback={<ShaderFallback />}>
        <ShaderField />
      </Suspense>

      <div ref={heroStageRef} className={stageClasses.replace("gap-6", "gap-8")}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-900/30 border border-cyan-500/50 text-cyan-300 text-sm font-display tracking-widest uppercase backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          System Online
        </div>

        <SplitReveal
          as="h1"
          className="w-full max-w-5xl mx-auto text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400"
        >
          FIND YOUR NEXT INTERNSHIP
        </SplitReveal>

        <p className="max-w-2xl text-lg md:text-xl text-cyan-100/80 font-light leading-relaxed">
          Browse verified opportunities, apply in minutes, and track every application in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mt-6 w-full justify-center">
          <button
            ref={primaryRef}
            data-cursor-hover
            onClick={() => navigate("/register")}
            className="group px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-sm font-display font-bold text-white tracking-wider uppercase transition-shadow hover:shadow-[0_0_30px_rgba(0,243,255,0.6)]"
          >
            <span className="flex items-center gap-3">
              <MonitorPlay className="w-5 h-5" />
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <button
            ref={secondaryRef}
            data-cursor-hover
            onClick={() => navigate("/login")}
            className="group px-8 py-4 bg-transparent border border-pink-500/50 text-pink-400 hover:text-white hover:bg-pink-500/20 rounded-sm font-display font-bold tracking-wider uppercase transition-colors"
          >
            <span className="flex items-center gap-3">
              <Gamepad2 className="w-5 h-5" />
              Sign In
            </span>
          </button>
        </div>

        {!reduced && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cyan-500/50 animate-bounce">
            <span className="text-xs uppercase tracking-[0.3em] font-display">Scroll</span>
            <ChevronDown className="w-6 h-6" />
          </div>
        )}
      </div>

      {features.map((feature, i) => (
        <div
          key={feature.title}
          ref={(el) => {
            featureStageRefs.current[i] = el;
          }}
          className={stageClasses}
        >
          <span className="text-7xl md:text-9xl font-display font-black text-cyan-500/10 leading-none select-none">
            0{i + 1}
          </span>
          <div className="w-16 h-16 -mt-8 rounded-lg bg-gray-900/80 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.3)]">
            <feature.icon className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="w-full max-w-4xl mx-auto text-5xl md:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-400">
            {feature.title}
          </h3>
          <p className="max-w-xl text-lg md:text-xl text-gray-300 leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </section>
  );
}
