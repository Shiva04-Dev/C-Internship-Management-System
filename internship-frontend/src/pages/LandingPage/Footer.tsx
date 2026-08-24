import { Github, Linkedin, Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gray-950 border-t border-cyan-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-purple-600 flex items-center justify-center border border-cyan-400">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-white tracking-widest uppercase">IMS</span>
          </div>

          <p className="text-gray-400 max-w-sm text-center md:text-left">
            Connecting students with the internships that launch their careers.
          </p>

          <div className="flex gap-4">
            <a
              href="https://github.com/Shiva04-Dev"
              data-cursor-hover
              className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-pink-500 transition-all"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/shiva-ganesh-nagadan/"
              data-cursor-hover
              className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500 transition-all"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
