import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDarkMode  } from '../context/DarkModeContext';
import { useNavigate } from 'react-router-dom';
import { internshipAPI, applicationAPI } from '../services/api';
import { Briefcase, LogOut, Search, MapPin, Calendar, Building2, FileText, CheckCircle, Clock, XCircle, Loader2, ExternalLink, RefreshCw, Moon, Sun } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (showToast = false) => {
    setLoading(true);
    try {
      const [internshipsRes, applicationsRes] = await Promise.all([
        internshipAPI.getAll({ title: searchTerm, location: locationFilter }),
        applicationAPI.getMine(),
      ]);
      setInternships(internshipsRes.data);
      setApplications(applicationsRes.data);
      if (showToast) {
        toast.success('Dashboard refreshed!', { duration: 2000 });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      toast.loading('Signing out...', { duration: 1000 });
      await logout();
      toast.success('Logged out successfully!');
      navigate('/');
    }
  };

  const handleApply = (internshipId) => {
    navigate(`/internship/${internshipId}`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Accepted: 'bg-green-100 text-green-800 border-green-200',
      Rejected: 'bg-red-100 text-red-800 border-red-200',
      Withdrawn: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    const icons = {
      Pending: Clock,
      Accepted: CheckCircle,
      Rejected: XCircle,
      Withdrawn: XCircle,
    };
    const Icon = icons[status];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${styles[status]} animate-fadeIn`}>
        <Icon className="h-4 w-4 mr-1" />
        {status}
      </span>
    );
  };

  const filteredInternships = internships.filter(i => 
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (locationFilter === '' || i.location.toLowerCase().includes(locationFilter.toLowerCase()))
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className = {`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b sticky top-0 z-10 animate-slideDown transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Briefcase className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  InternHub
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Student Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
                  isDarkMode 
                    ? 'text-yellow-400 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
                title="Toggle dark mode">
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
              onClick = {toggleDarkMode}
              className = {`p-2 rounded-lg transition-all transform hover:scale-110 ${ isDarkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title = {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-purple-400 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
                title="Refresh dashboard">

                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="text-right">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user.name}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${
                  isDarkMode 
                   ? 'text-gray-300 hover:text-red-400 hover:bg-red-900/30' 
                   : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                }`}>
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all animate-slideUp">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Total Applications</p>
                <p className="text-4xl font-bold">{applications.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm mb-1">Pending</p>
                <p className="text-4xl font-bold">
                  {applications.filter(a => a.status === 'Pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Accepted</p>
                <p className="text-4xl font-bold">
                  {applications.filter(a => a.status === 'Accepted').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`rounded-xl shadow-sm border mb-6 animate-fadeIn ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
          }`}>
          <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-all transform ${
                activeTab === 'browse'
                  ? 'border-purple-600 text-purple-600 scale-105'
                  : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} hover:scale-102`
                }`}>
                Browse Internships ({filteredInternships.length})
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-all transform ${
                activeTab === 'applications'
                  ? 'border-purple-600 text-purple-600 scale-105'
                  : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} hover:scale-102`
                }`}>
                My Applications ({applications.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'browse' && (
              <>
                {/* Search Filters */}
                <div className="flex gap-4 mb-6 animate-slideUp">
                  <div className="flex-1 relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder="Search by title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  <div className="w-64 relative">
                    <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      placeholder="Location..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all ${
                        isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Internships List */}
                <div className="space-y-4">
                  {filteredInternships.length === 0 ? (
                    <div className="text-center py-12 animate-fadeIn">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No internships found</p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setLocationFilter('');
                        }}
                        className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    filteredInternships.map((internship, index) => {
                      const hasApplied = applications.some(a => a.internship.internshipID === internship.internshipID);
                      return (
                        <div
                        key={internship.internshipID}
                        className={`border rounded-lg p-6 transition-all transform hover:scale-102 animate-slideUp ${
                          isDarkMode 
                            ? 'border-gray-700 hover:border-purple-500 bg-gray-800' 
                            : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Building2 className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {internship.title}
                                  </h3>
                                  <p className="text-purple-600 font-medium mb-2">
                                    {internship.company.companyName}
                                  </p>
                                  <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {internship.description}
                                  </p>
                                  <div className={`flex flex-wrap gap-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
                              </div>
                            </div>
                            <button
                              onClick={() => handleApply(internship.internshipID)}
                              disabled={hasApplied}
                              className={`ml-4 px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all ${
                                hasApplied
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105 active:scale-95 shadow-md'
                              }`}
                            >
                              {hasApplied ? (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Applied</span>
                                </>
                              ) : (
                                <>
                                  <span>Apply Now</span>
                                  <ExternalLink className="h-4 w-4" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {activeTab === 'applications' && (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-12 animate-fadeIn">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">No applications yet</p>
                    <button
                      onClick={() => setActiveTab('browse')}
                      className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
                    >
                      Browse internships to get started
                    </button>
                  </div>
                ) : (
                  applications.map((application, index) => (
                    <div
                      key={application.applicationID}
                      className="border border-gray-200 rounded-lg p-6 transform hover:scale-102 transition-all animate-slideUp"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {application.internship.title}
                          </h3>
                          <p className="text-gray-600 mb-2">{application.internship.companyName}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {application.internship.location}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Applied {new Date(application.appliedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>
                      {application.status === 'Pending' && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 animate-fadeIn">
                          <p className="text-sm text-blue-800">
                            <Clock className="h-4 w-4 inline mr-1" />
                            Your application is under review. You'll be notified once there's an update.
                          </p>
                        </div>
                      )}
                      {application.status === 'Accepted' && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100 animate-fadeIn">
                          <p className="text-sm text-green-800 font-medium">
                            🎉 Congratulations! Your application has been accepted. The company will contact you soon.
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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