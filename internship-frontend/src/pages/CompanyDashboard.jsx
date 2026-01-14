import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useNavigate } from 'react-router-dom';
import { internshipAPI, applicationAPI, companyAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Briefcase, LogOut, Plus, Users, FileText, Eye, X, 
  Loader2, Calendar, MapPin, CheckCircle, Clock, XCircle, 
  Edit2, Trash2, Moon, Sun, RefreshCw, Download, Ban, ShieldAlert
} from 'lucide-react';

export default function CompanyDashboard() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applications, setApplications] = useState([]);
  const [bannedStudents, setBannedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [showBannedStudentsModal, setShowBannedStudentsModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (showToast = false) => {
    setLoading(true);
    try {
      const [internshipsRes, bannedRes] = await Promise.all([
        internshipAPI.getMine(),
        companyAPI.getBannedStudents(),
      ]);
      setInternships(internshipsRes.data);
      setBannedStudents(bannedRes.data);
      if (showToast) {
        toast.success('Dashboard refreshed!', { duration: 2000 });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const loadApplications = async (internship) => {
    const loadingToast = toast.loading('Loading applications...');
    try {
      const response = await applicationAPI.getForInternship(internship.internshipID);
      setApplications(response.data);
      setSelectedInternship(internship);
      setShowApplicationsModal(true);
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to load applications');
      console.error('Error loading applications:', error);
    }
  };

  const handleStatusUpdate = async (applicationId, status) => {
    const loadingToast = toast.loading(`${status === 'Accepted' ? 'Accepting' : 'Rejecting'} application...`);
    try {
      await applicationAPI.updateStatus(applicationId, status);
      toast.dismiss(loadingToast);
      toast.success(`Application ${status.toLowerCase()} successfully!`, { icon: status === 'Accepted' ? '✅' : '❌' });
      // Reload applications
      if (selectedInternship) {
        const response = await applicationAPI.getForInternship(selectedInternship.internshipID);
        setApplications(response.data);
      }
      loadData(); // Refresh stats
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(`Failed to update application status`);
      console.error('Error updating status:', error);
    }
  };

  const handleBanStudent = async (studentId, studentName) => {
    const reason = prompt(`Why are you banning ${studentName}? (This will prevent them from applying to your internships)`);
    if (!reason) return;

    const loadingToast = toast.loading('Banning student...');
    try {
      await companyAPI.banStudent(studentId);
      toast.dismiss(loadingToast);
      toast.success(`${studentName} has been banned from your internships`);
      loadData(); // Refresh banned list
      // Reload applications if modal is open
      if (selectedInternship) {
        const response = await applicationAPI.getForInternship(selectedInternship.internshipID);
        setApplications(response.data);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to ban student');
    }
  };

  const handleUnbanStudent = async (studentId, studentName) => {
    if (!confirm(`Are you sure you want to unban ${studentName}?`)) return;

    const loadingToast = toast.loading('Unbanning student...');
    try {
      await companyAPI.unbanStudent(studentId);
      toast.dismiss(loadingToast);
      toast.success(`${studentName} has been unbanned`);
      loadData(); // Refresh banned list
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to unban student');
    }
  };

  const handleDownloadResume = async (applicationId, studentName) => {
    const loadingToast = toast.loading('Downloading resume...');
    try {
      const response = await applicationAPI.downloadResume(applicationId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${studentName.replace(' ', '_')}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.dismiss(loadingToast);
      toast.success('Resume downloaded!');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to download resume');
    }
  };

  const handleCloseInternship = async (id, title) => {
    if (!confirm(`Are you sure you want to close "${title}"?`)) return;

    const loadingToast = toast.loading('Closing internship...');
    try {
      await internshipAPI.delete(id);
      toast.dismiss(loadingToast);
      toast.success('Internship closed successfully');
      await loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to close internship');
      console.error('Error closing internship:', error);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) return;
    toast.loading('Signing out...', { duration: 1000 });
    await logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: isDarkMode ? 'bg-yellow-900 text-yellow-200 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Accepted: isDarkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-100 text-green-800 border-green-200',
      Rejected: isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-100 text-red-800 border-red-200',
    };
    const icons = { Pending: Clock, Accepted: CheckCircle, Rejected: XCircle };
    const Icon = icons[status];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
        <Icon className="h-4 w-4 mr-1" />
        {status}
      </span>
    );
  };

  const stats = {
    total: internships.length,
    active: internships.filter(i => i.status === 'Active').length,
    totalApplications: internships.reduce((sum, i) => sum + (i.applicationCount || 0), 0),
    pendingApplications: internships.reduce((sum, i) => sum + (i.pendingApplications || 0), 0),
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b sticky top-0 z-10 transition-colors duration-300 animate-slideDown`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Briefcase className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>InternHub</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Company Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
                  isDarkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
                  isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
                title="Refresh dashboard"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowBannedStudentsModal(true)}
                className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
                  isDarkMode ? 'text-gray-300 hover:text-red-400 hover:bg-gray-700' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
                title="View banned students"
              >
                <ShieldAlert className="h-5 w-5" />
                {bannedStudents.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {bannedStudents.length}
                  </span>
                )}
              </button>
              <div className="text-right">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${
                  isDarkMode ? 'text-gray-300 hover:text-red-400 hover:bg-gray-700' : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all animate-slideUp">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Total Internships</p>
                <p className="text-4xl font-bold">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Active</p>
                <p className="text-4xl font-bold">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Applications</p>
                <p className="text-4xl font-bold">{stats.totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all animate-slideUp" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm mb-1">Pending Review</p>
                <p className="text-4xl font-bold">{stats.pendingApplications}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="mb-6 animate-fadeIn">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 active:scale-95 shadow-md"
          >
            <Plus className="h-5 w-5" />
            <span className="font-semibold">Post New Internship</span>
          </button>
        </div>

        {/* Internships List */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border transition-colors duration-300 animate-fadeIn`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Internships</h2>
          </div>
          <div className="p-6">
            {internships.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className={`h-12 w-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-3`} />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No internships posted yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium hover:underline"
                >
                  Post your first internship
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {internships.map((internship, index) => (
                  <div
                    key={internship.internshipID}
                    className={`border rounded-lg p-6 transition-all transform hover:scale-102 animate-slideUp ${
                      isDarkMode 
                        ? 'border-gray-700 bg-gray-700/50 hover:border-purple-600' 
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {internship.title}
                          </h3>
                          {internship.pendingApplications > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                              {internship.pendingApplications} pending
                            </span>
                          )}
                        </div>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-3 line-clamp-2`}>
                          {internship.description}
                        </p>
                        <div className={`flex flex-wrap gap-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {internship.location}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(internship.startDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {internship.applicationCount || 0} applications
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => loadApplications(internship)}
                          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 active:scale-95 shadow-sm"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Applications</span>
                        </button>
                        <button
                          onClick={() => handleCloseInternship(internship.internshipID, internship.title)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${
                            isDarkMode 
                              ? 'bg-red-900/50 text-red-300 hover:bg-red-900' 
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Close</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateInternshipModal
          isDarkMode={isDarkMode}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}

      {showApplicationsModal && selectedInternship && (
        <ApplicationsModal
          isDarkMode={isDarkMode}
          internship={selectedInternship}
          applications={applications}
          onClose={() => setShowApplicationsModal(false)}
          onStatusUpdate={handleStatusUpdate}
          onBanStudent={handleBanStudent}
          onDownloadResume={handleDownloadResume}
        />
      )}

      {showBannedStudentsModal && (
        <BannedStudentsModal
          isDarkMode={isDarkMode}
          bannedStudents={bannedStudents}
          onClose={() => setShowBannedStudentsModal(false)}
          onUnban={handleUnbanStudent}
        />
      )}

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; animation-fill-mode: both; }
      `}</style>
    </div>
  );
}

// Create Internship Modal
function CreateInternshipModal({ isDarkMode, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    requirements: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.requirements.trim()) newErrors.requirements = 'Requirements are required';
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Creating internship...');

    try {
      await internshipAPI.create(formData);
      toast.dismiss(loadingToast);
      toast.success('🎉 Internship posted successfully!');
      onSuccess();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || 'Failed to create internship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50 animate-fadeIn">
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border shadow-2xl animate-slideUp`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between sticky top-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Post New Internship</h2>
          <button onClick={onClose} className={isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg transition-all focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                errors.title 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300'
              }`}
              placeholder="e.g., Software Development Intern"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description *</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg transition-all focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                errors.description 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300'
              }`}
              placeholder="Describe the internship role and responsibilities..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg transition-all focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                errors.location 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300'
              }`}
              placeholder="e.g., Johannesburg, Gauteng"
            />
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg transition-all focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                  errors.startDate 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300'
                }`}
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg transition-all focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                  errors.endDate 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300'
                }`}
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Requirements *</label>
            <textarea
              rows={3}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg transition-all focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                errors.requirements 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300'
              }`}
              placeholder="List required skills and qualifications..."
            />
            {errors.requirements && <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-3 border rounded-lg font-semibold transition-all ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Post Internship</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Applications Modal
function ApplicationsModal({ isDarkMode, internship, applications, onClose, onStatusUpdate, onBanStudent, onDownloadResume }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50 animate-fadeIn">
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border shadow-2xl animate-slideUp`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex items-center justify-between sticky top-0`}>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{internship.title}</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{applications.length} Applications</p>
          </div>
          <button onClick={onClose} className={isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Users className={`h-12 w-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-3`} />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No applications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app, index) => (
                <div 
                  key={app.applicationID} 
                  className={`border rounded-lg p-6 transition-all animate-slideUp ${
                    isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {app.student.firstName} {app.student.lastName}
                        </h3>
                        {app.status === 'Pending' && app.status}
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{app.student.email}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        {app.student.university} - {app.student.degree}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                        Applied: {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4">
                      {app.status === 'Pending' ? (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          isDarkMode ? 'bg-yellow-900 text-yellow-200 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                          <Clock className="h-4 w-4 inline mr-1" />
                          Pending
                        </span>
                      ) : app.status === 'Accepted' ? (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          isDarkMode ? 'bg-green-900 text-green-200 border-green-700' : 'bg-green-100 text-green-800 border-green-200'
                        }`}>
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Accepted
                        </span>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          isDarkMode ? 'bg-red-900 text-red-200 border-red-700' : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          <XCircle className="h-4 w-4 inline mr-1" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {app.resume && (
                      <button
                        onClick={() => onDownloadResume(app.applicationID, `${app.student.firstName}_${app.student.lastName}`)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center space-x-2 ${
                          isDarkMode 
                            ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-900' 
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Resume</span>
                      </button>
                    )}
                    {app.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => onStatusUpdate(app.applicationID, 'Accepted')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => onStatusUpdate(app.applicationID, 'Rejected')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 flex items-center space-x-2"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => onBanStudent(app.student.studentID, `${app.student.firstName} ${app.student.lastName}`)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center space-x-2 ${
                            isDarkMode 
                              ? 'bg-red-900/50 text-red-300 hover:bg-red-900 border border-red-700' 
                              : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                          }`}
                        >
                          <Ban className="h-4 w-4" />
                          <span>Ban Student</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Banned Students Modal
function BannedStudentsModal({ isDarkMode, bannedStudents, onClose, onUnban }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50 animate-fadeIn">
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border shadow-2xl animate-slideUp`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex items-center justify-between sticky top-0`}>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Banned Students</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {bannedStudents.length} student{bannedStudents.length !== 1 ? 's' : ''} banned from your internships
            </p>
          </div>
          <button onClick={onClose} className={isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          {bannedStudents.length === 0 ? (
            <div className="text-center py-12">
              <ShieldAlert className={`h-12 w-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-3`} />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No banned students</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bannedStudents.map((ban, index) => (
                <div 
                  key={ban.banId} 
                  className={`border rounded-lg p-6 transition-all animate-slideUp ${
                    isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                        {ban.studentName}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{ban.studentEmail}</p>
                      {ban.reason && (
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          <span className="font-medium">Reason:</span> {ban.reason}
                        </p>
                      )}
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Banned on: {new Date(ban.bannedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => onUnban(ban.studentId, ban.studentName)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                        isDarkMode 
                          ? 'bg-green-900/50 text-green-300 hover:bg-green-900' 
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      Unban
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}