import { Link } from 'react-router-dom';
import { Briefcase, Building2, GraduationCap, Shield, ArrowRight, CheckCircle, Users, TrendingUp, Sparkles, Zap, Target } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Navigation */}
                <nav className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <Briefcase className="h-10 w-10 text-blue-400" />
                                <div className="absolute inset-0 bg-blue-400 blur-xl opacity-50"></div>
                            </div>
                            <span className="text-3xl font-bold text-white tracking-tight">IMS</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105 font-medium">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="container mx-auto px-6 pt-20 pb-32">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8">
                            <Sparkles className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-gray-300">Welcome to the future of internships</span>
                        </div>
                        
                        <h1 className="text-7xl md:text-8xl font-bold text-white mb-8 leading-tight">
                            Helping You.
                        </h1>
                        
                        <p className="text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                            The modern platform connecting ambitious students with innovative companies. 
                            Streamline your internship journey.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Link
                                to="/register?type=student"
                                className="group px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-xl hover:shadow-blue-500/50 transition-all hover:scale-105 flex items-center justify-center space-x-3">
                                <GraduationCap className="h-6 w-6" />
                                <span>I'm a Student</span>
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/register?type=company"
                                className="group px-10 py-5 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-full font-semibold hover:bg-white/10 transition-all hover:scale-105 flex items-center justify-center space-x-3">
                                <Building2 className="h-6 w-6" />
                                <span>We are a Company</span>
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div id="features" className="container mx-auto px-6 py-20">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-bold text-white mb-4">Powerful Features</h2>
                            <p className="text-xl text-gray-400">Everything you need in one platform</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <Zap className="h-8 w-8" />,
                                    title: 'Lightning Fast',
                                    description: 'Search and apply to internships in seconds with our intuitive interface.',
                                    gradient: 'from-blue-500 to-cyan-500'
                                },
                                {
                                    icon: <Shield className="h-8 w-8" />,
                                    title: 'Secure & Private',
                                    description: 'Your data is protected with enterprise-grade security measures.',
                                    gradient: 'from-purple-500 to-pink-500'
                                },
                                {
                                    icon: <Target className="h-8 w-8" />,
                                    title: 'Smart Matching',
                                    description: 'AI-powered recommendations connect you with perfect opportunities.',
                                    gradient: 'from-orange-500 to-red-500'
                                }
                            ].map((feature, index) => (
                                <div key={index} className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl -z-10" 
                                         style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}></div>
                                    <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all hover:scale-105">
                                        <div className={`inline-flex p-3 bg-gradient-to-r ${feature.gradient} rounded-xl mb-4`}>
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                                        <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* User Types Section */}
                <div className="container mx-auto px-6 py-20">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-bold text-white mb-4">Built for Everyone</h2>
                            <p className="text-xl text-gray-400">Three powerful dashboards, one seamless experience</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <GraduationCap className="h-12 w-12" />,
                                    title: 'Students',
                                    description: 'Browse internships, apply with one click, track your applications, and manage your career journey.',
                                    features: ['Smart Search', 'One-Click Apply', 'Application Tracking', 'Resume Builder'],
                                    gradient: 'from-blue-500 to-cyan-500'
                                },
                                {
                                    icon: <Building2 className="h-12 w-12" />,
                                    title: 'Companies',
                                    description: 'Post opportunities, review applications, manage candidates, and build your talent pipeline.',
                                    features: ['Easy Posting', 'Application Management', 'Candidate Review', 'Analytics'],
                                    gradient: 'from-purple-500 to-pink-500'
                                },
                                {
                                    icon: <Shield className="h-12 w-12" />,
                                    title: 'Admins',
                                    description: 'Monitor platform activity, moderate content, generate reports, and ensure quality.',
                                    features: ['System Overview', 'User Management', 'Reports', 'Moderation'],
                                    gradient: 'from-orange-500 to-red-500'
                                }
                            ].map((type, index) => (
                                <div key={index} className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                                    <div className={`inline-flex p-4 bg-gradient-to-r ${type.gradient} rounded-2xl mb-6`}>
                                        {type.icon}
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-4">{type.title}</h3>
                                    <p className="text-gray-400 mb-6 leading-relaxed">{type.description}</p>
                                    <ul className="space-y-3">
                                        {type.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center space-x-3 text-gray-300">
                                                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="container mx-auto px-6 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="p-12 bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-sm border border-white/10 rounded-3xl">
                            <h2 className="text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
                            <p className="text-xl text-gray-400 mb-8">Join thousands of students and companies already using InternHub</p>
                            <Link
                                to="/register"
                                className="inline-flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-xl hover:shadow-blue-500/50 transition-all hover:scale-105">
                                <span>Create Free Account</span>
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}