import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkmodeContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Briefcase, LogOut, Users, Building2, FileText, TrendingUp,
  Loader2, CheckCircle, Clock, Activity, Moon, Sun,
  RefreshCw, Ban, ShieldAlert, ShieldCheck, X, UserX,
  BarChart3, PieChart, Award
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [reports, setReports] = useState(null);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBannedUsersModal, setShowBannedUsersModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [userModalType, setUserModalType] = useState('');

  // Simple date formatter
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'N/A';
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async (showToast = false) => {
    setLoading(true);
    try {
      const [dashboardRes, reportsRes, studentsRes, companiesRes, bannedRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getReports(),
        adminAPI.getStudents({ page: 1, pageSize: 100 }),
        adminAPI.getCompanies({ page: 1, pageSize: 100 }),
        adminAPI.getBannedUsers(),
      ]);
      setDashboard(dashboardRes.data);
      setReports(reportsRes.data);
      setStudents(studentsRes.data.students);
      setCompanies(companiesRes.data.companies);
      setBannedUsers(bannedRes.data);
      
      if (showToast) toast.success('Dashboard refreshed!', { duration: 2000 });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAllData(true);
  };

  const handleBanUser = async (userId, userType, userName) => {
    const reason = prompt(`Why are you banning ${userName}? (This will log them out immediately)`);
    if (!reason) return;

    const loadingToast = toast.loading(`Banning ${userName}...`);
    try {
      await adminAPI.banUser(userId, userType, reason);
      toast.dismiss(loadingToast);
      toast.success(`${userName} has been banned and logged out`);
      loadAllData();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId, userType, userName) => {
    if (!confirm(`Are you sure you want to unban ${userName}?`)) return;

    const loadingToast = toast.loading(`Unbanning ${userName}...`);
    try {
      await adminAPI.unbanUser(userId, userType);
      toast.dismiss(loadingToast);
      toast.success(`${userName} has been unbanned`);
      loadAllData();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to unban user');
    }
  };

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) return;
    toast.loading('Signing out...', { duration: 1000 });
    await logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const openUsersModal = (type) => {
    setUserModalType(type);
    setShowUsersModal(true);
  };

  const stats = [
    { 
      label: 'Total Students', 
      value: dashboard?.stats.totalStudents || 0, 
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      onClick: () => openUsersModal('students')
    },
    { 
      label: 'Total Companies', 
      value: dashboard?.stats.totalCompanies || 0, 
      icon: Building2,
      gradient: 'from-purple-500 to-pink-500',
      onClick: () => openUsersModal('companies')
    },
    { 
      label: 'Active Internships', 
      value: dashboard?.stats.activeInternships || 0, 
      icon: Briefcase,
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      label: 'Total Applications', 
      value: dashboard?.stats.totalApplications || 0, 
      icon: FileText,
      gradient: 'from-orange-500 to-red-500'
    },
  ];

  if (loading) {
    return (
      <div className={isDarkMode ? 'min-h-screen bg-black' : 'min-h-screen bg-gray-50'}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-purple-500 mx-auto mb-4" />
              <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20"></div>
            </div>
            <p className={isDarkMode ? 'text-gray-400 text-lg' : 'text-gray-600 text-lg'}>
              Loading admin dashboard...
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
                <ShieldCheck className="h-8 w-8 text-purple-500" />
                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-50"></div>
              </div>
              <div>
                <h1 className={isDarkMode ? 'text-xl font-bold text-white' : 'text-xl font-bold text-gray-900'}>
                  InternHub
                </h1>
                <p className={isDarkMode ? 'text-xs text-gray-500' : 'text-xs text-gray-600'}>
                  Admin Dashboard
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
                onClick={() => setShowBannedUsersModal(true)}
                className={isDarkMode
                  ? 'relative p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all'
                  : 'relative p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all'
                }>
                <ShieldAlert className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                {bannedUsers.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {bannedUsers.length}
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
        <div className="mb-8">
          <h2 className={isDarkMode ? 'text-4xl font-bold text-white mb-2' : 'text-4xl font-bold text-gray-900 mb-2'}>
            System Overview
          </h2>
          <p className={isDarkMode ? 'text-gray-400 text-lg' : 'text-gray-600 text-lg'}>
            Monitor and manage the entire platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              onClick={stat.onClick}
              className={`${isDarkMode
                ? 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all'
                : 'bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all'
              } ${stat.onClick ? 'cursor-pointer hover:scale-105' : ''}`}>
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
              {stat.onClick && (
                <p className={isDarkMode ? 'text-xs text-gray-500 mt-2' : 'text-xs text-gray-500 mt-2'}>
                  Click to view all →
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Reports Section */}
        {reports && (
          <div className="mb-8">
            <h3 className={isDarkMode ? 'text-2xl font-bold text-white mb-4' : 'text-2xl font-bold text-gray-900 mb-4'}>
              Reports & Analytics
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top Companies */}
              <div className={isDarkMode
                ? 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6'
                : 'bg-white border border-gray-200 rounded-2xl p-6'
              }>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <h4 className={isDarkMode ? 'text-lg font-semibold text-white' : 'text-lg font-semibold text-gray-900'}>
                    Top Companies
                  </h4>
                </div>
                <div className="space-y-3">
                  {reports.topCompanies?.slice(0, 5).map((company, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={isDarkMode ? 'text-gray-500 font-bold' : 'text-gray-400 font-bold'}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className={isDarkMode ? 'text-white font-medium' : 'text-gray-900 font-medium'}>
                            {company.companyName}
                          </p>
                          <p className={isDarkMode ? 'text-xs text-gray-500' : 'text-xs text-gray-600'}>
                            {company.internshipCount} internships
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Status */}
              <div className={isDarkMode
                ? 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6'
                : 'bg-white border border-gray-200 rounded-2xl p-6'
              }>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <PieChart className="h-5 w-5 text-white" />
                  </div>
                  <h4 className={isDarkMode ? 'text-lg font-semibold text-white' : 'text-lg font-semibold text-gray-900'}>
                    Application Status
                  </h4>
                </div>
                <div className="space-y-3">
                  {reports.applicationsByStatus && reports.applicationsByStatus.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${
                          item.status === 'Pending' ? 'bg-yellow-400' :
                          item.status === 'Accepted' ? 'bg-green-400' :
                          'bg-red-400'
                        }`}></div>
                        <span className={isDarkMode ? 'text-white font-medium' : 'text-gray-700'}>{item.status}</span>
                      </div>
                      <span className={isDarkMode ? 'text-white font-bold text-lg' : 'text-gray-900 font-semibold'}>
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Second Row - More Reports */}
        {reports && (
          <div className="mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top Students */}
              <div className={isDarkMode
                ? 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6'
                : 'bg-white border border-gray-200 rounded-2xl p-6'
              }>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h4 className={isDarkMode ? 'text-lg font-semibold text-white' : 'text-lg font-semibold text-gray-900'}>
                    Top Students
                  </h4>
                </div>
                <div className="space-y-3">
                  {reports.topStudents?.slice(0, 5).map((student, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={isDarkMode ? 'text-gray-500 font-bold' : 'text-gray-400 font-bold'}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className={isDarkMode ? 'text-white font-medium' : 'text-gray-900 font-medium'}>
                            {student.studentName}
                          </p>
                          <p className={isDarkMode ? 'text-xs text-gray-400' : 'text-xs text-gray-600'}>
                            {student.applicationCount} applications · {student.acceptedCount} accepted
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internship Status */}
              <div className={isDarkMode
                ? 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6'
                : 'bg-white border border-gray-200 rounded-2xl p-6'
              }>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <h4 className={isDarkMode ? 'text-lg font-semibold text-white' : 'text-lg font-semibold text-gray-900'}>
                    Internship Status
                  </h4>
                </div>
                <div className="space-y-3">
                  {reports.internshipsByStatus && reports.internshipsByStatus.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${
                          item.status === 'Active' ? 'bg-green-400' : 'bg-gray-400'
                        }`}></div>
                        <span className={isDarkMode ? 'text-white font-medium' : 'text-gray-700'}>{item.status}</span>
                      </div>
                      <span className={isDarkMode ? 'text-white font-bold text-lg' : 'text-gray-900 font-semibold'}>
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Modal */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={isDarkMode
            ? 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto'
            : 'bg-white border border-gray-200 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto'
          }>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3 bg-gradient-to-r ${userModalType === 'students' ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500'} rounded-xl`}>
                  {userModalType === 'students' ? (
                    <Users className="h-6 w-6 text-white" />
                  ) : (
                    <Building2 className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className={isDarkMode ? 'text-2xl font-bold text-white' : 'text-2xl font-bold text-gray-900'}>
                    {userModalType === 'students' ? 'All Students' : 'All Companies'}
                  </h2>
                  <p className={isDarkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>
                    {userModalType === 'students' ? students.length : companies.length} total
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUsersModal(false)}
                className={isDarkMode ? 'p-2 hover:bg-white/10 rounded-lg transition-colors' : 'p-2 hover:bg-gray-100 rounded-lg transition-colors'}>
                <X className={isDarkMode ? 'h-5 w-5 text-gray-400' : 'h-5 w-5 text-gray-600'} />
              </button>
            </div>

            <div className="space-y-3">
              {(userModalType === 'students' ? students : companies).map((item) => (
                <div
                  key={userModalType === 'students' ? item.studentID : item.companyID}
                  className={isDarkMode
                    ? 'bg-white/5 border border-white/10 rounded-xl p-5'
                    : 'bg-gray-50 border border-gray-200 rounded-xl p-5'
                  }>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className={isDarkMode ? 'font-semibold text-white mb-1' : 'font-semibold text-gray-900 mb-1'}>
                        {userModalType === 'students' 
                          ? `${item.firstName} ${item.lastName}` 
                          : item.companyName}
                      </h3>
                      <p className={isDarkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>
                        {item.email}
                      </p>
                      {userModalType === 'students' && (
                        <p className={isDarkMode ? 'text-xs text-gray-500 mt-1' : 'text-xs text-gray-600 mt-1'}>
                          {item.university} - {item.degree}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleBanUser(
                        userModalType === 'students' ? item.studentID : item.companyID,
                        userModalType === 'students' ? 'Student' : 'Company',
                        userModalType === 'students' ? `${item.firstName} ${item.lastName}` : item.companyName
                      )}
                      className={isDarkMode
                        ? 'px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all text-sm flex items-center space-x-2'
                        : 'px-4 py-2 bg-gray-100 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-200 transition-all text-sm flex items-center space-x-2'
                      }>
                      <Ban className="h-4 w-4" />
                      <span>Ban</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Banned Users Modal */}
      {showBannedUsersModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={isDarkMode
            ? 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto'
            : 'bg-white border border-gray-200 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto'
          }>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
                  <ShieldAlert className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className={isDarkMode ? 'text-2xl font-bold text-white' : 'text-2xl font-bold text-gray-900'}>
                    Banned Users
                  </h2>
                  <p className={isDarkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>
                    {bannedUsers.length} users banned
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBannedUsersModal(false)}
                className={isDarkMode ? 'p-2 hover:bg-white/10 rounded-lg transition-colors' : 'p-2 hover:bg-gray-100 rounded-lg transition-colors'}>
                <X className={isDarkMode ? 'h-5 w-5 text-gray-400' : 'h-5 w-5 text-gray-600'} />
              </button>
            </div>

            <div className="space-y-3">
              {bannedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <UserX className={`h-12 w-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    No banned users
                  </p>
                </div>
              ) : (
                bannedUsers.map((ban) => (
                  <div
                    key={ban.banId}
                    className={isDarkMode
                      ? 'bg-white/5 border border-white/10 rounded-xl p-5'
                      : 'bg-gray-50 border border-gray-200 rounded-xl p-5'
                    }>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={isDarkMode ? 'font-semibold text-white' : 'font-semibold text-gray-900'}>
                            {ban.userName}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            ban.userType === 'Student' 
                              ? isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                              : isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {ban.userType}
                          </span>
                        </div>
                        <p className={isDarkMode ? 'text-sm text-gray-400 mb-2' : 'text-sm text-gray-600 mb-2'}>
                          {ban.email}
                        </p>
                        {ban.reason && (
                          <p className={isDarkMode ? 'text-sm text-gray-500' : 'text-sm text-gray-500'}>
                            Reason: {ban.reason}
                          </p>
                        )}
                        <p className={isDarkMode ? 'text-xs text-gray-600 mt-1' : 'text-xs text-gray-500 mt-1'}>
                          Banned on: {formatDate(ban.bannedAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnbanUser(
                          ban.userId,
                          ban.userType,
                          ban.userName
                        )}
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