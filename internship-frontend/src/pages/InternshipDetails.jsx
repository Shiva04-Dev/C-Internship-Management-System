import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { internshipAPI, applicationAPI } from '../services/api';
import { useDarkMode } from '../context/DarkmodeContext';
import { 
  ArrowLeft, MapPin, Calendar, Briefcase, Building2, 
  CheckCircle, Loader2, ExternalLink, Upload, FileText, X
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
      const hasApplied = response.data.some(app => app.internship.internshipID === parseInt(id));
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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading internship details...</p>
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Internship not found</p>
          <button
            onClick={() => navigate('/student')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b transition-colors duration-300`}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/student')}
            className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mb-6 transform hover:scale-105 transition-all`}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Internship Card */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-lg overflow-hidden border transition-all duration-300 animate-slideUp`}>
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3">{internship.title}</h1>
                <div className="flex items-center space-x-2 text-purple-100 mb-4">
                  <Building2 className="h-5 w-5" />
                  <span className="text-lg font-medium">{internship.company.companyName}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {internship.location}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(internship.startDate).toLocaleDateString()} - {new Date(internship.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Briefcase className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Description */}
            <div className="mb-8">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>About this Internship</h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>{internship.description}</p>
            </div>

            {/* Requirements */}
            <div className="mb-8">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Requirements</h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>{internship.requirements}</p>
            </div>

            {/* Duration */}
            <div className="mb-8">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Duration</h2>
              <div className={`flex items-center space-x-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Start Date</p>
                  <p className="font-medium">{new Date(internship.startDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
                <div className={`h-8 w-px ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>End Date</p>
                  <p className="font-medium">{new Date(internship.endDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className={`mb-8 p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl transition-colors duration-300`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>About the Company</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Company Name</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{internship.company.companyName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Email</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{internship.company.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Phone</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{internship.company.phoneNumber}</span>
                </div>
                {internship.company.website && (
                  <div className="flex items-center justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Website</span>
                    <a 
                      href={internship.company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Apply Button */}
            <div className={`flex items-center justify-between p-6 bg-gradient-to-r ${isDarkMode ? 'from-purple-900/50 to-pink-900/50' : 'from-purple-50 to-pink-50'} rounded-xl border ${isDarkMode ? 'border-purple-800' : 'border-purple-100'} transition-colors duration-300`}>
              <div>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Ready to Apply?</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {applied 
                    ? "You've already applied to this internship" 
                    : "Upload your resume and submit your application"
                  }
                </p>
              </div>
              <button
                onClick={() => applied ? null : setShowApplyModal(true)}
                disabled={applied}
                className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 transform ${
                  applied
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                    : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 shadow-lg active:scale-95'
                }`}
              >
                {applied ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Applied</span>
                  </>
                ) : (
                  <>
                    <span>Apply Now</span>
                    <ArrowLeft className="h-5 w-5 rotate-180" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50 animate-fadeIn">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl max-w-md w-full border shadow-2xl animate-slideUp`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Apply for Internship</h2>
              <button onClick={() => setShowApplyModal(false)} className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Please upload your resume (PDF format, max 5MB) to complete your application.
              </p>
              
              <div className={`border-2 border-dashed ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'} rounded-lg p-8 text-center mb-6 transition-all hover:border-purple-500`}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  {resumeFile ? (
                    <div className="animate-fadeIn">
                      <FileText className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{resumeFile.name}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{(resumeFile.size / 1024).toFixed(2)} KB</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setResumeFile(null);
                        }}
                        className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className={`h-12 w-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} mx-auto mb-3`} />
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Click to upload resume</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>PDF only, max 5MB</p>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className={`flex-1 px-6 py-3 border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg font-semibold transition-all`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={!resumeFile || applying}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95"
                >
                  {applying ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
      `}</style>
    </div>
  );
}