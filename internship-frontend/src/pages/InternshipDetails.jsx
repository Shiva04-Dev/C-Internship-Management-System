import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { internshipAPI, applicationAPI } from '../services/api';
import { useDarkMode } from '../context/DarkmodeContext';
import { 
  ArrowLeft, MapPin, Calendar, Briefcase, Building2, 
  CheckCircle, Loader2, ExternalLink, Upload, FileText, X,
  Clock, DollarSign, Users, Award
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    loadInternship();
    checkIfApplied();
  }, [id]);

  const loadInternship = async () => {
    setLoading(true);
    try {
      const response = await internshipAPI.getById(id);
      setInternship(response.data);
    } catch (error) {
      console.error('Error loading internship:', error);
      toast.error('Failed to load internship details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const response = await applicationAPI.getMine();
      const hasApplied = response.data.some(app => app.internshipID === parseInt(id));
      setApplied(hasApplied);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
      toast.success('Resume selected!');
    }
  };

  const handleApply = async () => {
    if (!resumeFile) {
      toast.error('Please upload your resume first');
      return;
    }

    setApplying(true);
    const loadingToast = toast.loading('Submitting your application...');

    try {
      const formData = new FormData();
      formData.append('internshipID', parseInt(id));
      formData.append('resume', resumeFile);

      await applicationAPI.submitWithResume(formData);
      
      toast.dismiss(loadingToast);
      toast.success('🎉 Application submitted successfully!', { duration: 3000 });
      
      setApplied(true);
      setShowApplyModal(false);
      
      setTimeout(() => {
        navigate('/student');
      }, 2000);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className={isDarkMode ? 'min-h-screen bg-black' : 'min-h-screen bg-gray-50'}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto mb-4" />
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20"></div>
            </div>
            <p className={isDarkMode ? 'text-gray-400 text-lg' : 'text-gray-600 text-lg'}>
              Loading internship details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className={isDarkMode ? 'min-h-screen bg-black' : 'min-h-screen bg-gray-50'}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Briefcase className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
            <p className={isDarkMode ? 'text-gray-400 text-lg mb-4' : 'text-gray-600 text-lg mb-4'}>
              Internship not found
            </p>
            <button
              onClick={() => navigate('/student')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'min-h-screen bg-black' : 'min-h-screen bg-gray-50'}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className={isDarkMode 
        ? 'bg-black/50 backdrop-blur-xl border-b border-white/10' 
        : 'bg-white/50 backdrop-blur-xl border-b border-gray-200'
      }>
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/student')}
            className={`flex items-center space-x-2 ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors`}>
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Main Card */}
        <div className={isDarkMode
          ? 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden'
          : 'bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl'
        }>
          {/* Hero Section with Gradient */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 md:p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">{internship.title}</h1>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-white/20 backdrop-blur rounded-lg">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-medium">{internship.companyName}</span>
                  </div>
                </div>
                <div className="hidden md:block p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Briefcase className="h-12 w-12" />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 text-white/90">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>{internship.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {new Date(internship.startDate).toLocaleDateString()} - {new Date(internship.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>{internship.duration || 'Full-time'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-12 space-y-8">
            {/* About Section */}
            <div>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                About this Internship
              </h2>
              <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {internship.description}
              </p>
            </div>

            {/* Divider */}
            <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

            {/* Requirements Section */}
            <div>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Requirements
              </h2>
              <div className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {internship.requirements}
              </div>
            </div>

            {/* Divider */}
            <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>

            {/* Duration Details */}
            <div>
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Duration & Timeline
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className={isDarkMode
                  ? 'p-6 bg-white/5 border border-white/10 rounded-2xl'
                  : 'p-6 bg-gray-50 border border-gray-200 rounded-2xl'
                }>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Start Date
                  </p>
                  <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(internship.startDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                <div className={isDarkMode
                  ? 'p-6 bg-white/5 border border-white/10 rounded-2xl'
                  : 'p-6 bg-gray-50 border border-gray-200 rounded-2xl'
                }>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    End Date
                  </p>
                  <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(internship.endDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Apply Button Section */}
            <div className={isDarkMode
              ? 'p-8 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-white/10 rounded-2xl'
              : 'p-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-2xl'
            }>
              {applied ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Application Submitted!
                  </h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    You've already applied to this internship. Check your dashboard for updates.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Ready to Apply?
                  </h3>
                  <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Submit your application with your resume to get started
                  </p>
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all hover:scale-105 inline-flex items-center space-x-3">
                    <Upload className="h-5 w-5" />
                    <span>Apply Now</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={isDarkMode
            ? 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full'
            : 'bg-white border border-gray-200 rounded-3xl p-8 max-w-md w-full'
          }>
            <div className="flex items-center justify-between mb-6">
              <h2 className={isDarkMode ? 'text-2xl font-bold text-white' : 'text-2xl font-bold text-gray-900'}>
                Apply to Internship
              </h2>
              <button
                onClick={() => {
                  setShowApplyModal(false);
                  setResumeFile(null);
                }}
                className={isDarkMode ? 'p-2 hover:bg-white/10 rounded-lg transition-colors' : 'p-2 hover:bg-gray-100 rounded-lg transition-colors'}>
                <X className={isDarkMode ? 'h-5 w-5 text-gray-400' : 'h-5 w-5 text-gray-600'} />
              </button>
            </div>

            <div className="mb-6">
              <p className={isDarkMode ? 'text-gray-300 mb-4' : 'text-gray-700 mb-4'}>
                Upload your resume to complete your application for:
              </p>
              <div className={isDarkMode
                ? 'p-4 bg-white/5 border border-white/10 rounded-xl'
                : 'p-4 bg-gray-50 border border-gray-200 rounded-xl'
              }>
                <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {internship.title}
                </h3>
                <p className={isDarkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>
                  {internship.companyName}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className={isDarkMode ? 'block text-sm font-medium text-gray-300 mb-3' : 'block text-sm font-medium text-gray-700 mb-3'}>
                Upload Resume (PDF, max 5MB)
              </label>
              
              <div className={`relative ${isDarkMode
                ? 'border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-white/40'
                : 'border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-gray-400'
              } transition-colors cursor-pointer`}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  {resumeFile ? (
                    <>
                      <FileText className={`h-12 w-12 mx-auto mb-3 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                      <p className={isDarkMode ? 'text-green-400 font-medium' : 'text-green-600 font-medium'}>
                        {resumeFile.name}
                      </p>
                      <p className={isDarkMode ? 'text-xs text-gray-500 mt-1' : 'text-xs text-gray-600 mt-1'}>
                        Click to change file
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className={`h-12 w-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Click to upload or drag and drop
                      </p>
                      <p className={isDarkMode ? 'text-xs text-gray-500 mt-1' : 'text-xs text-gray-600 mt-1'}>
                        PDF only, up to 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowApplyModal(false);
                  setResumeFile(null);
                }}
                className={isDarkMode
                  ? 'flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all'
                  : 'flex-1 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-xl hover:bg-gray-200 transition-all'
                }>
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!resumeFile || applying}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                {applying ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}