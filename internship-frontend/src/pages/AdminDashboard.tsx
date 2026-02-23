import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Briefcase, LogOut, Users, Building2, FileText,
  CheckCircle, RefreshCw, Ban, ShieldAlert, X, UserX,
  BarChart3, PieChart, Award, Shield
} from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  totalCompanies: number;
  activeInternships: number;
  totalApplications: number;
}

interface Dashboard {
  stats: DashboardStats;
}

interface Reports {
  topCompanies?: Array<{ companyName: string; internshipCount: number }>;
  topStudents?: Array<{ studentName: string; applicationCount: number; acceptedCount: number }>;
  applicationsByStatus?: Array<{ status: string; count: number }>;
  internshipsByStatus?: Array<{ status: string; count: number }>;
}

interface Student {
  studentID: number;
  firstName: string;
  lastName: string;
  email: string;
  university?: string;
  degree?: string;
}

interface Company {
  companyID: number;
  companyName: string;
  email: string;
}

interface BannedUser {
  banId: number;
  userId: number;
  userName: string;
  email: string;
  userType: 'Student' | 'Company';
  reason?: string;
  bannedAt: string;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [reports, setReports] = useState<Reports | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBannedUsersModal, setShowBannedUsersModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [userModalType, setUserModalType] = useState<'students' | 'companies'>('students');

  const formatDate = (dateValue: string | null | undefined): string => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
      setStudents(studentsRes.data.students || []);
      setCompanies(companiesRes.data.companies || []);
      setBannedUsers(bannedRes.data || []);
      
      if (showToast) toast.success('Dashboard refreshed!');
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

  const handleBanUser = async (userId: number, userType: string, userName: string) => {
    const reason = prompt(`Why are you banning ${userName}? (This will log them out immediately)`);
    if (!reason) return;

    try {
      await adminAPI.banUser(userId, userType, reason);
      toast.success(`${userName} has been banned and logged out`);
      loadAllData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: number, userType: string, userName: string) => {
    if (!confirm(`Are you sure you want to unban ${userName}?`)) return;

    try {
      await adminAPI.unbanUser(userId, userType);
      toast.success(`${userName} has been unbanned`);
      loadAllData();
    } catch {
      toast.error('Failed to unban user');
    }
  };

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) return;
    await logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const openUsersModal = (type: 'students' | 'companies') => {
    setUserModalType(type);
    setShowUsersModal(true);
  };

  const stats = [
    { 
      label: 'Total Students', 
      value: dashboard?.stats.totalStudents || 0, 
      icon: Users,
      color: 'var(--neon-cyan)',
      onClick: () => openUsersModal('students')
    },
    { 
      label: 'Total Companies', 
      value: dashboard?.stats.totalCompanies || 0, 
      icon: Building2,
      color: 'var(--neon-purple)',
      onClick: () => openUsersModal('companies')
    },
    { 
      label: 'Active Internships', 
      value: dashboard?.stats.activeInternships || 0, 
      icon: Briefcase,
      color: '#00ff78',
      onClick: undefined
    },
    { 
      label: 'Total Applications', 
      value: dashboard?.stats.totalApplications || 0, 
      icon: FileText,
      color: 'var(--neon-orange)',
      onClick: undefined
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4" style={{ background: '#050510' }}>
        <div className="retro-spinner" style={{ width: '48px', height: '48px' }} />
        <p className="font-['Orbitron'] text-xs tracking-widest" style={{ color: 'rgba(255,80,80,0.5)' }}>
          LOADING ADMIN PANEL...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          style: { 
            background: '#080820', 
            border: '1px solid rgba(255,80,80,0.3)', 
            color: '#d0d8e8', 
            fontFamily: 'Share Tech Mono, monospace', 
            fontSize: '0.8rem' 
          } 
        }} 
      />
      
