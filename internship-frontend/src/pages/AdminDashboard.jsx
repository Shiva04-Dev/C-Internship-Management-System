import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { Briefcase, LogOut, Users, Building2, FileText, Loader2, CheckCircle, Clock, Activity, RefreshCw, Ban, ShieldAlert, ShieldCheck, X, UserX, BarChart3, Shield, Zap } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
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

  const fmt = (v) => {
    if (!v) return 'N/A';
    try { const d=new Date(v); return isNaN(d)?'N/A':d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); } catch { return 'N/A'; }
  };

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async (showToast=false) => {
    setLoading(true);
    try {
      const [dashRes,repRes,studRes,compRes,bannedRes] = await Promise.all([
        adminAPI.getDashboard(), adminAPI.getReports(),
        adminAPI.getStudents({page:1,pageSize:100}), adminAPI.getCompanies({page:1,pageSize:100}),
        adminAPI.getBannedUsers()
      ]);
      setDashboard(dashRes.data); setReports(repRes.data);
      setStudents(studRes.data.students); setCompanies(compRes.data.companies);
      setBannedUsers(bannedRes.data);
      if (showToast) toast.success('Data refreshed');
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const handleRefresh = () => { setRefreshing(true); loadAllData(true); };

  const handleBanUser = async (userId, userType, name) => {
    const reason = prompt(`Why are you banning ${name}?`);
    if (!reason) return;
    try {
      await adminAPI.banUser(userId, userType, reason);
      toast.success(`${name} banned`);
      loadAllData();
    } catch { toast.error('Failed to ban user'); }
  };

  const handleUnbanUser = async (userId, userType, name) => {
    if (!confirm(`Unban ${name}?`)) return;
    try {
      await adminAPI.unbanUser(userId, userType);
      toast.success(`${name} unbanned`);
      loadAllData();
    } catch { toast.error('Failed to unban user'); }
  };

  const handleLogout = async () => {
    if (!confirm('Terminate session?')) return;
    await logout(); navigate('/');
  };

  const openUsersModal = (type) => { setUserModalType(type); setShowUsersModal(true); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4" style={{background:'#050510'}}>
      <div className="retro-spinner" style={{width:'48px',height:'48px'}} />
      <p className="font-['Orbitron'] text-xs tracking-widest" style={{color:'rgba(0,243,255,0.5)'}}>LOADING ADMIN SYSTEM...</p>
    </div>
  );

  const stats = [
    {label:'Total Students',value:dashboard?.stats?.totalStudents||0,color:'var(--neon-cyan)',onClick:()=>openUsersModal('students')},
    {label:'Total Companies',value:dashboard?.stats?.totalCompanies||0,color:'var(--neon-purple)',onClick:()=>openUsersModal('companies')},
    {label:'Active Internships',value:dashboard?.stats?.activeInternships||0,color:'#00ff78'},
    {label:'Total Applications',value:dashboard?.stats?.totalApplications||0,color:'var(--neon-orange)'},
  ];

  return (
    <div className="min-h-screen" style={{background:'#050510'}}>
      <Toaster position="top-right" toastOptions={{style:{background:'#080820',border:'1px solid rgba(0,243,255,0.3)',color:'#d0d8e8',fontFamily:'Share Tech Mono, monospace',fontSize:'0.8rem'}}} />

      {/* Navbar */}
      <header className="retro-navbar">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border flex items-center justify-center" style={{background:'rgba(255,0,153,0.05)',borderColor:'rgba(255,0,153,0.3)'}}>
              <Shield className="h-5 w-5" style={{color:'var(--neon-pink)'}} />
            </div>
            <div>
              <div className="font-['Orbitron'] font-black text-base tracking-widest text-white">IMS</div>
              <div className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(255,0,153,0.5)',letterSpacing:'0.08em'}}>Admin Terminal</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} disabled={refreshing} className="w-9 h-9 flex items-center justify-center border transition-colors" style={{background:'rgba(255,0,153,0.03)',borderColor:'rgba(255,0,153,0.2)',cursor:'pointer'}}>
              <RefreshCw className={`h-4 w-4 ${refreshing?'animate-spin':''}`} style={{color:'var(--neon-pink)'}} />
            </button>
            <button onClick={()=>setShowBannedUsersModal(true)} className="btn-retro-danger-sm" style={{position:'relative'}}>
              <ShieldAlert className="h-3.5 w-3.5"/>Banned
              {bannedUsers.length>0 && <span style={{position:'absolute',top:'-6px',right:'-6px',background:'#ff4444',color:'white',fontFamily:'Orbitron',fontSize:'0.5rem',borderRadius:'50%',width:'14px',height:'14px',display:'flex',alignItems:'center',justifyContent:'center'}}>{bannedUsers.length}</span>}
            </button>
            <button onClick={handleLogout} className="btn-retro-danger-sm"><LogOut className="h-3.5 w-3.5"/>Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        <div className="mb-8 animate-fade-in-up">
          <div className="section-tag" style={{display:'inline-flex',borderColor:'rgba(255,0,153,0.3)',background:'rgba(255,0,153,0.05)',color:'var(--neon-pink)'}}>
            <span style={{marginLeft:'0.25rem'}}>Admin Portal</span>
          </div>
          <h2 className="text-3xl md:text-4xl text-white mb-1">
            System <span style={{color:'var(--neon-pink)'}} className="text-glow-pink">Overview</span>
          </h2>
          <p className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(255,0,153,0.4)',letterSpacing:'0.08em'}}>Monitor and manage the entire platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s,i) => (
            <div key={i} className="stat-card" style={{cursor:s.onClick?'pointer':'default',borderColor:s.onClick?`${s.color}20`:undefined}} onClick={s.onClick}>
              <div className="font-['Orbitron'] font-black text-3xl mb-1" style={{color:s.color}}>{s.value}</div>
              <div className="font-['Orbitron'] text-xs tracking-widest uppercase" style={{color:'rgba(160,180,200,0.5)'}}>{s.label}</div>
              {s.onClick && <div className="font-['Share_Tech_Mono'] text-xs mt-2" style={{color:`${s.color}60`}}>Click to view →</div>}
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{background:s.color,boxShadow:`0 0 6px ${s.color}`,opacity:0.7}} />
            </div>
          ))}
        </div>

        {/* Reports Section */}
        {reports && (
          <div className="mb-8">
            <h3 className="font-['Orbitron'] text-sm tracking-widest mb-4" style={{color:'rgba(0,243,255,0.6)'}}>// SYSTEM REPORTS</h3>
            <div className="grid md:grid-cols-2 gap-5">
              {/* Application Status */}
              <div className="retro-panel p-6">
                <h4 className="font-['Orbitron'] text-xs tracking-widest mb-5" style={{color:'rgba(0,243,255,0.5)'}}>APPLICATION STATUS</h4>
                {[
                  {label:'Pending',value:reports.applicationStats?.pending||0,color:'var(--neon-orange)'},
                  {label:'Accepted',value:reports.applicationStats?.accepted||0,color:'#00ff78'},
                  {label:'Rejected',value:reports.applicationStats?.rejected||0,color:'#ff6666'},
                ].map((r,i)=>(
                  <div key={i} className="flex items-center gap-3 mb-3">
                    <span className="font-['Orbitron'] text-xs w-20" style={{color:'rgba(160,180,200,0.5)'}}>{r.label}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.05)'}}>
                      <div className="h-full rounded-full transition-all duration-500" style={{width:`${Math.min(100,(r.value/(reports.applicationStats?.total||1))*100)}%`,background:r.color,boxShadow:`0 0 8px ${r.color}`}} />
                    </div>
                    <span className="font-['Orbitron'] text-xs w-6 text-right" style={{color:r.color}}>{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Top Companies */}
              <div className="retro-panel p-6">
                <h4 className="font-['Orbitron'] text-xs tracking-widest mb-5" style={{color:'rgba(176,38,255,0.5)'}}>TOP COMPANIES</h4>
                {(reports.topCompanies||[]).slice(0,5).map((c,i)=>(
                  <div key={i} className="flex items-center justify-between mb-2 py-2" style={{borderBottom:'1px solid rgba(0,243,255,0.06)'}}>
                    <div className="flex items-center gap-2">
                      <span className="font-['Orbitron'] text-xs" style={{color:'rgba(0,243,255,0.3)',minWidth:'1.5rem'}}>{i+1}.</span>
                      <span className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(200,220,240,0.7)'}}>{c.companyName||c.name}</span>
                    </div>
                    <span className="font-['Orbitron'] text-xs" style={{color:'var(--neon-purple)'}}>{c.internshipCount||0} listings</span>
                  </div>
                ))}
                {(!reports.topCompanies||reports.topCompanies.length===0) && <p className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(100,120,140,0.4)'}}>No data available</p>}
              </div>
            </div>
          </div>
        )}

        {/* Users Quick View */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Recent Students */}
          <div className="retro-panel p-6">
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-['Orbitron'] text-xs tracking-widest" style={{color:'rgba(0,243,255,0.6)'}}>// RECENT STUDENTS</h4>
              <button onClick={()=>openUsersModal('students')} className="btn-retro-sm" style={{fontSize:'0.5rem',padding:'0.3rem 0.7rem'}}>View All</button>
            </div>
            {students.slice(0,5).map((s,i)=>(
              <div key={i} className="flex items-center justify-between py-2" style={{borderBottom:'1px solid rgba(0,243,255,0.06)'}}>
                <div>
                  <p className="font-['Orbitron'] text-xs text-white" style={{fontSize:'0.65rem'}}>{s.name||`${s.firstName} ${s.lastName}`}</p>
                  <p className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(0,243,255,0.35)',fontSize:'0.6rem'}}>{s.email}</p>
                </div>
                {!s.isBanned && (
                  <button onClick={()=>handleBanUser(s.studentID||s.id,'student',s.name||`${s.firstName} ${s.lastName}`)} className="btn-retro-danger-sm" style={{fontSize:'0.5rem',padding:'0.25rem 0.5rem'}}>
                    <Ban className="h-2.5 w-2.5"/>Ban
                  </button>
                )}
                {s.isBanned && <span className="font-['Orbitron'] text-xs" style={{color:'#ff6666',fontSize:'0.55rem'}}>BANNED</span>}
              </div>
            ))}
            {students.length===0 && <p className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(100,120,140,0.4)'}}>No students found</p>}
          </div>

          {/* Recent Companies */}
          <div className="retro-panel p-6">
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-['Orbitron'] text-xs tracking-widest" style={{color:'rgba(176,38,255,0.6)'}}>// RECENT COMPANIES</h4>
              <button onClick={()=>openUsersModal('companies')} className="btn-retro-sm" style={{fontSize:'0.5rem',padding:'0.3rem 0.7rem',borderColor:'rgba(176,38,255,0.5)',color:'var(--neon-purple)'}}>View All</button>
            </div>
            {companies.slice(0,5).map((c,i)=>(
              <div key={i} className="flex items-center justify-between py-2" style={{borderBottom:'1px solid rgba(176,38,255,0.08)'}}>
                <div>
                  <p className="font-['Orbitron'] text-xs text-white" style={{fontSize:'0.65rem'}}>{c.companyName||c.name}</p>
                  <p className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(176,38,255,0.35)',fontSize:'0.6rem'}}>{c.email}</p>
                </div>
                {!c.isBanned && (
                  <button onClick={()=>handleBanUser(c.companyID||c.id,'company',c.companyName||c.name)} className="btn-retro-danger-sm" style={{fontSize:'0.5rem',padding:'0.25rem 0.5rem'}}>
                    <Ban className="h-2.5 w-2.5"/>Ban
                  </button>
                )}
                {c.isBanned && <span className="font-['Orbitron'] text-xs" style={{color:'#ff6666',fontSize:'0.55rem'}}>BANNED</span>}
              </div>
            ))}
            {companies.length===0 && <p className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(100,120,140,0.4)'}}>No companies found</p>}
          </div>
        </div>
      </div>

      {/* Users Modal */}
      {showUsersModal && (
        <div className="retro-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowUsersModal(false)}}>
          <div className="retro-modal" style={{maxWidth:'640px'}}>
            <div className="p-6 border-b flex items-center justify-between" style={{borderColor:'rgba(0,243,255,0.15)'}}>
              <h2 className="font-['Orbitron'] text-sm text-white">// {userModalType.toUpperCase()}</h2>
              <button onClick={()=>setShowUsersModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(0,243,255,0.5)'}}>
                <X className="h-5 w-5"/>
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {(userModalType==='students'?students:companies).map((u,i)=>(
                <div key={i} className="flex items-center justify-between p-4" style={{background:'rgba(0,0,20,0.6)',border:'1px solid rgba(0,243,255,0.1)'}}>
                  <div>
                    <p className="font-['Orbitron'] text-xs text-white">{userModalType==='students'?(u.name||`${u.firstName} ${u.lastName}`):u.companyName||u.name}</p>
                    <p className="font-['Share_Tech_Mono'] text-xs mt-0.5" style={{color:'rgba(0,243,255,0.4)'}}>{u.email}</p>
                    <p className="font-['Share_Tech_Mono'] text-xs mt-0.5" style={{color:'rgba(100,120,140,0.5)'}}>{u.university||u.website||'—'}</p>
                  </div>
                  {!u.isBanned ? (
                    <button onClick={()=>handleBanUser(u.studentID||u.companyID||u.id, userModalType==='students'?'student':'company', u.name||u.companyName||`${u.firstName} ${u.lastName}`)} className="btn-retro-danger-sm">
                      <Ban className="h-3 w-3"/>Ban
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-['Orbitron'] text-xs" style={{color:'#ff6666',fontSize:'0.55rem'}}>BANNED</span>
                      <button onClick={()=>handleUnbanUser(u.studentID||u.companyID||u.id, userModalType==='students'?'student':'company', u.name||u.companyName||`${u.firstName} ${u.lastName}`)} className="btn-retro-green-sm"><CheckCircle className="h-3 w-3"/>Unban</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Banned Users Modal */}
      {showBannedUsersModal && (
        <div className="retro-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowBannedUsersModal(false)}}>
          <div className="retro-modal" style={{maxWidth:'540px'}}>
            <div className="p-6 border-b flex items-center justify-between" style={{borderColor:'rgba(255,80,80,0.2)'}}>
              <h2 className="font-['Orbitron'] text-sm text-white">// BANNED USERS ({bannedUsers.length})</h2>
              <button onClick={()=>setShowBannedUsersModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,80,80,0.5)'}}>
                <X className="h-5 w-5"/>
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {bannedUsers.length===0 ? (
                <p className="text-center font-['Orbitron'] text-xs tracking-widest py-8" style={{color:'rgba(0,243,255,0.3)'}}>NO BANNED USERS</p>
              ) : bannedUsers.map((u,i)=>(
                <div key={i} className="p-4" style={{background:'rgba(20,0,0,0.6)',border:'1px solid rgba(255,80,80,0.15)'}}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-['Orbitron'] text-xs text-white">{u.name||u.companyName}</p>
                      <p className="font-['Share_Tech_Mono'] text-xs mt-0.5" style={{color:'rgba(255,80,80,0.5)'}}>{u.email} • {u.userType}</p>
                      {u.banReason && <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{color:'rgba(200,180,160,0.5)'}}>Reason: {u.banReason}</p>}
                    </div>
                    <button onClick={()=>handleUnbanUser(u.id||u.studentID||u.companyID, u.userType?.toLowerCase()||'student', u.name||u.companyName)} className="btn-retro-green-sm flex-shrink-0">
                      <CheckCircle className="h-3 w-3"/>Unban
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}