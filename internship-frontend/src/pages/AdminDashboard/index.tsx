import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Briefcase, LogOut, Users, Building2, FileText,
  RefreshCw, ShieldAlert, UserCheck,
  Shield
} from 'lucide-react';
import StatCounter from '../../motion/StatCounter';
import FixedNavbar from '../../motion/FixedNavbar';
import ConfirmDialog from '../../motion/ConfirmDialog';
import ReportsSection from './ReportsSection';
import UsersModal from './UsersModal';
import PendingCompaniesModal from './PendingCompaniesModal';
import BannedUsersModal from './BannedUsersModal';
import { Dashboard, Reports, Student, Company, BannedUser } from './types';

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void;
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
  const [showPendingCompaniesModal, setShowPendingCompaniesModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [userModalType, setUserModalType] = useState<'students' | 'companies'>('students');
  const [banPulse, setBanPulse] = useState(0);
  // Which user the last successful ban applied to, so the ban pulse fires on
  // that one row's Ban button inside the Users modal rather than on every row.
  const [banPulseUserId, setBanPulseUserId] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState | null>(null);

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
      setBanPulseUserId(userId);
      setBanPulse(p => p + 1);
      loadAllData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleUnbanUser = (userId: number, userType: string, userName: string) => {
    setConfirmDialog({
      title: 'Unban User',
      message: `Are you sure you want to unban ${userName}?`,
      confirmLabel: 'Unban',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await adminAPI.unbanUser(userId, userType);
          toast.success(`${userName} has been unbanned`);
          loadAllData();
        } catch {
          toast.error('Failed to unban user');
        }
      },
    });
  };

  const handleApproveCompany = async (companyId: number, companyName: string) => {
    try {
      await adminAPI.approveCompany(companyId);
      toast.success(`${companyName} approved`);
      loadAllData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to approve company');
    }
  };

  const handleLogout = () => {
    setConfirmDialog({
      title: 'Terminate Session',
      message: 'Are you sure you want to log out?',
      confirmLabel: 'Log Out',
      onConfirm: async () => {
        setConfirmDialog(null);
        await logout();
        toast.success('Logged out successfully!');
        navigate('/');
      },
    });
  };

  const openUsersModal = (type: 'students' | 'companies') => {
    setUserModalType(type);
    setShowUsersModal(true);
  };

  /**
   * Clearing `banPulseUserId` on close matters: `AnimatedModal` unmounts its
   * children when closed, so a still-set id would make `SuccessPulse` mount
   * fresh on the next open with a `trigger` that already matches a row, and
   * replay the checkmark even though no ban just happened.
   */
  const closeUsersModal = () => {
    setShowUsersModal(false);
    setBanPulseUserId(null);
  };

  const pendingCompanies = companies.filter(c => !c.isApproved);

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
      <main id="main" className="min-h-screen flex items-center justify-center flex-col gap-4" style={{ background: '#050510' }}>
        <div className="retro-spinner" style={{ width: '48px', height: '48px' }} />
        <p className="font-['Orbitron'] text-xs tracking-widest" style={{ color: 'rgba(255,80,80,0.5)' }}>
          LOADING ADMIN PANEL...
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      {/* Header */}
      <FixedNavbar>
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
              onClick={() => setShowPendingCompaniesModal(true)}
              className="relative w-9 h-9 flex items-center justify-center border transition-colors"
              style={{ background: 'rgba(255,157,0,0.03)', borderColor: 'rgba(255,157,0,0.2)', cursor: 'pointer' }}
            >
              <UserCheck className="h-4 w-4" style={{ color: 'var(--neon-orange)' }} />
              {pendingCompanies.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 h-4 w-4 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  style={{ background: 'var(--neon-orange)', fontSize: '0.6rem' }}
                >
                  {pendingCompanies.length}
                </span>
              )}
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
      </FixedNavbar>

      <main id="main" className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <div className="section-tag" style={{ display: 'inline-flex', borderColor: 'rgba(255,80,80,0.3)', background: 'rgba(255,80,80,0.05)' }}>
            <span style={{ marginLeft: '0.25rem', color: '#ff6666' }}>Admin Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl text-white mb-1">
            Welcome, <span style={{ color: '#ff6666' }} className="text-glow-red">{user?.name}</span>
          </h1>
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
                  <StatCounter value={stat.value} />
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

        {reports && <ReportsSection reports={reports} />}
      </main>

      <UsersModal
        isOpen={showUsersModal}
        onClose={closeUsersModal}
        userModalType={userModalType}
        students={students}
        companies={companies}
        banPulseUserId={banPulseUserId}
        banPulse={banPulse}
        onBanUser={handleBanUser}
      />

      <PendingCompaniesModal
        isOpen={showPendingCompaniesModal}
        onClose={() => setShowPendingCompaniesModal(false)}
        pendingCompanies={pendingCompanies}
        onApprove={handleApproveCompany}
      />

      <BannedUsersModal
        isOpen={showBannedUsersModal}
        onClose={() => setShowBannedUsersModal(false)}
        bannedUsers={bannedUsers}
        formatDate={formatDate}
        onUnbanUser={handleUnbanUser}
      />

      <ConfirmDialog
        isOpen={confirmDialog !== null}
        title={confirmDialog?.title ?? ''}
        message={confirmDialog?.message ?? ''}
        confirmLabel={confirmDialog?.confirmLabel}
        tone={confirmDialog?.tone}
        onConfirm={() => confirmDialog?.onConfirm()}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  );
}