      {/* Header */}
      <header className="retro-navbar">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border flex items-center justify-center" style={{ background: 'rgba(255,80,80,0.05)', borderColor: 'rgba(255,80,80,0.3)' }}>
              <Shield className="h-5 w-5" style={{ color: '#ff6666' }} />
            </div>
            <div>
              <div className="font-['Orbitron'] font-black text-base tracking-widest text-white">IMS</div>
              <div className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(255,80,80,0.5)', letterSpacing: '0.08em' }}>Admin Terminal</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-9 h-9 flex items-center justify-center border transition-colors"
              style={{ background: 'rgba(255,80,80,0.03)', borderColor: 'rgba(255,80,80,0.2)', cursor: 'pointer' }}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} style={{ color: '#ff6666' }} />
            </button>

            <button
              onClick={() => setShowBannedUsersModal(true)}
              className="relative w-9 h-9 flex items-center justify-center border transition-colors"
              style={{ background: 'rgba(255,80,80,0.03)', borderColor: 'rgba(255,80,80,0.2)', cursor: 'pointer' }}
            >
              <ShieldAlert className="h-4 w-4" style={{ color: '#ff6666' }} />
              {bannedUsers.length > 0 && (
                <span 
                  className="absolute -top-1 -right-1 h-4 w-4 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  style={{ background: '#ff6666', fontSize: '0.6rem' }}
                >
                  {bannedUsers.length}
                </span>
              )}
            </button>

            <button onClick={handleLogout} className="btn-retro-danger-sm">
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <div className="section-tag" style={{ display: 'inline-flex', borderColor: 'rgba(255,80,80,0.3)', background: 'rgba(255,80,80,0.05)' }}>
            <span style={{ marginLeft: '0.25rem', color: '#ff6666' }}>Admin Portal</span>
          </div>
          <h2 className="text-3xl md:text-4xl text-white mb-1">
            Welcome, <span style={{ color: '#ff6666' }} className="text-glow-red">{user?.name}</span>
          </h2>
          <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(255,80,80,0.4)', letterSpacing: '0.08em' }}>
            Monitor and manage the entire platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              onClick={stat.onClick}
              className="stat-card"
              style={{ cursor: stat.onClick ? 'pointer' : 'default' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div 
                  className="w-10 h-10 flex items-center justify-center border"
                  style={{ background: `${stat.color}10`, borderColor: `${stat.color}40` }}
                >
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <div className="font-['Orbitron'] font-black text-3xl" style={{ color: stat.color }}>
                  {stat.value}
                </div>
              </div>
              <div className="font-['Orbitron'] text-xs tracking-widest uppercase" style={{ color: 'rgba(160,180,200,0.5)' }}>
                {stat.label}
              </div>
              {stat.onClick && (
                <p className="font-['Share_Tech_Mono'] text-xs mt-2" style={{ color: 'rgba(0,243,255,0.4)' }}>
                  Click to view all →
                </p>
              )}
              <div 
                className="absolute top-3 right-3 w-2 h-2 rounded-full" 
                style={{ background: stat.color, boxShadow: `0 0 6px ${stat.color}`, opacity: 0.7 }} 
              />
            </div>
          ))}
        </div>

        {/* Reports Section */}
        {reports && (
          <div className="mb-8">
            <h3 className="font-['Orbitron'] text-sm tracking-widest mb-4" style={{ color: 'rgba(255,80,80,0.6)' }}>
              // REPORTS & ANALYTICS
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top Companies */}
              <div className="retro-panel p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 flex items-center justify-center border"
                    style={{ background: 'rgba(0,243,255,0.1)', borderColor: 'rgba(0,243,255,0.3)' }}
                  >
                    <Award className="h-5 w-5" style={{ color: 'var(--neon-cyan)' }} />
                  </div>
                  <h4 className="font-['Orbitron'] text-sm text-white tracking-wide">Top Companies</h4>
                </div>
                <div className="space-y-3">
                  {reports.topCompanies?.slice(0, 5).map((company, index) => (
                    <div key={index} className="flex items-center justify-between p-3" style={{ background: 'rgba(0,0,20,0.5)', border: '1px solid rgba(0,243,255,0.1)' }}>
                      <div className="flex items-center gap-3">
                        <div className="font-['Orbitron'] text-xs" style={{ color: 'rgba(0,243,255,0.4)' }}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-['Orbitron'] text-xs text-white">{company.companyName}</p>
                          <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(0,243,255,0.5)' }}>
                            {company.internshipCount} internships
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!reports.topCompanies || reports.topCompanies.length === 0) && (
                    <p className="font-['Share_Tech_Mono'] text-xs text-center py-4" style={{ color: 'rgba(0,243,255,0.3)' }}>
                      No data available
                    </p>
                  )}
                </div>
              </div>

              {/* Application Status */}
              <div className="retro-panel p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 flex items-center justify-center border"
                    style={{ background: 'rgba(176,38,255,0.1)', borderColor: 'rgba(176,38,255,0.3)' }}
                  >
                    <PieChart className="h-5 w-5" style={{ color: 'var(--neon-purple)' }} />
                  </div>
                  <h4 className="font-['Orbitron'] text-sm text-white tracking-wide">Application Status</h4>
                </div>
                <div className="space-y-3">
                  {reports.applicationsByStatus?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3" style={{ background: 'rgba(0,0,20,0.5)', border: '1px solid rgba(176,38,255,0.1)' }}>
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ 
                            background: item.status === 'Pending' ? 'var(--neon-orange)' :
                                        item.status === 'Accepted' ? '#00ff78' : '#ff6666'
                          }}
                        />
                        <span className="font-['Share_Tech_Mono'] text-sm text-white">{item.status}</span>
                      </div>
                      <span className="font-['Orbitron'] text-lg" style={{ color: 'var(--neon-purple)' }}>
                        {item.count}
                      </span>
                    </div>
                  ))}
                  {(!reports.applicationsByStatus || reports.applicationsByStatus.length === 0) && (
                    <p className="font-['Share_Tech_Mono'] text-xs text-center py-4" style={{ color: 'rgba(176,38,255,0.3)' }}>
                      No data available
                    </p>
                  )}
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
              <div className="retro-panel p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 flex items-center justify-center border"
                    style={{ background: 'rgba(0,255,120,0.1)', borderColor: 'rgba(0,255,120,0.3)' }}
                  >
                    <Users className="h-5 w-5" style={{ color: '#00ff78' }} />
                  </div>
                  <h4 className="font-['Orbitron'] text-sm text-white tracking-wide">Top Students</h4>
                </div>
                <div className="space-y-3">
                  {reports.topStudents?.slice(0, 5).map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-3" style={{ background: 'rgba(0,0,20,0.5)', border: '1px solid rgba(0,255,120,0.1)' }}>
                      <div className="flex items-center gap-3">
                        <div className="font-['Orbitron'] text-xs" style={{ color: 'rgba(0,255,120,0.4)' }}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-['Orbitron'] text-xs text-white">{student.studentName}</p>
                          <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(0,255,120,0.5)' }}>
                            {student.applicationCount} applications · {student.acceptedCount} accepted
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!reports.topStudents || reports.topStudents.length === 0) && (
                    <p className="font-['Share_Tech_Mono'] text-xs text-center py-4" style={{ color: 'rgba(0,255,120,0.3)' }}>
                      No data available
                    </p>
                  )}
                </div>
              </div>

              {/* Internship Status */}
              <div className="retro-panel p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 flex items-center justify-center border"
                    style={{ background: 'rgba(255,157,0,0.1)', borderColor: 'rgba(255,157,0,0.3)' }}
                  >
                    <BarChart3 className="h-5 w-5" style={{ color: 'var(--neon-orange)' }} />
                  </div>
                  <h4 className="font-['Orbitron'] text-sm text-white tracking-wide">Internship Status</h4>
                </div>
                <div className="space-y-3">
                  {reports.internshipsByStatus?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3" style={{ background: 'rgba(0,0,20,0.5)', border: '1px solid rgba(255,157,0,0.1)' }}>
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ background: item.status === 'Active' ? '#00ff78' : 'rgba(100,100,100,0.5)' }}
                        />
                        <span className="font-['Share_Tech_Mono'] text-sm text-white">{item.status}</span>
                      </div>
                      <span className="font-['Orbitron'] text-lg" style={{ color: 'var(--neon-orange)' }}>
                        {item.count}
                      </span>
                    </div>
                  ))}
                  {(!reports.internshipsByStatus || reports.internshipsByStatus.length === 0) && (
                    <p className="font-['Share_Tech_Mono'] text-xs text-center py-4" style={{ color: 'rgba(255,157,0,0.3)' }}>
                      No data available
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Modal */}
      {showUsersModal && (
        <div className="retro-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowUsersModal(false) }}>
          <div className="retro-modal" style={{ maxWidth: '800px' }}>
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,243,255,0.15)' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 flex items-center justify-center border"
                  style={{ 
                    background: userModalType === 'students' ? 'rgba(0,243,255,0.1)' : 'rgba(176,38,255,0.1)',
                    borderColor: userModalType === 'students' ? 'rgba(0,243,255,0.3)' : 'rgba(176,38,255,0.3)'
                  }}
                >
                  {userModalType === 'students' ? (
                    <Users className="h-5 w-5" style={{ color: 'var(--neon-cyan)' }} />
                  ) : (
                    <Building2 className="h-5 w-5" style={{ color: 'var(--neon-purple)' }} />
                  )}
                </div>
                <div>
                  <h2 className="font-['Orbitron'] text-sm text-white tracking-widest">
                    // {userModalType === 'students' ? 'ALL STUDENTS' : 'ALL COMPANIES'}
                  </h2>
                  <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(0,243,255,0.5)' }}>
                    {userModalType === 'students' ? students.length : companies.length} total
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUsersModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,243,255,0.5)' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {(userModalType === 'students' ? students : companies).map((item) => (
                <div
                  key={userModalType === 'students' ? (item as Student).studentID : (item as Company).companyID}
                  className="p-4 flex items-center justify-between"
                  style={{ background: 'rgba(0,0,20,0.6)', border: '1px solid rgba(0,243,255,0.12)' }}
                >
                  <div className="flex-1">
                    <h3 className="font-['Orbitron'] text-sm text-white mb-1">
                      {userModalType === 'students' 
                        ? `${(item as Student).firstName} ${(item as Student).lastName}` 
                        : (item as Company).companyName}
                    </h3>
                    <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(0,243,255,0.5)' }}>
                      {item.email}
                    </p>
                    {userModalType === 'students' && (item as Student).university && (
                      <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{ color: 'rgba(100,120,140,0.6)' }}>
                        {(item as Student).university} - {(item as Student).degree}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleBanUser(
                      userModalType === 'students' ? (item as Student).studentID : (item as Company).companyID,
                      userModalType === 'students' ? 'Student' : 'Company',
                      userModalType === 'students' ? `${(item as Student).firstName} ${(item as Student).lastName}` : (item as Company).companyName
                    )}
                    className="btn-retro-danger-sm"
                  >
                    <Ban className="h-3 w-3" />
                    Ban
                  </button>
                </div>
              ))}
              {(userModalType === 'students' ? students : companies).length === 0 && (
                <div className="text-center py-8">
                  <p className="font-['Orbitron'] text-xs tracking-widest" style={{ color: 'rgba(0,243,255,0.3)' }}>
                    NO {userModalType.toUpperCase()} FOUND
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Banned Users Modal */}
      {showBannedUsersModal && (
        <div className="retro-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowBannedUsersModal(false) }}>
          <div className="retro-modal" style={{ maxWidth: '640px' }}>
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,80,80,0.2)' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 flex items-center justify-center border"
                  style={{ background: 'rgba(255,80,80,0.1)', borderColor: 'rgba(255,80,80,0.3)' }}
                >
                  <ShieldAlert className="h-5 w-5" style={{ color: '#ff6666' }} />
                </div>
                <div>
                  <h2 className="font-['Orbitron'] text-sm text-white tracking-widest">// BANNED USERS</h2>
                  <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(255,80,80,0.5)' }}>
                    {bannedUsers.length} users banned
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBannedUsersModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,80,80,0.5)' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {bannedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <UserX className="h-12 w-12 mx-auto mb-3" style={{ color: 'rgba(255,80,80,0.2)' }} />
                  <p className="font-['Orbitron'] text-xs tracking-widest" style={{ color: 'rgba(255,80,80,0.3)' }}>
                    NO BANNED USERS
                  </p>
                </div>
              ) : (
                bannedUsers.map((ban) => (
                  <div
                    key={ban.banId}
                    className="p-4 flex items-start justify-between"
                    style={{ background: 'rgba(20,0,0,0.6)', border: '1px solid rgba(255,80,80,0.15)' }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-['Orbitron'] text-sm text-white">{ban.userName}</h3>
                        <span 
                          className="px-2 py-0.5 text-xs font-['Orbitron']"
                          style={{ 
                            background: ban.userType === 'Student' ? 'rgba(0,243,255,0.1)' : 'rgba(176,38,255,0.1)',
                            border: `1px solid ${ban.userType === 'Student' ? 'rgba(0,243,255,0.3)' : 'rgba(176,38,255,0.3)'}`,
                            color: ban.userType === 'Student' ? 'var(--neon-cyan)' : 'var(--neon-purple)'
                          }}
                        >
                          {ban.userType}
                        </span>
                      </div>
                      <p className="font-['Share_Tech_Mono'] text-xs mb-2" style={{ color: 'rgba(255,80,80,0.5)' }}>
                        {ban.email}
                      </p>
                      {ban.reason && (
                        <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(100,120,140,0.6)' }}>
                          Reason: {ban.reason}
                        </p>
                      )}
                      <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{ color: 'rgba(100,120,140,0.5)' }}>
                        Banned on: {formatDate(ban.bannedAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnbanUser(ban.userId, ban.userType, ban.userName)}
                      className="btn-retro-green-sm"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Unban
                    </button>
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