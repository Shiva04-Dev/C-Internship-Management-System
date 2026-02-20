import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, Mail, Lock, User, Building2, GraduationCap, Eye, EyeOff, ArrowLeft, CheckCircle, XCircle, Phone, Globe, Zap } from 'lucide-react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'student';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', phoneNumber: '',
    companyName: '', website: '', university: '', degree: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const passwordStrength = () => {
    const p = formData.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[!@#$%^&*]/.test(p)) s++;
    return s;
  };

  const strengthInfo = () => {
    const s = passwordStrength();
    if (s === 0) return { text: 'Very Weak', color: '#ff4444' };
    if (s === 1) return { text: 'Weak', color: '#ff9d00' };
    if (s === 2) return { text: 'Fair', color: '#ffdd00' };
    if (s === 3) return { text: 'Good', color: '#00aaff' };
    return { text: 'Strong', color: '#00ff78' };
  };

  const requirements = [
    { met: formData.password.length >= 8, text: 'At least 8 characters' },
    { met: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password), text: 'Upper & lowercase letters' },
    { met: /\d/.test(formData.password), text: 'At least one number' },
    { met: /[!@#$%^&*]/.test(formData.password), text: 'Special character (!@#$%^&*)' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwordStrength() < 3) { toast.error('Password too weak'); return; }
    if (!formData.phoneNumber.trim()) { toast.error('Phone number is required'); return; }
    setLoading(true);
    try {
      const data = userType === 'student'
        ? { firstName: formData.firstName, lastName: formData.lastName, emailAddress: formData.email, password: formData.password, phoneNumber: formData.phoneNumber, university: formData.university, degree: formData.degree }
        : { companyName: formData.companyName, email: formData.email, password: formData.password, phoneNumber: formData.phoneNumber, website: formData.website || '' };
      if (userType === 'student') await authAPI.registerStudent(data);
      else await authAPI.registerCompany(data);
      toast.success('Account created successfully!');
      navigate(`/login?type=${userType}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { paddingLeft: '2.5rem' };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative" style={{background:'#050510'}}>
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0" style={{background:'radial-gradient(ellipse at 50% 50%, rgba(100,0,200,0.07) 0%, transparent 65%)'}} />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 transition-colors" style={{color:'rgba(0,243,255,0.5)', fontFamily:'Orbitron, sans-serif', fontSize:'0.6rem', letterSpacing:'0.15em', textTransform:'uppercase', textDecoration:'none'}}>
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="retro-panel" style={{padding:'2.5rem'}}>
          <div className="text-center mb-7">
            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center border" style={{background:'rgba(176,38,255,0.05)', borderColor:'rgba(176,38,255,0.3)', boxShadow:'0 0 20px rgba(176,38,255,0.12)'}}>
              <Briefcase className="h-7 w-7" style={{color:'var(--neon-purple)'}} />
            </div>
            <h1 className="text-2xl text-white mb-1" style={{fontFamily:'Orbitron, sans-serif', fontSize:'1rem', letterSpacing:'0.15em'}}>CREATE ACCOUNT</h1>
            <p className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(176,38,255,0.5)', letterSpacing:'0.1em'}}>Register new operator profile</p>
          </div>

          {/* Type selector */}
          <div className="flex gap-1 mb-7 p-1" style={{background:'rgba(0,0,20,0.6)', border:'1px solid rgba(0,243,255,0.15)'}}>
            {['student','company'].map(type => (
              <Link key={type} to={`/register?type=${type}`}
                style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', flex:1, textDecoration:'none', ...(userType===type ? {background:'linear-gradient(135deg, rgba(0,100,200,0.4), rgba(100,0,200,0.4))', border:'1px solid var(--neon-cyan)', color:'#fff', fontFamily:'Orbitron, sans-serif', fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', padding:'0.55rem', cursor:'pointer', boxShadow:'0 0 12px rgba(0,243,255,0.2)'} : {background:'transparent', border:'1px solid rgba(0,243,255,0.15)', color:'rgba(180,200,220,0.5)', fontFamily:'Orbitron, sans-serif', fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', padding:'0.55rem', cursor:'pointer'})}}>
                {type==='student' ? <GraduationCap className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
                {type.charAt(0).toUpperCase()+type.slice(1)}
              </Link>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {userType === 'student' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="retro-label">First Name *</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Shiva" required className="retro-input" />
                  </div>
                  <div>
                    <label className="retro-label">Last Name *</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Nagadan" required className="retro-input" />
                  </div>
                </div>
                <div>
                  <label className="retro-label">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:'rgba(0,243,255,0.4)'}} />
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+27-82-123-4567" required maxLength={15} className="retro-input" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="retro-label">University</label>
                  <input type="text" name="university" value={formData.university} onChange={handleChange} placeholder="Your University" className="retro-input" />
                </div>
                <div>
                  <label className="retro-label">Degree</label>
                  <input type="text" name="degree" value={formData.degree} onChange={handleChange} placeholder="Computer Science" className="retro-input" />
                </div>
              </>
            )}
            {userType === 'company' && (
              <>
                <div>
                  <label className="retro-label">Company Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:'rgba(0,243,255,0.4)'}} />
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Your Company" required className="retro-input" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="retro-label">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:'rgba(0,243,255,0.4)'}} />
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+27-11-123-4567" required maxLength={15} className="retro-input" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="retro-label">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:'rgba(0,243,255,0.4)'}} />
                    <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://yourcompany.com" className="retro-input" style={inputStyle} />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="retro-label">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:'rgba(0,243,255,0.4)'}} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required className="retro-input" style={inputStyle} />
              </div>
            </div>

            <div>
              <label className="retro-label">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:'rgba(0,243,255,0.4)'}} />
                <input type={showPassword?'text':'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Create a strong password" required className="retro-input" style={{paddingLeft:'2.5rem',paddingRight:'2.75rem'}} />
                <button type="button" onClick={()=>setShowPassword(!showPassword)} style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'rgba(0,243,255,0.4)',background:'none',border:'none',cursor:'pointer'}}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.08)'}}>
                      <div className="h-full transition-all duration-300 rounded-full" style={{width:`${passwordStrength()*25}%`, background:strengthInfo().color, boxShadow:`0 0 6px ${strengthInfo().color}`}} />
                    </div>
                    <span className="font-['Orbitron'] text-xs" style={{color:strengthInfo().color, letterSpacing:'0.05em'}}>{strengthInfo().text}</span>
                  </div>
                  <div className="space-y-1">
                    {requirements.map((r,i)=>(
                      <div key={i} className="flex items-center gap-2 text-xs" style={{fontFamily:'Share Tech Mono, monospace',color:r.met?'#00cc66':'rgba(120,140,160,0.5)'}}>
                        {r.met ? <CheckCircle className="h-3 w-3 flex-shrink-0" style={{color:'#00cc66'}} /> : <XCircle className="h-3 w-3 flex-shrink-0" style={{color:'rgba(120,140,160,0.4)'}} />}
                        {r.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="retro-label">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:'rgba(0,243,255,0.4)'}} />
                <input type={showConfirmPassword?'text':'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required className="retro-input" style={{paddingLeft:'2.5rem',paddingRight:'2.75rem'}} />
                <button type="button" onClick={()=>setShowConfirmPassword(!showConfirmPassword)} style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'rgba(0,243,255,0.4)',background:'none',border:'none',cursor:'pointer'}}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="flex items-center gap-2 mt-2 text-xs" style={{fontFamily:'Share Tech Mono, monospace'}}>
                  {formData.password===formData.confirmPassword ? <><CheckCircle className="h-3 w-3" style={{color:'#00cc66'}} /><span style={{color:'#00cc66'}}>Passwords match</span></> : <><XCircle className="h-3 w-3" style={{color:'#ff6666'}} /><span style={{color:'#ff6666'}}>Passwords don't match</span></>}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-retro-primary w-full justify-center" style={{clipPath:'none',borderRadius:0,marginTop:'0.5rem',opacity:loading?0.6:1}}>
              {loading ? <><div className="retro-spinner" style={{width:'16px',height:'16px',borderWidth:'2px'}} />Creating account...</> : <><Zap className="h-4 w-4" />Create Account</>}
            </button>
          </form>

          <div className="mt-5 text-center font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(120,140,160,0.6)', letterSpacing:'0.05em'}}>
            Already have an account?{' '}
            <Link to={`/login?type=${userType}`} style={{color:'var(--neon-cyan)', textDecoration:'none'}}>Sign in</Link>
          </div>
        </div>

        <p className="text-center mt-4 font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(80,100,120,0.4)', letterSpacing:'0.08em'}}>
          By registering, you agree to our{' '}
          <a href="#" style={{color:'rgba(0,243,255,0.5)', textDecoration:'none'}}>Terms</a>
          {' '}and{' '}
          <a href="#" style={{color:'rgba(0,243,255,0.5)', textDecoration:'none'}}>Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}