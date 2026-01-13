import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { internshipAPI, applicationAPI } from '../services/api';
import { 
  ArrowLeft, MapPin, Calendar, Briefcase, Building2, 
  CheckCircle, Loader2, ExternalLink 
} from 'lucide-react';

export default function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setError('Failed to load internship details');
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

  const handleApply = async () => {
    setApplying(true);
    setError('');
    setSuccess('');

    try {
      await applicationAPI.submit({
        internshipID: parseInt(id),
        resume: 'resume.pdf', // In a real app, this would be uploaded
      });
      setSuccess('Application submitted successfully!');
      setApplied(true);
      setTimeout(() => {
        navigate('/student');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Internship not found</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/student')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{success}</p>
              <p className="text-xs text-green-600 mt-1">Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Internship Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
              <h2 className="text-xl font-bold text-gray-900 mb-3">About this Internship</h2>
              <p className="text-gray-700 leading-relaxed">{internship.description}</p>
            </div>

            {/* Requirements */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Requirements</h2>
              <p className="text-gray-700 leading-relaxed">{internship.requirements}</p>
            </div>

            {/* Duration */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Duration</h2>
              <div className="flex items-center space-x-6 text-gray-700">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Start Date</p>
                  <p className="font-medium">{new Date(internship.startDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">End Date</p>
                  <p className="font-medium">{new Date(internship.endDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About the Company</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Company Name</span>
                  <span className="font-medium text-gray-900">{internship.company.companyName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-900">{internship.company.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium text-gray-900">{internship.company.phoneNumber}</span>
                </div>
                {internship.company.website && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Website</span>
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
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Ready to Apply?</h3>
                <p className="text-sm text-gray-600">
                  {applied 
                    ? "You've already applied to this internship" 
                    : "Submit your application and take the next step in your career"
                  }
                </p>
              </div>
              <button
                onClick={handleApply}
                disabled={applying || applied}
                className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                  applied
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 shadow-lg'
                }`}
              >
                {applying ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : applied ? (
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
    </div>
  );
}