import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [userType, setUserType] = useState('student');
    const [formData, setFormData] = useState({email: '', password: '' });
    const [error, setError] = useState('');
    const [loading,setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(formData, userType);

        if (result.success) {
            navigate(`/${userType}`);
        } else {
            setError(result.message)
        }

        setLoading(false);
    };

    return (
        <div className = "min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
            <div className = "w-full max-w-md">
                <div className = "text-center mb-8">
                    <Link
                    to = "/"
                    className = "inline-flex items-center space-x-2 mb-6">
                        <Briefcase className = "h-8 w-8 text-purple-400" />
                        <span className = "text-2xl font-bold text-white"> InternHub </span>
                    </Link>
                    <h1 className = "text-3xl font-bold text-white mb-2"> Welcome Back </h1>
                    <p className = "text-gray-400"> Sign in to continue to your dashboard</p>
                </div>

                <div className = "bg-white rounded-2xl shadow-xl p-8">
                    {/* User Type Selector */}
                    <div className = "grid grid-cols-3 gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
                        {['student', 'company', 'admin'].map((type) => (
                            <button
                            key = {type}
                            onClick = {() => setUserType(type)}
                            className = {`py-2 px-4 rounded-md font-medium transition-all
                                ${userType === type
                                ? 'bg-purple-600 text-white shadow-md' 
                                : 'text-gray-600 hover:text-gray-900'
                            }`} >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className = "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                            <AlertCircle className = "h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className = "text-sm text-red-600"> {error} </p>
                        </div>
                    )}

                    <form onSubmit = {handleSubmit} className = "space-y-4">
                        <div>
                            <label className = "block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                            type = "email"
                            required
                            value = {formData.email}
                            onChange = {(e) => setFormData({ ...formData, email: e.target.value})}
                            className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            placeholder = "name@email.com"
                            />
                        </div>

                        <div>
                            <label className = "block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                            type = "password"
                            required
                            value = {formData.password}
                            onChange = {(e) => setFormData({ ...formData, password: e.target.value})}
                            className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            placeholder = "*******"
                            />
                        </div>

                        <button 
                        type = "submit"
                        disabled = {loading}
                        className = "w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                            { loading ? (
                                <>
                                <Loader2 className = "h-5 w-5 animate-spin" />
                                <span> Signing In... </span>
                                </>
                            ) : (
                                <span> Sign In </span>
                            )}
                        </button>
                    </form>

                    <div className = "mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link 
                        to = "/register"
                        className = "text-purple-600 hover:text-purple-700 font-medium">
                            Sign Up
                        </Link>
                    </div>
                </div>

                {/* Demo Creds */}
                <div className = "mt-6 bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                        <p className = "text-white font-medium mb-2">Demo Creds: </p>
                        <div className = "space-y-1 text-sm text-gray-300">
                            <p>Student: john.doe@student.com / Student123!</p>
                            <p>Company: hr@techcorp.com / Company123!</p>
                            <p>Admin: admin@internships.com / Admin123! </p>
                        </div>
                </div>
            </div>
        </div>
    );
}