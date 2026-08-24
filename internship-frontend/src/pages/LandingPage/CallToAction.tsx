import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import { useMagneticButton } from "@/motion/useMagneticButton";

export default function CallToAction() {
  const ctaRef = useMagneticButton<HTMLButtonElement>(140, 0.3);
  const navigate = useNavigate();

  return (
    <section id="join" className="py-32 relative flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-[120px] rounded-full animate-pulse" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        >
          <h2 className="text-5xl md:text-7xl font-display font-black text-white mb-8 tracking-tight">
            READY TO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-pink-500">GET STARTED?</span>
          </h2>
          <p className="text-xl md:text-2xl text-cyan-100/80 mb-12 max-w-2xl mx-auto">
            Create your profile and start applying to internships today.
          </p>
          <button
            ref={ctaRef}
            data-cursor-hover
            onClick={() => navigate("/register")}
            className="relative group px-12 py-6 bg-white text-black font-display font-black text-xl tracking-widest uppercase hover:scale-105 transition-transform"
          >
            <span className="flex items-center gap-4">
              <Zap className="w-6 h-6 fill-black" />
              Create Account
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
