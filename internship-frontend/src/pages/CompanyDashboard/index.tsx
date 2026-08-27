import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { internshipAPI, applicationAPI, companyAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Briefcase, LogOut, Plus, Eye, Calendar, MapPin, Trash2, RefreshCw, Building2, Shield, Clock } from 'lucide-react';
import StatCounter from '../../motion/StatCounter';
import TiltCard from '../../motion/TiltCard';
import { staggerContainer, staggerItem } from '../../motion/staggerVariants';
import FixedNavbar from '../../motion/FixedNavbar';
import SuccessPulse from '../../motion/SuccessPulse';
import CreateInternshipModal from './CreateInternshipModal';
import ApplicationsModal from './ApplicationsModal';
import BannedStudentsModal from './BannedStudentsModal';
import InsightsSection from './InsightsSection';
import { Internship, Application, BannedStudent, FormData, FormErrors, ApplicationStatusCount } from './types';

export default function CompanyDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [bannedStudents, setBannedStudents] = useState<BannedStudent[]>([]);
  const [applicationStats, setApplicationStats] = useState<ApplicationStatusCount[]>([]);
  // Defaults to true so the pending-approval banner doesn't flash for already-approved
  // companies while /Company/me is still loading.
  const [isApproved, setIsApproved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [showBannedStudentsModal, setShowBannedStudentsModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({ title: '', description: '', requirements: '', location: '', startDate: '', endDate: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [postPulse, setPostPulse] = useState(0);
  const [banPulse, setBanPulse] = useState(0);
  // Which student the last successful ban applied to, so the ban pulse fires
  // on that one row's Ban button rather than on every row at once.
  const [banPulseStudentId, setBanPulseStudentId] = useState<number | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async (showToast = false) => {
    setLoading(true);
    try {
      const [inRes, bannedRes, profileRes, statsRes] = await Promise.all([
        internshipAPI.getMine(),
        companyAPI.getBannedStudents(),
        companyAPI.getMyProfile(),
        companyAPI.getApplicationStats(),
      ]);
      setInternships(inRes.data);
      setBannedStudents(bannedRes.data);
      setIsApproved(profileRes.data.isApproved);
      setApplicationStats(statsRes.data.applicationsByStatus || []);
      if (showToast) toast.success('Dashboard refreshed');
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => { setRefreshing(true); loadData(true); };

  /**
   * Clearing `banPulseStudentId` on close matters: `AnimatedModal` unmounts its
   * children when closed, so a still-set id would make `SuccessPulse` mount
   * fresh on the next open with a `trigger` that already matches a row, and
   * replay the checkmark even though no ban just happened.
   */
  const closeApplicationsModal = () => {
    setShowApplicationsModal(false);
    setBanPulseStudentId(null);
  };

  const loadApplications = async (internship: Internship) => {
    try {
      const res = await applicationAPI.getForInternship(internship.internshipID);
      setApplications(res.data);
      setSelectedInternship(internship);
      setShowApplicationsModal(true);
    } catch { toast.error('Failed to load applications'); }
  };

  const handleStatusUpdate = async (applicationId: number, status: string) => {
    try {
      await applicationAPI.updateStatus(applicationId, { status });
      toast.success(`Application ${status.toLowerCase()}`);
      if (selectedInternship) {
        const res = await applicationAPI.getForInternship(selectedInternship.internshipID);
        setApplications(res.data);
      }
      loadData();
    } catch { toast.error('Failed to update status'); }
  };

  const handleBanStudent = async (studentId: number | undefined, name: string) => {
    if (studentId === undefined) { toast.error('Could not identify that student'); return; }
    const reason = prompt(`Why are you banning ${name}?`);
    if (!reason) return;
    try {
      await companyAPI.banStudent(studentId, reason);
      toast.success(`${name} banned`);
      setBanPulseStudentId(studentId);
      setBanPulse(p => p + 1);
      loadData();
      if (selectedInternship) {
        const res = await applicationAPI.getForInternship(selectedInternship.internshipID);
        setApplications(res.data);
      }
    } catch { toast.error('Failed to ban student'); }
  };

  const handleUnbanStudent = async (studentId: number, name: string) => {
    if (!confirm(`Unban ${name}?`)) return;
    try {
      await companyAPI.unbanStudent(studentId);
      toast.success(`${name} unbanned`);
      loadData();
    } catch { toast.error('Failed to unban'); }
  };

  const handleDownloadResume = async (applicationId: number, name: string) => {
    try {
      const res = await applicationAPI.downloadResume(applicationId);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', `${name.replace(' ', '_')}_Resume.pdf`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Resume downloaded');
    } catch { toast.error('Failed to download resume'); }
  };

  const validateForm = () => {
    const e: FormErrors = {};
    if (!formData.title.trim()) e.title = 'Required';
    if (!formData.description.trim()) e.description = 'Required';
    if (!formData.location.trim()) e.location = 'Required';
    if (!formData.startDate) e.startDate = 'Required';
    if (!formData.endDate) e.endDate = 'Required';
    if (!formData.requirements.trim()) e.requirements = 'Required';
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) e.endDate = 'End must be after start';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateInternship = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await internshipAPI.create(formData);
      toast.success('Internship posted!');
      setPostPulse(p => p + 1);
      setShowCreateModal(false);
      setFormData({ title: '', description: '', requirements: '', location: '', startDate: '', endDate: '' });
      setFormErrors({});
      loadData();
    } catch { toast.error('Failed to create internship'); }
  };

  const handleCloseInternship = async (id: number, title: string) => {
    if (!confirm(`Close "${title}"?`)) return;
    try {
      await internshipAPI.delete(id);
      toast.success('Internship closed');
      loadData();
    } catch { toast.error('Failed to close internship'); }
  };

  const handleLogout = async () => {
    if (!confirm('Terminate session?')) return;
    await logout();
    navigate('/');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const totalApplications = internships.reduce((s, i) => s + (i.applicationCount || 0), 0);
  const activeInternships = internships.filter(i => i.status === 'Active').length;

  if (loading) return (
    <main id="main" className="min-h-screen flex items-center justify-center flex-col gap-4" style={{ background: '#050510' }}>
      <div className="retro-spinner" style={{ width: '48px', height: '48px' }} />
      <p className="font-['Orbitron'] text-xs tracking-widest" style={{ color: 'rgba(0,243,255,0.5)' }}>LOADING COMPANY DATA...</p>
    </main>
  );

  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      {/* Navbar */}
      <FixedNavbar>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border flex items-center justify-center" style={{ background: 'rgba(176,38,255,0.05)', borderColor: 'rgba(176,38,255,0.3)' }}>
              <Building2 className="h-5 w-5" style={{ color: 'var(--neon-purple)' }} />
            </div>
            <div>
              <div className="font-['Orbitron'] font-black text-base tracking-widest text-white">IMS</div>
              <div className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(176,38,255,0.5)', letterSpacing: '0.08em' }}>Company Terminal</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} disabled={refreshing} className="w-9 h-9 flex items-center justify-center border transition-colors" style={{ background: 'rgba(176,38,255,0.03)', borderColor: 'rgba(176,38,255,0.2)', cursor: 'pointer' }}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} style={{ color: 'var(--neon-purple)' }} />
            </button>
            <button onClick={() => setShowBannedStudentsModal(true)} className="btn-retro-danger-sm">
              <Shield className="h-3.5 w-3.5" />Banned
            </button>
            <button onClick={handleLogout} className="btn-retro-danger-sm">
              <LogOut className="h-3.5 w-3.5" />Logout
            </button>
          </div>
        </div>
      </FixedNavbar>

      <main id="main" className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        {!isApproved && (
          <div
            className="mb-6 p-4 flex items-center gap-3 animate-fade-in-up"
            style={{ background: 'rgba(255,157,0,0.06)', border: '1px solid rgba(255,157,0,0.3)' }}
          >
            <Clock className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--neon-orange)' }} />
            <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(255,180,80,0.85)' }}>
              Your company account is pending admin approval. You'll be able to post internships once approved.
            </p>
          </div>
        )}

        <div className="mb-8 animate-fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="section-tag" style={{ display: 'inline-flex' }}>
              <span style={{ marginLeft: '0.25rem' }}>Company Portal</span>
            </div>
            <h1 className="text-3xl md:text-4xl text-white mb-1">
              Welcome, <span style={{ color: 'var(--neon-purple)' }} className="text-glow-purple">{user?.name}</span>
            </h1>
            <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(176,38,255,0.4)', letterSpacing: '0.08em' }}>Manage your internship programs</p>
          </div>
          <div className="relative inline-block">
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!isApproved}
              title={!isApproved ? 'Pending admin approval' : undefined}
              className="btn-retro-primary"
              style={{
                borderColor: 'var(--neon-purple)',
                background: 'linear-gradient(135deg,#4400aa,#8800cc)',
                opacity: isApproved ? 1 : 0.4,
                cursor: isApproved ? 'pointer' : 'not-allowed'
              }}
            >
              <Plus className="h-4 w-4" />Post New Internship
            </button>
            <SuccessPulse trigger={postPulse} color="var(--neon-purple)" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Internships', value: internships.length, color: 'var(--neon-cyan)' },
            { label: 'Active', value: activeInternships, color: '#00ff78' },
            { label: 'Applications', value: totalApplications, color: 'var(--neon-purple)' },
            { label: 'Banned', value: bannedStudents.length, color: '#ff6666' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="font-['Orbitron'] font-black text-3xl mb-1" style={{ color: s.color }}><StatCounter value={s.value} /></div>
              <div className="font-['Orbitron'] text-xs tracking-widest uppercase" style={{ color: 'rgba(160,180,200,0.5)' }}>{s.label}</div>
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}`, opacity: 0.7 }} />
            </div>
          ))}
        </div>

        <InsightsSection internships={internships} applicationsByStatus={applicationStats} />

        {/* Internships Grid */}
        <div className="mb-4">
          <h3 className="font-['Orbitron'] text-sm tracking-widest mb-4" style={{ color: 'rgba(0,243,255,0.6)' }}>// YOUR INTERNSHIPS</h3>
        </div>

        {internships.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="h-12 w-12 mx-auto mb-4" style={{ color: 'rgba(176,38,255,0.15)' }} />
            <p className="font-['Orbitron'] text-xs tracking-widest mb-6" style={{ color: 'rgba(176,38,255,0.3)' }}>NO INTERNSHIPS POSTED</p>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!isApproved}
              title={!isApproved ? 'Pending admin approval' : undefined}
              className="btn-retro-primary"
              style={{
                borderColor: 'var(--neon-purple)',
                background: 'linear-gradient(135deg,#4400aa,#8800cc)',
                opacity: isApproved ? 1 : 0.4,
                cursor: isApproved ? 'pointer' : 'not-allowed'
              }}
            >
              <Plus className="h-4 w-4" />Post Your First Internship
            </button>
          </div>
        ) : (
          <motion.div
            key={internships.length}
            className="grid md:grid-cols-2 gap-5"
            variants={staggerContainer()}
            initial="hidden"
            animate="show"
          >
            {internships.map(internship => (
              <motion.div key={internship.internshipID} variants={staggerItem()}>
              <TiltCard className="internship-card" style={{ borderColor: 'rgba(176,38,255,0.2)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center border flex-shrink-0" style={{ background: 'rgba(100,0,200,0.15)', borderColor: 'rgba(176,38,255,0.25)' }}>
                      <Briefcase className="h-5 w-5" style={{ color: 'var(--neon-purple)' }} />
                    </div>
                    <div>
                      <h3 className="font-['Orbitron'] text-sm text-white">{internship.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(176,38,255,0.5)' }}>{internship.status || 'Active'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-['Orbitron'] text-xs px-2 py-0.5" style={{ border: '1px solid rgba(0,243,255,0.2)', color: 'var(--neon-cyan)', background: 'rgba(0,243,255,0.05)' }}>
                    {internship.applicationCount || 0} apps
                  </span>
                </div>

                <p className="text-sm mb-3 line-clamp-2 leading-relaxed" style={{ color: 'rgba(160,180,210,0.55)', fontFamily: 'Rajdhani, sans-serif' }}>{internship.description}</p>

                <div className="flex items-center gap-4 mb-4 font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(100,120,140,0.6)' }}>
                  <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{internship.location}</div>
                  <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{internship.startDate ? new Date(internship.startDate).toLocaleDateString() : 'N/A'}</div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => loadApplications(internship)} className="btn-retro-sm flex-1 justify-center">
                    <Eye className="h-3.5 w-3.5" />Applications
                  </button>
                  <button onClick={() => handleCloseInternship(internship.internshipID, internship.title)} className="btn-retro-danger-sm">
                    <Trash2 className="h-3.5 w-3.5" />Close
                  </button>
                </div>
              </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <CreateInternshipModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        formData={formData}
        formErrors={formErrors}
        onInputChange={handleInputChange}
        onSubmit={handleCreateInternship}
      />

      <ApplicationsModal
        isOpen={showApplicationsModal}
        onClose={closeApplicationsModal}
        internshipTitle={selectedInternship?.title}
        applications={applications}
        banPulseStudentId={banPulseStudentId}
        banPulse={banPulse}
        onStatusUpdate={handleStatusUpdate}
        onDownloadResume={handleDownloadResume}
        onBanStudent={handleBanStudent}
      />

      <BannedStudentsModal
        isOpen={showBannedStudentsModal}
        onClose={() => setShowBannedStudentsModal(false)}
        bannedStudents={bannedStudents}
        onUnbanStudent={handleUnbanStudent}
      />
    </div>
  );
}
