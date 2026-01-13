import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, AlertCircle, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const [searchParams] = useSearchParams();
    const initialType = searchParams.get('type') || 'student';

    const [userType, setUserType] = useState(initialType);
    const [formData, setFormData] = useState({
        //Student Fields
        firstName: '',
        lastName: '',
        emailAddress: '',
        password: '',
        phoneNumber: '',
        university: '',
        degree: '',
        //Company Fields
        companyName: '',
        email: '',
        website: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const data = userType === 'student'
        ? {
            firstName: formData.firstName,
            lastName: formData.lastName,
            emailAddress: formData.emailAddress,
            password: formData.password,
            phoneNumber: formData.phoneNumber,
            university: formData.university,
            degree: formData.degree,
        } 
        : {
            companyName: formData.companyName,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber,
            website: formData.website
        };

        const result = await register(data, userType);

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
                        <span> InternHub </span>
                    </Link>
                    <h1 className = "text-3xl font-bold text-white mb-2"> Create Account </h1>
                    <p className = "text-gray-400"> Join Many More Students and Companies </p>
                </div>

                <div className = "bg-white rounded-2xl shadow-xl p-8">
                    {/* User Type Selection */}
                    <div className = "grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
                        {['student', 'company'].map((type) => (
                            <button
                            key = {type}
                            onClick = {() => setUserType(type)}
                            className = {`py-2 px-4 rounded-md font-medium transition-all ${
                                userType === type
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}>
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
                        {userType === 'student' ? (
                            <>
                                <div className = "grid grid-cols-2 gap-4">
                                    <div>
                                        <label className = "block text-sm font-medium text-gray-700 mb-2"> First Name </label>
                                        <input 
                                        type = "text"
                                        required
                                        value = {formData.firstName}
                                        onChange = {(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className = "block text-sm font-medium text-gray-700 mb-2"> Last Name </label>
                                        <input 
                                        type = "text"
                                        required
                                        value = {formData.lastName}
                                        onChange = {(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className = "block text-sm font-medium text-gray-700 mb-2"> Email </label>
                                    <input
                                    type = "email"
                                    required
                                    value = {formData.emailAddress}
                                    onChange = {(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                                    className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className = "block text-sm font-medium text-gray-700 mb-2"> Password </label>
                                    <input
                                    type = "password"
                                    required
                                    minLength = {6}
                                    value = {formData.password}
                                    onChange = {(e) => setFormData({ ...formData, password: e.target.value })}
                                    className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className = "block text-sm font-medium text-gray-700 mb-2"> Phone Number </label>
                                    <input
                                    type = "tel"
                                    required
                                    value = {formData.phoneNumber}
                                    onChange = {(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className = "block text-sm font-medium text-gray-700 mb-2"> University </label>
                                    <input
                                    type = "text"
                                    required
                                    value = {formData.university}
                                    onChange = {(e) => setFormData({ ...formData, university: e.target.value })}
                                    className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className = "block text-sm font-medium text-gray-700 mb-2"> Degree </label>
                                    <input
                                    type = "text"
                                    required
                                    value = {formData.degree}
                                    onChange = {(e) => setFormData({ ...formData, degree: e.target.value })}
                                    className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className = "block text-sm font-medium text-gray-700 mb-2"> Company Name </label>
                                    <input
                                    type = "text"
                                    required
                                    value = {formData.companyName}
                                    onChange = {(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className = "block text-sm font-medium text-gray-700 mb-2"> Email </label>
                                    <input
                                    type = "email"
                                    required
                                    value = {formData.email}
                                    onChange = {(e) => setFormData({ ...formData, email: e.target.value })}
                                    className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className = "block text-sm font-medium text-gray-700 mb-2"> Password </label>
                                    <input
                                    type = "password"
                                    required
                                    minLength = {6}
                                    value = {formData.password}
                                    onChange = {(e) => setFormData({ ...formData, password: e.target.value })}
                                    className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className = "block text-sm font-medium text-gray-700 mb-2"> Phone Number </label>
                                    <input
                                    type = "tel"
                                    required
                                    value = {formData.phoneNumber}
                                    onChange = {(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className = "block text-sm font-medium text-gray-700 mb-2"> Website </label>
                                    <input
                                    type = "url"
                                    required
                                    value = {formData.website}
                                    onChange = {(e) => setFormData({ ...formData, website: e.target.value })}
                                    className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    placeholder = "https://example.com"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type = "submit"
                            disabled = { loading }
                            className = "w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                                {loading ? (
                                    <>
                                        <Loader2 className = "h-5 w-5 animate-spin" />
                                        <span> Creating Account... </span>
                                    </>
                                ) : (
                                    <span> Create Account </span>
                                )}
                            </button>
                    </form>

                    <div className = "mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link 
                        to = "/login"
                        className = "text-purple-600 hover:text-purple-700 font-medium">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}