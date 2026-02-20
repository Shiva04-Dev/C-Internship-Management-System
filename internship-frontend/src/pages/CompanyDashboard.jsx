import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { internshipAPI, applicationAPI, companyAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { Briefcase, LogOut, Plus, Users, FileText, Eye, X, Loader2, Calendar, MapPin, CheckCircle, Clock, XCircle, Edit2, Trash2, RefreshCw, Download, Ban, Building2, Activity, AlertCircle, UserX, Zap, Shield } from 'lucide-react';

export default function CompanyDashboard() {
  const { user, logout } = useAuth();
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
  const [formData, setFormData] = useState({ title:'', description:'', requirements:'', location:'', startDate:'', endDate:'' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async (showToast=false) => {
    setLoading(true);
    try {
      const [inRes, bannedRes] = await Promise.all([internshipAPI.getMine(), companyAPI.getBannedStudents()]);
      setInternships(inRes.data);
      setBannedStudents(bannedRes.data);
      if (showToast) toast.success('Dashboard refreshed');
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => { setRefreshing(true); loadData(true); };

  const loadApplications = async (internship) => {
    try {
      const res = await applicationAPI.getForInternship(internship.internshipID);
      setApplications(res.data);
      setSelectedInternship(internship);
      setShowApplicationsModal(true);
    } catch { toast.error('Failed to load applications'); }
  };

  const handleStatusUpdate = async (applicationId, status) => {
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

  const handleBanStudent = async (studentId, name) => {
    const reason = prompt(`Why are you banning ${name}?`);
    if (!reason) return;
    try {
      await companyAPI.banStudent(studentId, reason);
      toast.success(`${name} banned`);
      loadData();
      if (selectedInternship) {
        const res = await applicationAPI.getForInternship(selectedInternship.internshipID);
        setApplications(res.data);
      }
    } catch { toast.error('Failed to ban student'); }
  };

  const handleUnbanStudent = async (studentId, name) => {
    if (!confirm(`Unban ${name}?`)) return;
    try {
      await companyAPI.unbanStudent(studentId);
      toast.success(`${name} unbanned`);
      loadData();
    } catch { toast.error('Failed to unban'); }
  };

  const handleDownloadResume = async (applicationId, name) => {
    try {
      const res = await applicationAPI.downloadResume(applicationId);
      const blob = new Blob([res.data], { type:'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.setAttribute('download', `${name.replace(' ','_')}_Resume.pdf`);
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Resume downloaded');
    } catch { toast.error('Failed to download resume'); }
  };

  const validateForm = () => {
    const e = {};
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

  const handleCreateInternship = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await internshipAPI.create(formData);
      toast.success('Internship posted!');
      setShowCreateModal(false);
      setFormData({ title:'', description:'', requirements:'', location:'', startDate:'', endDate:'' });
      setFormErrors({});
      loadData();
    } catch { toast.error('Failed to create internship'); }
  };

  const handleCloseInternship = async (id, title) => {
    if (!confirm(`Close "${title}"?`)) return;
    try {
      await internshipAPI.delete(id);
      toast.success('Internship closed');
      loadData();
    } catch { toast.error('Failed to close internship'); }
  };

  const handleLogout = async () => {
    if (!confirm('Terminate session?')) return;
    await logout(); navigate('/');
  };

  const getStatusBadge = (status) => {
    const classes = { Pending:'badge-pending', Accepted:'badge-accepted', Rejected:'badge-rejected' };
    const icons = { Pending:<Clock className="h-3 w-3"/>, Accepted:<CheckCircle className="h-3 w-3"/>, Rejected:<XCircle className="h-3 w-3"/> };
    return <span className={classes[status]||'badge-pending'}>{icons[status]}{status}</span>;
  };

  const totalApplications = internships.reduce((s,i)=>s+(i.applicationCount||0),0);
  const activeInternships = internships.filter(i=>i.status==='Active').length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4" style={{background:'#050510'}}>
      <div className="retro-spinner" style={{width:'48px',height:'48px'}} />
      <p className="font-['Orbitron'] text-xs tracking-widest" style={{color:'rgba(0,243,255,0.5)'}}>LOADING COMPANY DATA...</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{background:'#050510'}}>
      <Toaster position="top-right" toastOptions={{style:{background:'#080820',border:'1px solid rgba(0,243,255,0.3)',color:'#d0d8e8',fontFamily:'Share Tech Mono, monospace',fontSize:'0.8rem'}}} />

      {/* Navbar */}
      <header className="retro-navbar">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border flex items-center justify-center" style={{background:'rgba(176,38,255,0.05)',borderColor:'rgba(176,38,255,0.3)'}}>
              <Building2 className="h-5 w-5" style={{color:'var(--neon-purple)'}} />
            </div>
            <div>
              <div className="font-['Orbitron'] font-black text-base tracking-widest text-white">IMS</div>
              <div className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(176,38,255,0.5)',letterSpacing:'0.08em'}}>Company Terminal</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} disabled={refreshing} className="w-9 h-9 flex items-center justify-center border transition-colors" style={{background:'rgba(176,38,255,0.03)',borderColor:'rgba(176,38,255,0.2)',cursor:'pointer'}}>
              <RefreshCw className={`h-4 w-4 ${refreshing?'animate-spin':''}`} style={{color:'var(--neon-purple)'}} />
            </button>
            <button onClick={()=>setShowBannedStudentsModal(true)} className="btn-retro-danger-sm">
              <Shield className="h-3.5 w-3.5" />Banned
            </button>
            <button onClick={handleLogout} className="btn-retro-danger-sm">
              <LogOut className="h-3.5 w-3.5" />Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        <div className="mb-8 animate-fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="section-tag" style={{display:'inline-flex'}}>
              <span style={{marginLeft:'0.25rem'}}>Company Portal</span>
            </div>
            <h2 className="text-3xl md:text-4xl text-white mb-1">
              Welcome, <span style={{color:'var(--neon-purple)'}} className="text-glow-purple">{user?.name}</span>
            </h2>
            <p className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(176,38,255,0.4)',letterSpacing:'0.08em'}}>Manage your internship programs</p>
          </div>
          <button onClick={()=>setShowCreateModal(true)} className="btn-retro-primary" style={{borderColor:'var(--neon-purple)',background:'linear-gradient(135deg,#4400aa,#8800cc)'}}>
            <Plus className="h-4 w-4" />Post New Internship
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {label:'Internships',value:internships.length,color:'var(--neon-cyan)'},
            {label:'Active',value:activeInternships,color:'#00ff78'},
            {label:'Applications',value:totalApplications,color:'var(--neon-purple)'},
            {label:'Banned',value:bannedStudents.length,color:'#ff6666'},
          ].map((s,i) => (
            <div key={i} className="stat-card">
              <div className="font-['Orbitron'] font-black text-3xl mb-1" style={{color:s.color}}>{s.value}</div>
              <div className="font-['Orbitron'] text-xs tracking-widest uppercase" style={{color:'rgba(160,180,200,0.5)'}}>{s.label}</div>
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{background:s.color,boxShadow:`0 0 6px ${s.color}`,opacity:0.7}} />
            </div>
          ))}
        </div>

        {/* Internships Grid */}
        <div className="mb-4">
          <h3 className="font-['Orbitron'] text-sm tracking-widest mb-4" style={{color:'rgba(0,243,255,0.6)'}}>// YOUR INTERNSHIPS</h3>
        </div>

        {internships.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="h-12 w-12 mx-auto mb-4" style={{color:'rgba(176,38,255,0.15)'}} />
            <p className="font-['Orbitron'] text-xs tracking-widest mb-6" style={{color:'rgba(176,38,255,0.3)'}}>NO INTERNSHIPS POSTED</p>
            <button onClick={()=>setShowCreateModal(true)} className="btn-retro-primary" style={{borderColor:'var(--neon-purple)',background:'linear-gradient(135deg,#4400aa,#8800cc)'}}>
              <Plus className="h-4 w-4" />Post Your First Internship
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {internships.map(internship => (
              <div key={internship.internshipID} className="internship-card" style={{borderColor:'rgba(176,38,255,0.2)'}}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center border flex-shrink-0" style={{background:'rgba(100,0,200,0.15)',borderColor:'rgba(176,38,255,0.25)'}}>
                      <Briefcase className="h-5 w-5" style={{color:'var(--neon-purple)'}} />
                    </div>
                    <div>
                      <h3 className="font-['Orbitron'] text-sm text-white">{internship.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(176,38,255,0.5)'}}>{internship.status || 'Active'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-['Orbitron'] text-xs px-2 py-0.5" style={{border:'1px solid rgba(0,243,255,0.2)',color:'var(--neon-cyan)',background:'rgba(0,243,255,0.05)'}}>
                    {internship.applicationCount || 0} apps
                  </span>
                </div>

                <p className="text-sm mb-3 line-clamp-2 leading-relaxed" style={{color:'rgba(160,180,210,0.55)',fontFamily:'Rajdhani, sans-serif'}}>{internship.description}</p>

                <div className="flex items-center gap-4 mb-4 font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(100,120,140,0.6)'}}>
                  <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/>{internship.location}</div>
                  <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5"/>{internship.startDate ? new Date(internship.startDate).toLocaleDateString() : 'N/A'}</div>
                </div>

                <div className="flex gap-2">
                  <button onClick={()=>loadApplications(internship)} className="btn-retro-sm flex-1 justify-center">
                    <Eye className="h-3.5 w-3.5"/>Applications
                  </button>
                  <button onClick={()=>handleCloseInternship(internship.internshipID, internship.title)} className="btn-retro-danger-sm">
                    <Trash2 className="h-3.5 w-3.5"/>Close
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Internship Modal */}
      {showCreateModal && (
        <div className="retro-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowCreateModal(false)}}>
          <div className="retro-modal" style={{maxWidth:'580px'}}>
            <div className="p-6 border-b" style={{borderColor:'rgba(0,243,255,0.15)'}}>
              <div className="flex items-center justify-between">
                <h2 className="font-['Orbitron'] text-sm tracking-widest text-white">// POST NEW INTERNSHIP</h2>
                <button onClick={()=>setShowCreateModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(0,243,255,0.5)'}}>
                  <X className="h-5 w-5"/>
                </button>
              </div>
            </div>
            <form onSubmit={handleCreateInternship} className="p-6 space-y-4">
              {[['title','Internship Title','text','e.g. Frontend Developer Intern'],['location','Location','text','e.g. Remote / Cape Town']].map(([name,label,type,ph])=>(
                <div key={name}>
                  <label className="retro-label">{label} *</label>
                  <input type={type} name={name} value={formData[name]} onChange={e=>setFormData({...formData,[e.target.name]:e.target.value})} placeholder={ph} className="retro-input" />
                  {formErrors[name] && <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{color:'#ff6666'}}>{formErrors[name]}</p>}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[['startDate','Start Date'],['endDate','End Date']].map(([name,label])=>(
                  <div key={name}>
                    <label className="retro-label">{label} *</label>
                    <input type="date" name={name} value={formData[name]} onChange={e=>setFormData({...formData,[e.target.name]:e.target.value})} className="retro-input" style={{colorScheme:'dark'}}/>
                    {formErrors[name] && <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{color:'#ff6666'}}>{formErrors[name]}</p>}
                  </div>
                ))}
              </div>
              <div>
                <label className="retro-label">Description *</label>
                <textarea name="description" value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} placeholder="Describe the internship role..." rows={3} className="retro-input" style={{resize:'vertical'}}/>
                {formErrors.description && <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{color:'#ff6666'}}>{formErrors.description}</p>}
              </div>
              <div>
                <label className="retro-label">Requirements *</label>
                <textarea name="requirements" value={formData.requirements} onChange={e=>setFormData({...formData,requirements:e.target.value})} placeholder="List requirements..." rows={3} className="retro-input" style={{resize:'vertical'}}/>
                {formErrors.requirements && <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{color:'#ff6666'}}>{formErrors.requirements}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setShowCreateModal(false)} className="btn-retro-secondary flex-1 justify-center" style={{fontSize:'0.65rem'}}>Cancel</button>
                <button type="submit" className="btn-retro-primary flex-1 justify-center" style={{borderColor:'var(--neon-purple)',background:'linear-gradient(135deg,#4400aa,#8800cc)',fontSize:'0.65rem'}}>
                  <Zap className="h-3.5 w-3.5"/>Post Internship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {showApplicationsModal && (
        <div className="retro-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowApplicationsModal(false)}}>
          <div className="retro-modal" style={{maxWidth:'640px'}}>
            <div className="p-6 border-b flex items-center justify-between" style={{borderColor:'rgba(0,243,255,0.15)'}}>
              <div>
                <h2 className="font-['Orbitron'] text-sm text-white mb-0.5">// APPLICATIONS</h2>
                <p className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(0,243,255,0.5)'}}>{selectedInternship?.title}</p>
              </div>
              <button onClick={()=>setShowApplicationsModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(0,243,255,0.5)'}}>
                <X className="h-5 w-5"/>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-['Orbitron'] text-xs tracking-widest" style={{color:'rgba(0,243,255,0.3)'}}>NO APPLICATIONS RECEIVED</p>
                </div>
              ) : applications.map(app => (
                <div key={app.applicationID} className="p-4" style={{background:'rgba(0,0,20,0.6)',border:'1px solid rgba(0,243,255,0.12)'}}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-['Orbitron'] text-xs text-white">{app.student?.name || `${app.student?.firstName} ${app.student?.lastName}` || 'Student'}</p>
                      <p className="font-['Share_Tech_Mono'] text-xs mt-0.5" style={{color:'rgba(0,243,255,0.4)'}}>{app.student?.email}</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                  <p className="font-['Share_Tech_Mono'] text-xs mb-3" style={{color:'rgba(100,120,140,0.6)'}}>
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                  {app.status === 'Pending' && (
                    <div className="flex flex-wrap gap-2">
                      <button onClick={()=>handleStatusUpdate(app.applicationID,'Accepted')} className="btn-retro-green-sm"><CheckCircle className="h-3 w-3"/>Accept</button>
                      <button onClick={()=>handleStatusUpdate(app.applicationID,'Rejected')} className="btn-retro-danger-sm"><XCircle className="h-3 w-3"/>Reject</button>
                      {app.resumePath && <button onClick={()=>handleDownloadResume(app.applicationID, app.student?.name||'Student')} className="btn-retro-sm"><Download className="h-3 w-3"/>Resume</button>}
                      <button onClick={()=>handleBanStudent(app.studentID, app.student?.name||'Student')} className="btn-retro-danger-sm"><Ban className="h-3 w-3"/>Ban</button>
                    </div>
                  )}
                  {app.status !== 'Pending' && app.resumePath && (
                    <button onClick={()=>handleDownloadResume(app.applicationID, app.student?.name||'Student')} className="btn-retro-sm"><Download className="h-3 w-3"/>Download Resume</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Banned Students Modal */}
      {showBannedStudentsModal && (
        <div className="retro-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowBannedStudentsModal(false)}}>
          <div className="retro-modal" style={{maxWidth:'520px'}}>
            <div className="p-6 border-b flex items-center justify-between" style={{borderColor:'rgba(255,80,80,0.2)'}}>
              <h2 className="font-['Orbitron'] text-sm text-white">// BANNED STUDENTS</h2>
              <button onClick={()=>setShowBannedStudentsModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,80,80,0.5)'}}>
                <X className="h-5 w-5"/>
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {bannedStudents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-['Orbitron'] text-xs tracking-widest" style={{color:'rgba(0,243,255,0.3)'}}>NO BANNED STUDENTS</p>
                </div>
              ) : bannedStudents.map((s,i) => (
                <div key={i} className="flex items-center justify-between p-4" style={{background:'rgba(20,0,0,0.6)',border:'1px solid rgba(255,80,80,0.15)'}}>
                  <div>
                    <p className="font-['Orbitron'] text-xs text-white">{s.name}</p>
                    <p className="font-['Share_Tech_Mono'] text-xs mt-0.5" style={{color:'rgba(255,80,80,0.5)'}}>{s.email}</p>
                  </div>
                  <button onClick={()=>handleUnbanStudent(s.studentID||s.id, s.name)} className="btn-retro-green-sm"><CheckCircle className="h-3 w-3"/>Unban</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}