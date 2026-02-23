import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Bot, Globe, Layers, ShieldCheck, Github, Linkedin, Monitor, ChevronDown, Gamepad2, MonitorPlay, UserPlus, Radar, Send, Rocket, Menu, Quote, Terminal, Wifi } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* --- Navbar --- */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const navItems = [
    { name: 'Mission', href: '#hero' },
    { name: 'Features', href: '#features' },
    { name: 'Access Logs', href: '#testimonials' },
    { name: 'Initiate', href: '#join' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/60 border-b border-cyan-500/30 shadow-[0_0_15px_rgba(0,243,255,0.1)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
            <div className="relative w-10 h-10 flex items-center justify-center bg-cyan-900/20 border border-cyan-500 rounded-lg shadow-[0_0_10px_rgba(0,243,255,0.3)] group-hover:shadow-[0_0_20px_rgba(0,243,255,0.6)] transition-all duration-300">
              <Zap className="w-6 h-6 text-cyan-400 group-hover:text-white transition-colors" />
            </div>
            <span className="font-display font-bold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 group-hover:to-pink-500 transition-all duration-500">
              IMS
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="relative px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white transition-colors group overflow-hidden"
                >
                  <span className="relative z-10">{item.name}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 group-hover:w-full transition-all duration-300 ease-out"></span>
                </a>
              ))}
              
              {user ? (
                <button 
                  onClick={() => window.location.href = `/${user.userType.toLowerCase()}`}
                  className="ml-4 px-6 py-2 bg-transparent border border-green-500 text-green-400 hover:bg-green-500/10 hover:shadow-[0_0_15px_rgba(0,255,0,0.4)] transition-all duration-300 font-display text-sm tracking-wider uppercase rounded-sm skew-x-[-10deg]"
                >
                  <span className="block skew-x-[10deg]">Dashboard</span>
                </button>
              ) : (
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="ml-4 px-6 py-2 bg-transparent border border-pink-500 text-pink-400 hover:bg-pink-500/10 hover:shadow-[0_0_15px_rgba(255,0,153,0.4)] transition-all duration-300 font-display text-sm tracking-wider uppercase rounded-sm skew-x-[-10deg]"
                >
                  <span className="block skew-x-[10deg]">Login_System</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-cyan-400 hover:text-white hover:bg-cyan-900/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="md:hidden bg-black/90 border-b border-cyan-500/30 backdrop-blur-xl"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-cyan-900/20 border-l-2 border-transparent hover:border-cyan-500 transition-all"
              >
                {item.name}
              </a>
            ))}
            {user ? (
              <button 
                onClick={() => window.location.href = `/${user.userType.toLowerCase()}`}
                className="w-full text-left mt-4 px-3 py-2 text-green-400 font-display uppercase tracking-widest border border-green-500/30 hover:bg-green-500/10 transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <button 
                onClick={() => window.location.href = '/login'}
                className="w-full text-left mt-4 px-3 py-2 text-pink-400 font-display uppercase tracking-widest border border-pink-500/30 hover:bg-pink-500/10 transition-colors"
              >
                Login_System
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

/* --- Hero --- */
const Hero = () => {
  return (
    <section id="hero" className="relative w-full h-screen overflow-hidden flex flex-col justify-center items-center bg-gray-950 text-white z-10">
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 bg-fixed blur-sm" />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/90 via-gray-950/60 to-purple-900/40 z-0" />
      
      {/* Animated Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] bg-repeat" />

      {/* Main Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-8">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-900/30 border border-cyan-500/50 text-cyan-300 text-sm font-display tracking-widest uppercase shadow-[0_0_15px_rgba(0,243,255,0.3)] backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          System Online // V.20.85
        </motion.div>

        <motion.h1 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]"
        >
          FUTURE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 drop-shadow-[0_0_25px_rgba(176,38,255,0.6)]">
            READY
          </span>
        </motion.h1>

        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="max-w-2xl text-lg md:text-xl text-cyan-100/80 font-light tracking-wide leading-relaxed font-body"
        >
          Upload your potential to the mainframe. Connect with internship protocols and override the competition. Your career upgrade awaits.
        </motion.p>

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 mt-6 w-full justify-center"
        >
          <button 
            onClick={() => window.location.href = '/register'}
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-sm font-display font-bold text-white tracking-wider uppercase overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] skew-x-[-10deg]"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <div className="flex items-center gap-3 skew-x-[10deg]">
              <MonitorPlay className="w-5 h-5" />
              <span>Initialize Career</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
          
          <button 
            onClick={() => window.location.href = '/login'}
            className="group px-8 py-4 bg-transparent border border-pink-500/50 text-pink-400 hover:text-white hover:bg-pink-500/20 rounded-sm font-display font-bold tracking-wider uppercase transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,0,153,0.4)] skew-x-[-10deg]"
          >
            <div className="flex items-center gap-3 skew-x-[10deg]">
              <Gamepad2 className="w-5 h-5" />
              <span>Continue Hunt</span>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-10 lg:left-32 w-24 h-24 border border-cyan-500/20 rounded-full blur-xl bg-cyan-500/10 z-0 hidden md:block"
      />
      <motion.div 
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/3 right-10 lg:right-32 w-32 h-32 border border-purple-500/20 rounded-full blur-xl bg-purple-500/10 z-0 hidden md:block"
      />

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-cyan-500/50"
      >
        <span className="text-xs uppercase tracking-[0.3em] font-display">Scroll to Navigate</span>
        <ChevronDown className="w-6 h-6 animate-bounce" />
      </motion.div>
    </section>
  );
};

/* --- Features --- */
const Features = () => {
  const features = [
    {
      icon: <Globe className="w-8 h-8 text-cyan-400" />,
      title: "Global Network",
      description: "Access a wide database of corporations and startups that are looking for Students.",
      color: "cyan"
    },
    {
      icon: <Bot className="w-8 h-8 text-purple-400" />,
      title: "Personalised Matchmaking",
      description: "Search for specific internships that relate to your degree and/or career.",
      color: "purple"
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-pink-400" />,
      title: "Verified Protocols",
      description: "All opportunities posted by companies are scanned and verified for maximum security and quality in order save your privacy.",
      color: "pink"
    },
    {
      icon: <Layers className="w-8 h-8 text-green-400" />,
      title: "Available at your convinence",
      description: "Active 24/7 so you can search, apply or post internships at any time.",
      color: "green"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section id="features" className="py-24 bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-purple-900/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-cyan-900/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold text-white mb-4"
          >
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Modules</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto font-body"
          >
            Equip yourself with advanced tools designed to navigate the corporate matrix.
          </motion.p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="group relative bg-gray-800/50 border border-gray-700 hover:border-cyan-500/50 p-8 rounded-xl backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,243,255,0.15)] hover:-translate-y-2 overflow-hidden"
            >
              {/* Hover Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Scanline effect on hover */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(0,243,255,0.1)_50%,transparent_100%)] translate-y-[-100%] group-hover:animate-[scan_2s_linear_infinite] opacity-0 group-hover:opacity-100 pointer-events-none h-[200%]" />

              <div className="relative z-10 flex flex-col gap-4">
                <div className={`w-14 h-14 rounded-lg bg-gray-900/80 border border-gray-700 flex items-center justify-center group-hover:scale-110 group-hover:border-${feature.color}-500/50 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-display font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 font-body leading-relaxed group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* --- HowItWorks --- */
const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Initialize Profile",
      description: "Upload your credentials to the secure mainframe. Our system encrypts your data for maximum privacy.",
      icon: <UserPlus className="w-6 h-6" />
    },
    {
      id: 2,
      title: "Scan Opportunities",
      description: "Activate the radar to detect compatible internship signals in your sector.",
      icon: <Radar className="w-6 h-6" />
    },
    {
      id: 3,
      title: "Engage Protocol",
      description: "Transmit your application through our high-speed direct link channels.",
      icon: <Send className="w-6 h-6" />
    },
    {
      id: 4,
      title: "Mission Start",
      description: "Launch your career trajectory. Prepare for lift-off into the professional stratosphere.",
      icon: <Rocket className="w-6 h-6" />
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gray-950 relative">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #4c1d95 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 tracking-wider">
            OPERATION <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">SEQUENCE</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-body">
            Follow the designated path to override standard career limitations.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-cyan-500/20 via-purple-500/50 to-pink-500/20 hidden md:block" />
          
          <div className="space-y-12 md:space-y-24">
            {steps.map((step, index) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Text Side */}
                <div className={`flex-1 text-center ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                  <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 font-body leading-relaxed max-w-md mx-auto md:mx-0">
                    {step.description}
                  </p>
                </div>

                {/* Center Node (Icon) */}
                <div className="relative flex-shrink-0 z-10">
                  <div className="w-16 h-16 rounded-full bg-gray-900 border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.4)] relative">
                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping opacity-20" />
                    <span className="text-cyan-400">
                      {step.icon}
                    </span>
                  </div>
                  {/* Number Badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-xs font-bold text-white border border-pink-400">
                    {step.id}
                  </div>
                </div>

                {/* Spacer Side */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* --- Testimonials --- */
const Testimonials = () => {
  const testimonials = [
    {
      name: "Student",
      role: "Aspiring Software Engineer",
      text: "The system allows us to browse through several internships, easy application process, let's us track our applications, and basically manage our journey.",
      status: "ONLINE"
    },
    {
      name: "Company",
      role: "Software Inc.",
      text: "INTERLINK's algorithm allows us to post intership opportunities, review applications of students with ease, manage our potenial candidates and lets us build our talent pipeline.",
      status: "ONLINE"
    },
    {
      name: "Admin",
      role: "Overseer @ IMS",
      text: "We guard the application and its users from potential threats by monitoring platform activity, moderate the content being posted, and ensure the is quality control.",
      status: "ONLINE"
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs font-display tracking-widest uppercase animate-pulse">
            <Wifi className="w-3 h-3" />
            Incoming Transmission
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Access <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500">LOGS</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-gray-950 border border-gray-700 p-6 rounded-lg relative group hover:border-green-500/50 transition-colors shadow-lg"
            >
              {/* Terminal Header */}
              <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-mono">
                  <Terminal className="w-3 h-3" />
                  <span>LOG_ID_{1000 + index}</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                  <div className="w-2 h-2 rounded-full bg-green-500/50" />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <Quote className="w-8 h-8 text-gray-700 mb-4 group-hover:text-green-500/50 transition-colors" />
                <p className="text-gray-300 font-mono text-sm leading-relaxed mb-6">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 p-[1px]">
                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-white">
                      {testimonial.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-display text-sm font-bold tracking-wide">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-500 text-xs font-mono uppercase">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scanline Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(0,255,0,0.05)_50%,transparent_100%)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* --- CallToAction --- */
const CallToAction = () => {
  return (
    <section id="join" className="py-32 relative flex items-center justify-center overflow-hidden bg-black">
      {/* Background Explosions */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
        >
          <h2 className="text-5xl md:text-7xl font-display font-black text-white mb-8 tracking-tight drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]">
            READY TO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-pink-500 animate-text">
              OVERRIDE?
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-cyan-100/80 mb-12 font-body max-w-2xl mx-auto">
            The internship simulation is ending. Real career advancement begins now. Join the network.
          </p>

          <button 
            onClick={() => window.location.href = '/register'}
            className="relative group px-12 py-6 bg-white text-black font-display font-black text-xl tracking-widest uppercase skew-x-[-10deg] hover:scale-110 transition-transform duration-300 shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:shadow-[0_0_80px_rgba(0,243,255,0.6)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
            <span className="flex items-center gap-4 skew-x-[10deg]">
              <Zap className="w-6 h-6 fill-black" />
              Initialize Sequence
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </span>
          </button>
          
          <p className="mt-8 text-sm text-gray-500 font-mono">
            // SECURE CONNECTION ESTABLISHED
          </p>
        </motion.div>
      </div>
    </section>
  );
};

/* --- Footer --- */
const Footer = () => {
  return (
    <footer className="relative bg-gray-950 border-t border-cyan-900/50 overflow-hidden">
      {/* Footer Grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] bg-repeat pointer-events-none opacity-20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-purple-600 flex items-center justify-center border border-cyan-400">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-white tracking-widest uppercase">
                INTERLINK
              </span>
            </div>
            <p className="text-gray-400 font-body max-w-sm mb-6">
              Advancing human potential through next-generation internship placement algorithms. The future is built here.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-pink-500 hover:bg-pink-900/20 transition-all hover:scale-110 shadow-[0_0_10px_rgba(255,0,153,0.1)] hover:shadow-[0_0_20px_rgba(255,0,153,0.5)]">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500 hover:bg-purple-900/20 transition-all hover:scale-110 shadow-[0_0_10px_rgba(176,38,255,0.1)] hover:shadow-[0_0_20px_rgba(176,38,255,0.5)]">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

/* --- Main LandingPage Component --- */
const LandingPage = () => {
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default LandingPage;