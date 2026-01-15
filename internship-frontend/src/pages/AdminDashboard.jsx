import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Briefcase, LogOut, Users, Building2, FileText, TrendingUp,
  Loader2, CheckCircle, Clock, Activity, Moon, Sun,
  RefreshCw, Ban, ShieldAlert, ShieldCheck, X
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
      await adminAPI.banUser(userId, userType, { reason });
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

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b sticky top-0 z-10 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Briefcase className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>InternHub</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
                  isDarkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
                  isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowBannedUsersModal(true)}
                className={`relative p-2 rounded-lg transition-all transform hover:scale-110 ${
                  isDarkMode ? 'text-gray-300 hover:text-red-400 hover:bg-gray-700' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <ShieldAlert className="h-5 w-5" />
                {bannedUsers.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {bannedUsers.length}
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
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>System Overview</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all cursor-pointer"
            onClick={() => openUsersModal('students')}
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="h-10 w-10 opacity-80" />
              <Activity className="h-5 w-5 opacity-60" />
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Students</p>
            <p className="text-4xl font-bold">{dashboard?.stats.totalStudents}</p>
            <p className="text-blue-100 text-xs mt-2">Click to view all →</p>
          </div>

          <div 
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all cursor-pointer"
            onClick={() => openUsersModal('companies')}
          >
            <div className="flex items-center justify-between mb-4">
              <Building2 className="h-10 w-10 opacity-80" />
              <Activity className="h-5 w-5 opacity-60" />
            </div>
            <p className="text-purple-100 text-sm mb-1">Total Companies</p>
            <p className="text-4xl font-bold">{dashboard?.stats.totalCompanies}</p>
            <p className="text-purple-100 text-xs mt-2">Click to view all →</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="h-10 w-10 opacity-80" />
              <TrendingUp className="h-5 w-5 opacity-60" />
            </div>
            <p className="text-green-100 text-sm mb-1">Total Internships</p>
            <p className="text-4xl font-bold">{dashboard?.stats.totalInternships}</p>
            <p className="text-green-100 text-xs mt-2">{dashboard?.stats.activeInternships} active</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-10 w-10 opacity-80" />
              <Clock className="h-5 w-5 opacity-60" />
            </div>
            <p className="text-orange-100 text-sm mb-1">Total Applications</p>
            <p className="text-4xl font-bold">{dashboard?.stats.totalApplications}</p>
            <p className="text-orange-100 text-xs mt-2">{dashboard?.stats.pendingApplications} pending</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border transition-colors duration-300`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Internships</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboard?.recentInternships.map((internship) => (
                  <div key={internship.internshipID} className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{internship.title}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{internship.companyName}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{new Date(internship.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      internship.status === 'Active' 
                        ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                        : isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {internship.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border transition-colors duration-300`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Applications</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboard?.recentApplications.map((app) => (
                  <div key={app.applicationID} className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{app.studentName}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{app.internshipTitle}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      app.status === 'Pending' ? isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800' :
                      app.status === 'Accepted' ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800' :
                      isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border transition-colors duration-300`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Top Companies</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {reports?.topCompanies.map((company, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-600'}`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{company.companyName}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{company.activeInternships} active</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{company.internshipCount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border transition-colors duration-300`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Application Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {reports?.applicationsByStatus.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.status}</span>
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.count}</span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-full rounded-full ${item.status === 'Pending' ? 'bg-yellow-500' : item.status === 'Accepted' ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${(item.count / dashboard?.stats.totalApplications) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBannedUsersModal && (
        <BannedUsersModal
          isDarkMode={isDarkMode}
          bannedUsers={bannedUsers}
          onClose={() => setShowBannedUsersModal(false)}
          onUnban={handleUnbanUser}
        />
      )}

      {showUsersModal && (
        <UsersListModal
          isDarkMode={isDarkMode}
          userType={userModalType}
          users={userModalType === 'students' ? students : companies}
          bannedUsers={bannedUsers}
          onClose={() => setShowUsersModal(false)}
          onBan={handleBanUser}
        />
      )}
    </div>
  );
}

// Banned Users Modal
function BannedUsersModal({ isDarkMode, bannedUsers, onClose, onUnban }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border shadow-2xl`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between sticky top-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Banned Users</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{bannedUsers.length} users banned</p>
          </div>
          <button onClick={onClose} className={isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          {bannedUsers.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className={`h-12 w-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-3`} />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No banned users</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bannedUsers.map((ban) => (
                <div key={ban.banId} className={`border rounded-lg p-6 ${isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{ban.userName}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          ban.userType === 'Student' ? isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800' :
                          isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                        }`}>{ban.userType}</span>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{ban.email}</p>
                      {ban.reason && <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}><span className="font-medium">Reason:</span> {ban.reason}</p>}
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Banned: {new Date(ban.bannedAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => onUnban(ban.userId, ban.userType, ban.userName)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                        isDarkMode ? 'bg-green-900/50 text-green-300 hover:bg-green-900' : 'bg-green-50 text-green-600 hover:bg-green-100'
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

// Users List Modal
function UsersListModal({ isDarkMode, userType, users, bannedUsers, onClose, onBan }) {
  const title = userType === 'students' ? 'All Students' : 'All Companies';
  const bannedIds = bannedUsers.filter(b => b.userType === (userType === 'students' ? 'Student' : 'Company')).map(b => b.userId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border shadow-2xl`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between sticky top-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{users.length} total • {bannedIds.length} banned</p>
          </div>
          <button onClick={onClose} className={isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {users.map((user) => {
              const userId = userType === 'students' ? user.studentID : user.companyID;
              const userName = userType === 'students' ? `${user.firstName} ${user.lastName}` : user.companyName;
              const isBanned = bannedIds.includes(userId);
              
              return (
                <div key={userId} className={`border rounded-lg p-6 ${isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200'} ${isBanned ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userName}</h3>
                        {isBanned && <span className={`px-2 py-1 rounded text-xs font-medium ${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>BANNED</span>}
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
                      {userType === 'students' && <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{user.university} • {user.degree}</p>}
                      {userType === 'companies' && <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{user.internshipCount} internships • {user.activeInternships} active</p>}
                    </div>
                    {!isBanned && (
                      <button
                        onClick={() => onBan(userId, userType === 'students' ? 'Student' : 'Company', userName)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center space-x-2 ${
                          isDarkMode ? 'bg-red-900/50 text-red-300 hover:bg-red-900 border border-red-700' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        }`}
                      >
                        <Ban className="h-4 w-4" />
                        <span>Ban User</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}