import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkmodeContext';
import { useNavigate } from 'react-router-dom';
import { internshipAPI, applicationAPI, companyAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Briefcase, LogOut, Plus, Users, FileText, Eye, X, 
  Loader2, Calendar, MapPin, CheckCircle, Clock, XCircle, 
  Edit2, Trash2, Moon, Sun, RefreshCw, Download, Ban, ShieldAlert,
  Building2, Activity, AlertCircle, UserX
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
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    startDate: '',
    endDate: '',
  });

  const [formErrors, setFormErrors] = useState({});

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
      await applicationAPI.updateStatus(applicationId, { status });
      toast.dismiss(loadingToast);
      toast.success(`Application ${status.toLowerCase()} successfully!`, { 
        icon: status === 'Accepted' ? '✅' : '❌' 
      });
      if (selectedInternship) {
        const response = await applicationAPI.getForInternship(selectedInternship.internshipID);
        setApplications(response.data);
      }
      loadData();
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
      loadData();
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
      loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to unban student');
    }
  };

  const handleDownloadResume = async (applicationId, studentName) => {
    const loadingToast = toast.loading('Downloading resume...');
    try {
      const response = await applicationAPI.downloadResume(applicationId);
      
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
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateInternship = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const loadingToast = toast.loading('Creating internship...');
    try {
      await internshipAPI.create(formData);
      toast.dismiss(loadingToast);
      toast.success('Internship posted successfully!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        location: '',
        startDate: '',
        endDate: '',
      });
      setFormErrors({});
      loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to create internship');
      console.error('Error creating internship:', error);
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
    const config = {
      Pending: {
        bg: isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-100',
        text: isDarkMode ? 'text-yellow-400' : 'text-yellow-800',
        border: isDarkMode ? 'border-yellow-500/20' : 'border-yellow-200',
        icon: Clock
      },
      Accepted: {
        bg: isDarkMode ? 'bg-green-500/10' : 'bg-green-100',
        text: isDarkMode ? 'text-green-400' : 'text-green-800',
        border: isDarkMode ? 'border-green-500/20' : 'border-green-200',
        icon: CheckCircle
      },
      Rejected: {
        bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-100',
        text: isDarkMode ? 'text-red-400' : 'text-red-800',
        border: isDarkMode ? 'border-red-500/20' : 'border-red-200',
        icon: XCircle
      }
    };
    
    const { bg, text, border, icon: Icon } = config[status] || config.Pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${bg} ${text} ${border}`}>
        <Icon className="h-4 w-4 mr-1.5" />
        {status}
      </span>
    );
  };

  const totalApplications = internships.reduce((sum, i) => sum + (i.applicationCount || 0), 0);
  const activeInternships = internships.filter(i => i.status === 'Active').length;

  const stats = [
    { 
      label: 'Total Internships', 
      value: internships.length, 
      icon: Briefcase,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      label: 'Active Postings', 
      value: activeInternships, 
      icon: Activity,
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      label: 'Applications', 
      value: totalApplications, 
      icon: FileText,
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      label: 'Banned Students', 
      value: bannedStudents.length, 
      icon: ShieldAlert,
      gradient: 'from-red-500 to-orange-500'
    },
  ];

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
              Loading your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'min-h-screen bg-black' : 'min-h-screen bg-gray-50'}>
      <Toaster position="top-right" />

      {/* Header */}
      <header className={isDarkMode 
        ? 'bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50' 
        : 'bg-white/50 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50'
      }>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Building2 className="h-8 w-8 text-purple-500" />
                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-50"></div>
              </div>
              <div>
                <h1 className={isDarkMode ? 'text-xl font-bold text-white' : 'text-xl font-bold text-gray-900'}>
                  InternHub
                </h1>
                <p className={isDarkMode ? 'text-xs text-gray-500' : 'text-xs text-gray-600'}>
                  Company Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={isDarkMode
                  ? 'p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all'
                  : 'p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all'
                }>
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>

              <button
                onClick={toggleDarkMode}
                className={isDarkMode
                  ? 'p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all'
                  : 'p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all'
                }>
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>

              <button
                onClick={() => setShowBannedStudentsModal(true)}
                className={isDarkMode
                  ? 'relative p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all'
                  : 'relative p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all'
                }>
                <ShieldAlert className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                {bannedStudents.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {bannedStudents.length}
                  </span>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all">
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className={isDarkMode ? 'text-4xl font-bold text-white mb-2' : 'text-4xl font-bold text-gray-900 mb-2'}>
              Welcome back, {user?.name}
            </h2>
            <p className={isDarkMode ? 'text-gray-400 text-lg' : 'text-gray-600 text-lg'}>
              Manage your internships and applications
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105">
            <Plus className="h-5 w-5" />
            <span>Post Internship</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={isDarkMode
                ? 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all'
                : 'bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all'
              }>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-r ${stat.gradient} rounded-xl`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className={isDarkMode ? 'text-3xl font-bold text-white mb-1' : 'text-3xl font-bold text-gray-900 mb-1'}>
                {stat.value}
              </div>
              <div className={isDarkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Internships Section */}
        <div className="mb-6">
          <h3 className={isDarkMode ? 'text-2xl font-bold text-white mb-4' : 'text-2xl font-bold text-gray-900 mb-4'}>
            Your Internships
          </h3>
        </div>

        {/* Internships Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {internships.length === 0 ? (
            <div className="col-span-2 text-center py-16">
              <Briefcase className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
              <p className={isDarkMode ? 'text-gray-400 text-lg mb-4' : 'text-gray-600 text-lg mb-4'}>
                No internships posted yet
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all">
                Post Your First Internship
              </button>
            </div>
          ) : (
            internships.map((internship) => (
              <div
                key={internship.internshipID}
                className={isDarkMode
                  ? 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all'
                  : 'bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all'
                }>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={isDarkMode ? 'font-semibold text-white text-lg mb-1' : 'font-semibold text-gray-900 text-lg mb-1'}>
                      {internship.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {internship.applicationCount || 0} applications
                      </span>
                      <span className={internship.status === 'Active' 
                        ? 'text-green-400' 
                        : 'text-gray-400'
                      }>
                        • {internship.status}
                      </span>
                    </div>
                  </div>
                </div>

                <p className={isDarkMode ? 'text-gray-400 mb-4 line-clamp-2' : 'text-gray-600 mb-4 line-clamp-2'}>
                  {internship.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className={`h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {internship.location}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className={`h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {new Date(internship.startDate).toLocaleDateString()} - {new Date(internship.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => loadApplications(internship)}
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>View Applications</span>
                  </button>
                  {internship.status === 'Active' && (
                    <button
                      onClick={() => handleCloseInternship(internship.internshipID, internship.title)}
                      className={isDarkMode
                        ? 'px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all'
                        : 'px-4 py-2.5 bg-gray-100 border border-gray-300 text-gray-900 rounded-xl hover:bg-gray-200 transition-all'
                      }>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODALS CONTINUE IN NEXT MESSAGE DUE TO SIZE */}
      {/* Create Internship Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={isDarkMode
            ? 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto'
            : 'bg-white border border-gray-200 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto'
          }>
            <div className="flex items-center justify-between mb-6">
              <h2 className={isDarkMode ? 'text-2xl font-bold text-white' : 'text-2xl font-bold text-gray-900'}>
                Post New Internship
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormErrors({});
                }}
                className={isDarkMode ? 'p-2 hover:bg-white/10 rounded-lg transition-colors' : 'p-2 hover:bg-gray-100 rounded-lg transition-colors'}>
                <X className={isDarkMode ? 'h-5 w-5 text-gray-400' : 'h-5 w-5 text-gray-600'} />
              </button>
            </div>

            <form onSubmit={handleCreateInternship} className="space-y-5">
              <div>
                <label className={isDarkMode ? 'block text-sm font-medium text-gray-300 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={isDarkMode
                    ? 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50'
                    : 'w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }
                  placeholder="Software Engineering Intern"
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className={isDarkMode ? 'block text-sm font-medium text-gray-300 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className={isDarkMode
                    ? 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50'
                    : 'w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }
                  placeholder="Describe the internship opportunity..."
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                )}
              </div>

              <div>
                <label className={isDarkMode ? 'block text-sm font-medium text-gray-300 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                  Requirements *
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  rows={3}
                  className={isDarkMode
                    ? 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50'
                    : 'w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }
                  placeholder="Required skills and qualifications..."
                />
                {formErrors.requirements && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.requirements}</p>
                )}
              </div>

              <div>
                <label className={isDarkMode ? 'block text-sm font-medium text-gray-300 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className={isDarkMode
                    ? 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50'
                    : 'w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500'
                  }
                  placeholder="San Francisco, CA / Remote"
                />
                {formErrors.location && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.location}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={isDarkMode ? 'block text-sm font-medium text-gray-300 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className={isDarkMode
                      ? 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50'
                      : 'w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500'
                    }
                  />
                  {formErrors.startDate && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className={isDarkMode ? 'block text-sm font-medium text-gray-300 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className={isDarkMode
                      ? 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50'
                      : 'w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500'
                    }
                  />
                  {formErrors.endDate && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.endDate}</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormErrors({});
                  }}
                  className={isDarkMode
                    ? 'flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all'
                    : 'flex-1 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-xl hover:bg-gray-200 transition-all'
                  }>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all">
                  Post Internship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {showApplicationsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={isDarkMode
            ? 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto'
            : 'bg-white border border-gray-200 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto'
          }>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={isDarkMode ? 'text-2xl font-bold text-white mb-1' : 'text-2xl font-bold text-gray-900 mb-1'}>
                  Applications
                </h2>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {selectedInternship?.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowApplicationsModal(false);
                  setSelectedInternship(null);
                }}
                className={isDarkMode ? 'p-2 hover:bg-white/10 rounded-lg transition-colors' : 'p-2 hover:bg-gray-100 rounded-lg transition-colors'}>
                <X className={isDarkMode ? 'h-5 w-5 text-gray-400' : 'h-5 w-5 text-gray-600'} />
              </button>
            </div>

            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className={`h-12 w-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    No applications yet
                  </p>
                </div>
              ) : (
                applications.map((application) => (
                  <div
                    key={application.applicationID}
                    className={isDarkMode
                      ? 'bg-white/5 border border-white/10 rounded-xl p-5'
                      : 'bg-gray-50 border border-gray-200 rounded-xl p-5'
                    }>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className={isDarkMode ? 'font-semibold text-white mb-1' : 'font-semibold text-gray-900 mb-1'}>
                          {application.student?.firstName} {application.student?.lastName}
                        </h3>
                        <p className={isDarkMode ? 'text-sm text-gray-400 mb-1' : 'text-sm text-gray-600 mb-1'}>
                          {application.student?.email}
                        </p>
                        {application.student?.university && (
                          <p className={isDarkMode ? 'text-xs text-gray-500' : 'text-xs text-gray-600'}>
                            {application.student.university} - {application.student.degree}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(application.status)}
                    </div>

                    <div className="flex items-center space-x-2 text-sm mb-4">
                      <Calendar className={`h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Applied: {new Date(application.appliedDate).toLocaleDateString()}
                      </span>
                    </div>

                    {application.status === 'Pending' && (
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleStatusUpdate(application.applicationID, 'Accepted')}
                          className="flex-1 min-w-[120px] py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center space-x-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(application.applicationID, 'Rejected')}
                          className="flex-1 min-w-[120px] py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center justify-center space-x-2">
                          <XCircle className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleDownloadResume(application.applicationID, `${application.student?.firstName}_${application.student?.lastName}`)}
                          className={isDarkMode
                            ? 'px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all flex items-center space-x-2'
                            : 'px-4 py-2.5 bg-gray-100 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-200 transition-all flex items-center space-x-2'
                          }>
                          <Download className="h-4 w-4" />
                          <span>Resume</span>
                        </button>
                        <button
                          onClick={() => handleBanStudent(application.student?.studentID, `${application.student?.firstName} ${application.student?.lastName}`)}
                          className={isDarkMode
                            ? 'px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all'
                            : 'px-4 py-2.5 bg-gray-100 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-200 transition-all'
                          }>
                          <Ban className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {application.status !== 'Pending' && (
                      <button
                        onClick={() => handleDownloadResume(application.applicationID, `${application.student?.firstName}_${application.student?.lastName}`)}
                        className={isDarkMode
                          ? 'w-full py-2.5 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all flex items-center justify-center space-x-2'
                          : 'w-full py-2.5 bg-gray-100 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center space-x-2'
                        }>
                        <Download className="h-4 w-4" />
                        <span>Download Resume</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Banned Students Modal */}
      {showBannedStudentsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={isDarkMode
            ? 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto'
            : 'bg-white border border-gray-200 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto'
          }>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
                  <ShieldAlert className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className={isDarkMode ? 'text-2xl font-bold text-white' : 'text-2xl font-bold text-gray-900'}>
                    Banned Students
                  </h2>
                  <p className={isDarkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>
                    {bannedStudents.length} students banned
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBannedStudentsModal(false)}
                className={isDarkMode ? 'p-2 hover:bg-white/10 rounded-lg transition-colors' : 'p-2 hover:bg-gray-100 rounded-lg transition-colors'}>
                <X className={isDarkMode ? 'h-5 w-5 text-gray-400' : 'h-5 w-5 text-gray-600'} />
              </button>
            </div>

            <div className="space-y-3">
              {bannedStudents.length === 0 ? (
                <div className="text-center py-12">
                  <UserX className={`h-12 w-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    No banned students
                  </p>
                </div>
              ) : (
                bannedStudents.map((ban) => (
                  <div
                    key={ban.banID}
                    className={isDarkMode
                      ? 'bg-white/5 border border-white/10 rounded-xl p-5'
                      : 'bg-gray-50 border border-gray-200 rounded-xl p-5'
                    }>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={isDarkMode ? 'font-semibold text-white mb-1' : 'font-semibold text-gray-900 mb-1'}>
                          {ban.studentName}
                        </h3>
                        <p className={isDarkMode ? 'text-sm text-gray-400 mb-2' : 'text-sm text-gray-600 mb-2'}>
                          {ban.email}
                        </p>
                        {ban.reason && (
                          <p className={isDarkMode ? 'text-sm text-gray-500' : 'text-sm text-gray-500'}>
                            Reason: {ban.reason}
                          </p>
                        )}
                        <p className={isDarkMode ? 'text-xs text-gray-600 mt-1' : 'text-xs text-gray-500 mt-1'}>
                          Banned on: {new Date(ban.bannedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnbanStudent(ban.studentID, ban.studentName)}
                        className={isDarkMode
                          ? 'px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all text-sm'
                          : 'px-4 py-2 bg-gray-100 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-200 transition-all text-sm'
                        }>
                        Unban
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}