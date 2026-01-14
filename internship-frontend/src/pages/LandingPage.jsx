import { Link } from 'react-router-dom';
import { Briefcase, Building2, GraduationCap, Shield, ArrowRight, CheckCircle, Users, TrendingUp } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className = "min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/*Navigateion*/}
            <nav className = "container mx-auto px-6 py-6">
                <div className = "flex items-center justify-between">
                    <div className = "flex items-center space-x-2">
                        <Briefcase className = "h-8 w-8 text-purple-400" />
                        <span className = "text-2xl font-bold text-white"> InternHub </span>
                    </div>
                    <div className = "flex items-center space-x-4">
                        <Link
                        to = "/login"
                        className = "px-6 py-2 text-white hover:text-purple-300 transition-colors">
                            Sign In
                        </Link>
                        <Link
                        to = "/register"
                        className = "px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all hover:scale-105">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className = "container mx-auto px-6 pt-20 pb-32">
                <div className = "max-w-4xl mx-auto text-center">
                    <h1 className = "text-6xl font-bold text-white mb-6 leading-tight">
                        Your Gateway to
                        <span className = "block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            Career Success
                        </span>
                    </h1>
                    <p className = "text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                        Connect Students with Top Companies. Manage Internships Effortlessly.
                        Build Your Future with our Internship platform.
                    </p>
                    <div className = "flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                        to = "/register?type=student"
                        className = "group px-8 py-4 bg-white text-purple-900 rounded-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105 flex items-center justify-center space-x-2">
                            <GraduationCap className = "h-5 w-5" />
                            <span> I am a Student </span>
                            <ArrowRight className = "h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link 
                        to = "/register?type=company"
                        className = "group px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all hover:scale-105 flex items-center justify-center space-x-2" >
                            <Building2 className = "h-5 w-5" />
                            <span> We are a Company </span>
                            <ArrowRight className = "h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className = "grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-4xl mx-auto">
                    <div className = "bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className = "text-4xl font-bold text-purple-400 mb-2"> 500+ </div>
                        <div className = "text-gray-300"> Active Internships </div>
                    </div>
                    <div className = "bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className = "text-4xl font-bold text-purple-400 mb-2">1,200+</div>
                        <div className = "text-gray-300"> Students Placed </div>
                    </div>
                    <div className = "bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className = "text-4xl font-bold text-purple-400 mb-2"> 200+ </div>
                        <div className = "text-gray-300"> Partner Companies </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className = "bg-white py-24">
                <div className = "container mx-auto px-6">
                    <h2 className = "text-4xl font-bold text-center text-gray-900 mb-16"> Why Choose InternHub? </h2>
                    <div className = "grid md:grid-cols-3 gap-12">
                        {/* For Students */}
                        <div className = "text-center">
                            <div className = "w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <GraduationCap className = "h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className = "text-2xl font-bold text-gray-900 mb-4"> For Students </h3>
                            <ul className = "space-y-3 text-gray-600">
                                <li className = "flex items-start">
                                    <CheckCircle className = "h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span> Browse through 100's of Internships</span>
                                </li>
                                <li className = "flex items-start">
                                    <CheckCircle className = "h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span> One-Click Applications with Resume tracking </span>
                                </li>
                                <li className = "flex items-start">
                                    <CheckCircle className = "h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span> Real-Time application status updates </span>
                                </li>
                            </ul>
                        </div>

                        {/* For Companies */}
                        <div className = "text-center">
                            <div className = "w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Building2 className = "h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className = "text-2xl font-bold text-gray-900 mb-4"> For Companies </h3>
                            <ul className = "space-y-3 text-gray-600">
                                <li className = "flex items-start">
                                    <CheckCircle className = "h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span> Post numerous Internship Opportunities </span>
                                </li>
                                <li className = "flex items-start">
                                    <CheckCircle className = "h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span> Access Qualified Student Talent </span>
                                </li>
                                <li className = "flex items-start">
                                    <CheckCircle className = "h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span> Streamlined Applicant Management </span>
                                </li>
                            </ul>
                        </div>

                        {/*Platform Features */}
                        <div className = "text-center">
                            <div className = "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Shield className = "h-8 w-8 text-green-600" />
                            </div>
                            <h3 className = "text-2xl font-bold text-gray-900 mb-4"> Secure & Reliable </h3>
                            <ul className = "space-y-3 text-gray-600">
                                <li className = "flex items-start">
                                    <CheckCircle className = "h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span> Enterprise-grade Security and Authentication </span>
                                </li>
                                <li className = "flex items-start">
                                    <CheckCircle className = "h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span> Data Privacy and POPIA compliance </span>
                                </li>
                                <li className = "flex items-start">
                                    <CheckCircle className = "h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span> 24/7 Platform Availability </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Secrion */}
            <div className = "bg-gradient-to-r from-purple-600 to-pink-600 py-20">
                <div className = "container mx-auto px-6 text-center">
                    <h2 className = "text-4xl font-bold text-white mb-6"> Ready to Start? </h2>
                    <p className = "text-xl text-purple-100 mb-8 max-w-2xl mx-auto"> Join Multiple others in their Journey </p>
                    <Link 
                    to = "/register" 
                    className = "inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105">
                        Create a Free Account NOW!
                        <ArrowRight className = "ml-2 h-5 w-5" />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className = "bg-slate-900 py-12">
                <div className = "container mx-auto px-6 text-center text-gray-400">
                    <p> &copy; InternHub. Built for South African Graduates. </p>
                </div>
            </footer>
        </div>
    );
}