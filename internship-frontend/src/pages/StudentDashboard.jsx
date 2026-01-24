import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkmodeContext';
import { useNavigate } from 'react-router-dom';
import { internshipAPI, applicationAPI } from '../services/api';
import { 
  Briefcase, LogOut, Search, MapPin, Calendar, Building2, FileText, 
  CheckCircle, Clock, XCircle, Loader2, ExternalLink, RefreshCw, 
  Moon, Sun, Sparkles, TrendingUp, Users, Target, Filter
} from 'lucide-react';
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
      Pending: isDarkMode 
        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
        : 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Accepted: isDarkMode 
        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
        : 'bg-green-100 text-green-800 border-green-200',
      Rejected: isDarkMode 
        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
        : 'bg-red-100 text-red-800 border-red-200',
      Withdrawn: isDarkMode 
        ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' 
        : 'bg-gray-100 text-gray-800 border-gray-200',
    };
    const icons = {
      Pending: Clock,
      Accepted: CheckCircle,
      Rejected: XCircle,
      Withdrawn: XCircle,
    };
    const Icon = icons[status];
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${styles[status]}`}>
        <Icon className="h-4 w-4 mr-1.5" />
        {status}
      </span>
    );
  };

  const filteredInternships = internships.filter(i => 
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (locationFilter === '' || i.location.toLowerCase().includes(locationFilter.toLowerCase()))
  );

  const stats = [
    { 
      label: 'Total Applications', 
      value: applications.length, 
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      label: 'Pending', 
      value: applications.filter(a => a.status === 'Pending').length, 
      icon: Clock,
      gradient: 'from-yellow-500 to-orange-500'
    },
    { 
      label: 'Accepted', 
      value: applications.filter(a => a.status === 'Accepted').length, 
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      label: 'Available', 
      value: internships.length, 
      icon: Briefcase,
      gradient: 'from-purple-500 to-pink-500'
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
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Briefcase className="h-8 w-8 text-blue-500" />
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50"></div>
              </div>
              <div>
                <h1 className={isDarkMode ? 'text-xl font-bold text-white' : 'text-xl font-bold text-gray-900'}>
                  IMS
                </h1>
                <p className={isDarkMode ? 'text-xs text-gray-500' : 'text-xs text-gray-600'}>
                  Student Dashboard
                </p>
              </div>
            </div>

            {/* Actions */}
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
        <div className="mb-8">
          <h2 className={isDarkMode ? 'text-4xl font-bold text-white mb-2' : 'text-4xl font-bold text-gray-900 mb-2'}>
            Welcome back, {user?.name}
          </h2>
          <p className={isDarkMode ? 'text-gray-400 text-lg' : 'text-gray-600 text-lg'}>
            Discover your next opportunity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={isDarkMode
                ? 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group'
                : 'bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group'
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

        {/* Tabs */}
        <div className="mb-6">
          <div className={isDarkMode
            ? 'inline-flex rounded-xl bg-white/5 p-1 border border-white/10'
            : 'inline-flex rounded-xl bg-gray-100 p-1'
          }>
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'browse'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>
              Browse Internships
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'applications'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>
              My Applications
            </button>
          </div>
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div>
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search internships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={isDarkMode
                      ? 'w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all'
                      : 'w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
                    }
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className={isDarkMode
                      ? 'w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all'
                      : 'w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
                    }
                  />
                </div>
              </div>
            </div>

            {/* Internships Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredInternships.length === 0 ? (
                <div className="col-span-2 text-center py-16">
                  <Briefcase className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                  <p className={isDarkMode ? 'text-gray-400 text-lg' : 'text-gray-600 text-lg'}>
                    No internships found
                  </p>
                </div>
              ) : (
                filteredInternships.map((internship) => (
                  <div
                    key={internship.internshipID}
                    className={isDarkMode
                      ? 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group'
                      : 'bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all group'
                    }>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className={isDarkMode ? 'font-semibold text-white text-lg' : 'font-semibold text-gray-900 text-lg'}>
                            {internship.title}
                          </h3>
                          <p className={isDarkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>
                            {internship.companyName}
                          </p>
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
                    </div>

                    <button
                      onClick={() => handleApply(internship.internshipID)}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2">
                      <span>View Details</span>
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                  <p className={isDarkMode ? 'text-gray-400 text-lg' : 'text-gray-600 text-lg'}>
                    No applications yet
                  </p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all">
                    Browse Internships
                  </button>
                </div>
              ) : (
                applications.map((application) => (
                  <div
                    key={application.applicationID}
                    className={isDarkMode
                      ? 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all'
                      : 'bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all'
                    }>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={isDarkMode ? 'font-semibold text-white text-lg mb-1' : 'font-semibold text-gray-900 text-lg mb-1'}>
                          {application.internship?.title || 'Internship'}
                        </h3>
                        <p className={isDarkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>
                          {application.internship?.companyName || 'Company'}
                        </p>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className={`h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Applied: {new Date(application.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {application.resumePath && (
                        <div className="flex items-center space-x-2 text-sm">
                          <FileText className={`h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                            Resume attached
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}