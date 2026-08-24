import { useState, FormEvent, ChangeEvent, Suspense, lazy } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, Mail, Lock, Eye, EyeOff, ArrowLeft, Zap, GraduationCap, Building2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GlowInput from '../motion/GlowInput';
import SlidingTabs from '../motion/SlidingTabs';
import toast from 'react-hot-toast';

const AuthField = lazy(() => import('../webgl/AuthField'));

type UserType = 'student' | 'company' | 'admin';

interface FormData {
  email: string;
  password: string;
}

interface DemoCredentials {
  email: string;
  password: string;
}

interface DemoCredentialsMap {
  student: DemoCredentials;
  company: DemoCredentials;
  admin: DemoCredentials;
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const userType = (searchParams.get('type') || 'student') as UserType;
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login({ email: formData.email, password: formData.password }, userType);
      if (result.success) {
        toast.success('ACCESS GRANTED', {
          style: {
            background: '#080820',
            border: '1px solid rgba(0,243,255,0.4)',
            color: '#00f3ff',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.7rem',
            letterSpacing: '0.15em'
          }
        });
        if (userType === 'admin') navigate('/admin');
        else if (userType === 'company') navigate('/company');
        else navigate('/student');
      } else {
        toast.error(result.message || 'ACCESS DENIED', {
          style: {
            background: '#080820',
            border: '1px solid rgba(255,80,80,0.4)',
            color: '#ff6666',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.7rem',
            letterSpacing: '0.15em'
          }
        });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'ACCESS DENIED');
    } finally {
      setLoading(false);
    }
  };

  const useDemoCredentials = () => {
    const demo: DemoCredentialsMap = {
      student: { email: 'john.doe@student.com', password: 'Student123!' },
      company: { email: 'hr@techcorp.com', password: 'Company123!' },
      admin: { email: 'admin@internships.com', password: 'Admin123!' }
    };
    setFormData(demo[userType]);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative"
      style={{ background: '#050510' }}
    >
      <Suspense fallback={<div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,243,255,0.10), transparent 60%)' }} />}>
        <AuthField />
      </Suspense>
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-8 transition-colors"
          style={{
            color: 'rgba(0,243,255,0.5)',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.6rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="retro-panel" style={{ padding: '2.5rem' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 mx-auto mb-4 flex items-center justify-center border"
              style={{
                background: 'rgba(0,243,255,0.05)',
                borderColor: 'rgba(0,243,255,0.3)',
                boxShadow: '0 0 20px rgba(0,243,255,0.15)'
              }}
            >
              <Briefcase className="h-7 w-7 text-cyan-400" />
            </div>
            <h1
              className="text-2xl text-white mb-1"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '1rem',
                letterSpacing: '0.15em'
              }}
            >
              SYSTEM ACCESS
            </h1>
            <p
              className="font-['Share_Tech_Mono'] text-xs"
              style={{ color: 'rgba(0,243,255,0.5)', letterSpacing: '0.1em' }}
            >
              Enter credentials to initialize session
            </p>
          </div>

          {/* User Type Selector */}
          <SlidingTabs
            active={userType}
            options={[
              { value: 'student', label: 'Student', icon: <GraduationCap className="h-3.5 w-3.5" />, href: '/login?type=student' },
              { value: 'company', label: 'Company', icon: <Building2 className="h-3.5 w-3.5" />, href: '/login?type=company' },
              { value: 'admin', label: 'Admin', icon: <Shield className="h-3.5 w-3.5" />, href: '/login?type=admin' },
            ]}
          />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="retro-label">Email Address</label>
              <GlowInput
                icon={<Mail className="h-4 w-4" />}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="operator@system.net"
                required
              />
            </div>

            <div>
              <label className="retro-label">Password</label>
              <GlowInput
                icon={<Lock className="h-4 w-4" />}
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                required
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: 'rgba(0,243,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </div>

            <button
              type="button"
              onClick={useDemoCredentials}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs transition-colors"
              style={{
                color: 'rgba(0,243,255,0.5)',
                fontFamily: 'Orbitron, sans-serif',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Zap className="h-3.5 w-3.5" />
              Load Demo Credentials
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-retro-primary w-full justify-center text-base"
              style={{ clipPath: 'none', borderRadius: 0 }}
            >
              {loading ? (
                <>
                  <div
                    className="retro-spinner"
                    style={{ width: '18px', height: '18px', borderWidth: '2px' }}
                  />
                  Authenticating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Initialize Session
                </>
              )}
            </button>
          </form>

          <div
            className="mt-6 text-center font-['Share_Tech_Mono'] text-xs"
            style={{ color: 'rgba(120,140,160,0.6)', letterSpacing: '0.05em' }}
          >
            No account?{' '}
            <Link to={`/register?type=${userType}`} style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>
              Register now
            </Link>
          </div>
        </div>

        <p
          className="text-center mt-4 font-['Share_Tech_Mono'] text-xs"
          style={{ color: 'rgba(80,100,120,0.5)', letterSpacing: '0.1em' }}
        >
          PROTECTED BY ENTERPRISE-GRADE SECURITY
        </p>
      </div>
    </div>
  );
}