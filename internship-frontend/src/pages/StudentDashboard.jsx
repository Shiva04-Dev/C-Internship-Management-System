import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { internshipAPI, applicationAPI } from '../services/api';
import { Briefcase, LogOut, Search, MapPin, Calendar, Building2, FileText, CheckCircle, Clock, XCircle, Loader2, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async (showToast = false) => {
    setLoading(true);
    try {
      const [inRes, appRes] = await Promise.all([internshipAPI.getAll({ title: searchTerm, location: locationFilter }), applicationAPI.getMine()]);
      setInternships(inRes.data);
      setApplications(appRes.data);
      if (showToast) toast.success('Data refreshed');
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => { setRefreshing(true); loadData(true); };
  const handleLogout = async () => {
    if (window.confirm('Terminate session?')) { await logout(); navigate('/'); }
  };
  const handleApply = (id) => navigate(`/internship/${id}`);

  const getStatusBadge = (status) => {
    const classes = { Pending: 'badge-pending', Accepted: 'badge-accepted', Rejected: 'badge-rejected', Withdrawn: 'badge-withdrawn' };
    const icons = { Pending: <Clock className="h-3 w-3" />, Accepted: <CheckCircle className="h-3 w-3" />, Rejected: <XCircle className="h-3 w-3" />, Withdrawn: <XCircle className="h-3 w-3" /> };
    return <span className={classes[status] || 'badge-withdrawn'}>{icons[status]}{status}</span>;
  };

  const filtered = internships.filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase()) && (locationFilter===''||i.location.toLowerCase().includes(locationFilter.toLowerCase())));

  const stats = [
    { label: 'Applications', value: applications.length, color: 'var(--neon-cyan)' },
    { label: 'Pending', value: applications.filter(a=>a.status==='Pending').length, color: 'var(--neon-orange)' },
    { label: 'Accepted', value: applications.filter(a=>a.status==='Accepted').length, color: '#00ff78' },
    { label: 'Available', value: internships.length, color: 'var(--neon-purple)' },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4" style={{background:'#050510'}}>
      <div className="retro-spinner" style={{width:'48px',height:'48px'}} />
      <p className="font-['Orbitron'] text-xs tracking-widest" style={{color:'rgba(0,243,255,0.5)'}}>LOADING SYSTEM DATA...</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{background:'#050510'}}>
      <Toaster position="top-right" toastOptions={{style:{background:'#080820',border:'1px solid rgba(0,243,255,0.3)',color:'#d0d8e8',fontFamily:'Share Tech Mono, monospace',fontSize:'0.8rem'}}} />

      {/* Navbar */}
      <header className="retro-navbar">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border flex items-center justify-center" style={{background:'rgba(0,243,255,0.05)',borderColor:'rgba(0,243,255,0.3)'}}>
              <Briefcase className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <div className="font-['Orbitron'] font-black text-base tracking-widest text-white">IMS</div>
              <div className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(0,243,255,0.5)',letterSpacing:'0.08em'}}>Student Terminal</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} disabled={refreshing} className="w-9 h-9 flex items-center justify-center border transition-colors" style={{background:'rgba(0,243,255,0.03)',borderColor:'rgba(0,243,255,0.2)',cursor:'pointer'}}>
              <RefreshCw className={`h-4 w-4 text-cyan-400 ${refreshing?'animate-spin':''}`} />
            </button>
            <button onClick={handleLogout} className="btn-retro-danger-sm">
              <LogOut className="h-3.5 w-3.5" />Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        {/* Welcome */}
        <div className="mb-8 animate-fade-in-up">
          <div className="section-tag" style={{display:'inline-flex'}}>
            <span style={{marginLeft:'0.25rem'}}>Student Portal</span>
          </div>
          <h2 className="text-3xl md:text-4xl text-white mb-1">Welcome back, <span style={{color:'var(--neon-cyan)'}} className="text-glow-cyan">{user?.name}</span></h2>
          <p className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(0,243,255,0.4)',letterSpacing:'0.08em'}}>Discover your next opportunity in the network</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="stat-card" style={{animationDelay:`${i*0.1}s`}}>
              <div className="font-['Orbitron'] font-black text-3xl mb-1" style={{color:s.color}}>{s.value}</div>
              <div className="font-['Orbitron'] text-xs tracking-widest uppercase" style={{color:'rgba(160,180,200,0.5)'}}>{s.label}</div>
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{background:s.color, boxShadow:`0 0 6px ${s.color}`, opacity:0.7}} />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          {['browse','applications'].map(tab => (
            <button key={tab} onClick={()=>setActiveTab(tab)}
              className={activeTab===tab?'retro-tab-active':'retro-tab-inactive'}>
              {tab==='browse'?'Browse Internships':'My Applications'}
            </button>
          ))}
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:'rgba(0,243,255,0.4)'}} />
                <input type="text" placeholder="Search internships..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="retro-input" style={{paddingLeft:'2.5rem'}} />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:'rgba(0,243,255,0.4)'}} />
                <input type="text" placeholder="Filter by location..." value={locationFilter} onChange={e=>setLocationFilter(e.target.value)} className="retro-input" style={{paddingLeft:'2.5rem'}} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {filtered.length === 0 ? (
                <div className="col-span-2 text-center py-16">
                  <Briefcase className="h-12 w-12 mx-auto mb-4" style={{color:'rgba(0,243,255,0.15)'}} />
                  <p className="font-['Orbitron'] text-xs tracking-widest" style={{color:'rgba(0,243,255,0.3)'}}>NO INTERNSHIPS FOUND IN DATABASE</p>
                </div>
              ) : filtered.map(internship => (
                <div key={internship.internshipID} className="internship-card group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center border flex-shrink-0" style={{background:'rgba(0,80,160,0.2)',borderColor:'rgba(0,243,255,0.25)'}}>
                        <Building2 className="h-5 w-5" style={{color:'var(--neon-cyan)'}} />
                      </div>
                      <div>
                        <h3 className="font-['Orbitron'] text-sm text-white mb-0.5">{internship.title}</h3>
                        <p className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(0,243,255,0.5)'}}>{internship.companyName}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mb-4 leading-relaxed line-clamp-2" style={{color:'rgba(160,180,210,0.65)',fontFamily:'Rajdhani, sans-serif'}}>{internship.description}</p>
                  <div className="flex items-center gap-2 mb-4 font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(0,243,255,0.4)'}}>
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    {internship.location}
                  </div>
                  <button onClick={()=>handleApply(internship.internshipID)} className="btn-retro-sm w-full justify-center" style={{clipPath:'none',width:'100%'}}>
                    <span>View Details</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-12 w-12 mx-auto mb-4" style={{color:'rgba(0,243,255,0.15)'}} />
                <p className="font-['Orbitron'] text-xs tracking-widest mb-6" style={{color:'rgba(0,243,255,0.3)'}}>NO APPLICATIONS LOGGED</p>
                <button onClick={()=>setActiveTab('browse')} className="btn-retro-sm">Browse Internships</button>
              </div>
            ) : applications.map(app => (
              <div key={app.applicationID} className="internship-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-['Orbitron'] text-sm text-white mb-0.5">{app.internship?.title || 'Internship'}</h3>
                    <p className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(0,243,255,0.5)'}}>{app.internship?.companyName || 'Company'}</p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
                <div className="flex items-center gap-2 font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(100,120,140,0.6)'}}>
                  <Calendar className="h-3.5 w-3.5" />
                  Applied: {new Date(app.appliedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}