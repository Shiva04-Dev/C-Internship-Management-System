import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { UserPlus, Radar, Send, Rocket } from "lucide-react";
import { registerGsapPlugins, gsap } from "@/motion/gsapSetup";
import { prefersReducedMotion } from "@/motion/reducedMotion";

registerGsapPlugins();

const steps = [
  { id: 1, title: "Create Your Profile", description: "Sign up and tell us your degree, university, and interests.", icon: UserPlus },
  { id: 2, title: "Browse Opportunities", description: "Search and filter internships that match what you're looking for.", icon: Radar },
  { id: 3, title: "Apply", description: "Submit your application and resume directly through the platform.", icon: Send },
  { id: 4, title: "Get Hired", description: "Track your status and hear back from companies in one place.", icon: Rocket },
];

/** Each step as a full-viewport panel scrubbed with scroll; falls back to a plain stack under reduced motion. */
export default function HowItWorks() {
  const reduced = prefersReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (reduced || !sectionRef.current || !trackRef.current) return;

      const totalScroll = trackRef.current.scrollWidth - window.innerWidth;
      if (totalScroll <= 0) return;

      gsap.to(trackRef.current, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${totalScroll}`,
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            if (progressRef.current) gsap.set(progressRef.current, { scaleX: self.progress });
          },
        },
      });
    },
    { scope: sectionRef }
  );

  if (reduced) {
    return (
      <section id="how-it-works" className="py-24 bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Works</span>
          </h2>
          <p className="text-xl text-gray-400 mb-16">Four steps from signing up to your first offer.</p>

          <div className="space-y-12 text-left">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gray-900 border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                    <step.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-xs font-bold text-white">
                    {step.id}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="how-it-works" ref={sectionRef as never} className="relative h-screen overflow-hidden bg-gray-950">
      <div className="absolute top-0 left-0 right-0 z-20 pt-28 text-center px-4">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
          How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Works</span>
        </h2>
        <p className="text-gray-400">Scroll to walk through the four steps.</p>
      </div>

      <div className="absolute top-[190px] left-8 right-8 md:left-24 md:right-24 h-1 bg-gray-800 z-20 rounded-full overflow-hidden">
        <div ref={progressRef} className="h-full w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 origin-left" style={{ transform: "scaleX(0)" }} />
      </div>

      <div ref={trackRef} className="flex h-full items-center will-change-transform">
        {steps.map((step) => (
          <div key={step.id} className="flex-shrink-0 w-screen h-full flex flex-col items-center justify-center px-4 gap-6 text-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-900 border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(0,243,255,0.4)]">
                <step.icon className="w-10 h-10 text-cyan-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-sm font-bold text-white">
                {step.id}
              </div>
            </div>
            <h3 className="text-3xl md:text-5xl font-display font-bold text-white">{step.title}</h3>
            <p className="text-gray-400 max-w-md leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
