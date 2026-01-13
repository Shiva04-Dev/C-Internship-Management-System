import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    
    // Loading toast
    const loadingToast = toast.loading('Signing you in...');

    const result = await login(formData, userType);
    
    toast.dismiss(loadingToast);
    
    if (result.success) {
      toast.success(`Welcome back! Redirecting to your dashboard...`, {
        duration: 2000,
        icon: '🎉',
      });
      setTimeout(() => {
        navigate(`/${userType}`);
      }, 500);
    } else {
      toast.error(result.message || 'Login failed. Please check your credentials.', {
        duration: 4000,
      });
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const fillDemoCredentials = (type) => {
    const credentials = {
      student: { email: 'john.doe@student.com', password: 'Student123!' },
      company: { email: 'hr@techcorp.com', password: 'Company123!' },
      admin: { email: 'admin@internships.com', password: 'Admin123!' },
    };
    setFormData(credentials[type]);
    toast.success('Demo credentials filled!', { duration: 2000 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6 animate-fadeIn">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slideDown">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6 transform hover:scale-105 transition-transform">
            <Briefcase className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">InternHub</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to continue to your dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 animate-slideUp">
          {/* User Type Selector */}
          <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            {['student', 'company', 'admin'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setUserType(type);
                  setErrors({});
                }}
                className={`py-2 px-4 rounded-md font-medium transition-all transform ${
                  userType === type
                    ? 'bg-purple-600 text-white shadow-md scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:scale-102'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg transition-all focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center animate-shake">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg transition-all focus:ring-2 focus:ring-purple-600 focus:border-transparent pr-12 ${
                    errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center animate-shake">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-600 hover:text-purple-700 font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <p className="text-white font-medium mb-3 text-center">Quick Demo Access</p>
          <div className="space-y-2">
            {['student', 'company', 'admin'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setUserType(type);
                  fillDemoCredentials(type);
                }}
                className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-all transform hover:scale-105 backdrop-blur"
              >
                Try as {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-slideDown {
          animation: slideDown 0.6s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
          animation-fill-mode: both;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}