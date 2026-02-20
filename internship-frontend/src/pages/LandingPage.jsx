import { Link } from 'react-router-dom';
import { Briefcase, Building2, GraduationCap, Shield, ArrowRight, CheckCircle, Users, Zap, Target, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050510] text-[#d0d8e8] overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="retro-navbar">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-cyan-900/30 border border-cyan-500 flex items-center justify-center" style={{boxShadow:'0 0 12px rgba(0,243,255,0.3)'}}>
              <Briefcase className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="font-['Orbitron'] font-black text-xl tracking-widest text-transparent bg-clip-text" style={{backgroundImage:'linear-gradient(to right, #00f3ff, #b026ff)'}}>IMS</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="font-['Orbitron'] text-xs tracking-widest text-cyan-400/70 hover:text-cyan-400 uppercase transition-colors">Modules</a>
            <a href="#users" className="font-['Orbitron'] text-xs tracking-widest text-cyan-400/70 hover:text-cyan-400 uppercase transition-colors">Protocols</a>
            <Link to="/login" className="btn-retro-primary" style={{padding:'0.45rem 1.2rem', fontSize:'0.62rem'}}>Login_System</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center items-center pt-20 overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 grid-bg opacity-60" />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{background:'radial-gradient(ellipse at 50% 60%, rgba(0,100,200,0.15) 0%, transparent 65%), radial-gradient(ellipse at 20% 80%, rgba(176,38,255,0.1) 0%, transparent 50%)'}} />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-12 w-40 h-40 rounded-full animate-float" style={{background:'rgba(0,243,255,0.04)', border:'1px solid rgba(0,243,255,0.1)', filter:'blur(2px)'}} />
        <div className="absolute bottom-1/3 right-12 w-56 h-56 rounded-full animate-float" style={{animationDelay:'2s', background:'rgba(176,38,255,0.04)', border:'1px solid rgba(176,38,255,0.1)', filter:'blur(2px)'}} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="section-tag mx-auto mb-8" style={{display:'inline-flex'}}>
            <span style={{marginLeft:'0.25rem'}}>System Online // v2.0.85</span>
          </div>

          <h1 className="hero-title text-6xl md:text-8xl lg:text-9xl mb-6">
            HELPING<br />
            <span style={{backgroundImage:'linear-gradient(135deg, #b026ff, #ff0099, #ff9d00)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', filter:'drop-shadow(0 0 25px rgba(176,38,255,0.5))'}}>YOU.</span>
          </h1>

          <p className="text-xl text-cyan-100/60 mb-12 max-w-2xl mx-auto leading-relaxed" style={{fontFamily:'Rajdhani, sans-serif', fontWeight:400}}>
            The modern internship platform connecting ambitious students with innovative companies. Initialize your career protocol today.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/register?type=student" className="btn-retro-primary text-base">
              <GraduationCap className="h-5 w-5" />
              <span>I'm a Student</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/register?type=company" className="btn-retro-secondary text-base">
              <Building2 className="h-5 w-5" />
              <span>We are a Company</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{color:'rgba(0,243,255,0.4)'}}>
          <span className="font-['Orbitron'] text-xs tracking-[0.3em] uppercase">Scroll to Navigate</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="section-tag" style={{display:'inline-flex'}}>
              <span style={{marginLeft:'0.25rem'}}>System Modules</span>
            </div>
            <h2 className="text-4xl md:text-5xl text-white mb-4">
              Powerful <span className="text-glow-cyan" style={{color:'var(--neon-cyan)'}}>Features</span>
            </h2>
            <p className="text-lg" style={{color:'rgba(160,180,210,0.7)', fontFamily:'Rajdhani, sans-serif'}}>Everything you need in one platform</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="h-7 w-7 text-cyan-400" />, title: 'Lightning Fast', desc: 'Search and apply to internships in seconds with our optimized interface protocols.', color: 'var(--neon-cyan)' },
              { icon: <Shield className="h-7 w-7 text-purple-400" />, title: 'Secure & Private', desc: 'Your data is protected with enterprise-grade security measures and encryption.', color: 'var(--neon-purple)' },
              { icon: <Target className="h-7 w-7 text-pink-400" />, title: 'Smart Matching', desc: 'AI-powered recommendations connect you with perfect opportunities in the network.', color: 'var(--neon-pink)' },
            ].map((f, i) => (
              <div key={i} className="internship-card group" style={{animationDelay:`${i*0.1}s`}}>
                <div className="w-14 h-14 flex items-center justify-center mb-5 border transition-all duration-300 group-hover:scale-110"
                     style={{background:'rgba(0,0,20,0.8)', borderColor: f.color + '40', boxShadow:`0 0 12px ${f.color}20`}}>
                  {f.icon}
                </div>
                <h3 className="text-xl text-white mb-3" style={{fontFamily:'Orbitron, sans-serif', fontSize:'0.95rem'}}>{f.title}</h3>
                <p style={{color:'rgba(160,180,210,0.65)', fontFamily:'Rajdhani, sans-serif', lineHeight:1.6}}>{f.desc}</p>
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{background:f.color, boxShadow:`0 0 8px ${f.color}`}} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USER TYPES */}
      <section id="users" className="py-24 relative" style={{background:'rgba(0,0,10,0.5)'}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="section-tag" style={{display:'inline-flex'}}>
              <span style={{marginLeft:'0.25rem'}}>Access Protocols</span>
            </div>
            <h2 className="text-4xl md:text-5xl text-white mb-4">Built for <span style={{color:'var(--neon-cyan)'}} className="text-glow-cyan">Everyone</span></h2>
            <p className="text-lg" style={{color:'rgba(160,180,210,0.7)', fontFamily:'Rajdhani, sans-serif'}}>Three powerful dashboards, one seamless experience</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <GraduationCap className="h-10 w-10" />, title: 'Students', color: 'var(--neon-cyan)', desc: 'Browse internships, apply with one click, track your applications, and manage your career journey.', features: ['Smart Search', 'One-Click Apply', 'Application Tracking', 'Resume Upload'] },
              { icon: <Building2 className="h-10 w-10" />, title: 'Companies', color: 'var(--neon-purple)', desc: 'Post opportunities, review applications, manage candidates, and build your talent pipeline.', features: ['Easy Posting', 'Application Management', 'Candidate Review', 'Analytics'] },
              { icon: <Shield className="h-10 w-10" />, title: 'Admins', color: 'var(--neon-pink)', desc: 'Monitor platform activity, moderate content, generate reports, and ensure quality control.', features: ['System Overview', 'User Management', 'Reports', 'Moderation'] },
            ].map((u, i) => (
              <div key={i} className="retro-panel p-8 corner-br hover:border-cyan-500/40 transition-all duration-300 group"
                   style={{borderColor:`${u.color}25`}}>
                <div className="w-16 h-16 flex items-center justify-center mb-6 border"
                     style={{color: u.color, borderColor:`${u.color}40`, background:`${u.color}08`, boxShadow:`0 0 16px ${u.color}15`}}>
                  {u.icon}
                </div>
                <h3 className="text-2xl text-white mb-3" style={{fontFamily:'Orbitron, sans-serif', fontSize:'1rem'}}>{u.title}</h3>
                <p className="mb-5 text-sm leading-relaxed" style={{color:'rgba(160,180,210,0.6)', fontFamily:'Rajdhani, sans-serif'}}>{u.desc}</p>
                <ul className="space-y-2">
                  {u.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-3 text-sm" style={{fontFamily:'Rajdhani, sans-serif', color:'rgba(200,220,240,0.75)'}}>
                      <CheckCircle className="h-4 w-4 flex-shrink-0" style={{color: u.color}} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="retro-panel p-16">
            <div className="section-tag" style={{display:'inline-flex', marginBottom:'2rem'}}>
              <span style={{marginLeft:'0.25rem'}}>Initialize System</span>
            </div>
            <h2 className="text-4xl md:text-5xl text-white mb-8">Ready to Get <span style={{color:'var(--neon-cyan)'}} className="text-glow-cyan">Started?</span></h2>
            <Link to="/register" className="btn-retro-primary text-base">
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-10" style={{borderColor:'rgba(0,243,255,0.15)', background:'rgba(0,0,8,0.8)'}}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 border border-cyan-500 flex items-center justify-center" style={{background:'rgba(0,243,255,0.05)'}}>
              <Briefcase className="h-4 w-4 text-cyan-400" />
            </div>
            <span className="font-['Orbitron'] font-black tracking-widest text-white text-sm">IMS</span>
          </div>
          <p className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(100,120,140,0.7)', letterSpacing:'0.1em'}}>
            © 2025 IMS SYSTEMS. ALL RIGHTS RESERVED. // DESIGNED FOR THE FUTURE
          </p>
        </div>
      </footer>
    </div>
  );
}