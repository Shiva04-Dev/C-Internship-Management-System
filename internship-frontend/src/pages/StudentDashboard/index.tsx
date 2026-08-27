import { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { internshipAPI, applicationAPI } from '../../services/api';
import { Briefcase, LogOut, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCounter from '../../motion/StatCounter';
import FixedNavbar from '../../motion/FixedNavbar';
import BrowseTab from './BrowseTab';
import ApplicationsTab from './ApplicationsTab';
import InsightsSection from './InsightsSection';
import { Internship, Application } from './types';

type TabType = 'browse' | 'applications';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
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
      const [inRes, appRes] = await Promise.all([
        internshipAPI.getAll({ title: searchTerm, location: locationFilter }),
        applicationAPI.getMine()
      ]);
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

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleLogout = async () => {
    if (window.confirm('Terminate session?')) {
      await logout();
      navigate('/');
    }
  };

  const handleApply = (id: number) => navigate(`/internship/${id}`);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleLocationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocationFilter(e.target.value);
  };

  const filtered = internships.filter(
    i =>
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (locationFilter === '' || i.location.toLowerCase().includes(locationFilter.toLowerCase()))
  );

  const stats = [
    { label: 'Applications', value: applications.length, color: 'var(--neon-cyan)' },
    { label: 'Pending', value: applications.filter(a => a.status === 'Pending').length, color: 'var(--neon-orange)' },
    { label: 'Accepted', value: applications.filter(a => a.status === 'Accepted').length, color: '#00ff78' },
    { label: 'Available', value: internships.length, color: 'var(--neon-purple)' }
  ];

  if (loading) {
    return (
      <main id="main" className="min-h-screen flex items-center justify-center flex-col gap-4" style={{ background: '#050510' }}>
        <div className="retro-spinner" style={{ width: '48px', height: '48px' }} />
        <p className="font-['Orbitron'] text-xs tracking-widest" style={{ color: 'rgba(0,243,255,0.5)' }}>
          LOADING SYSTEM DATA...
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      {/* Navbar */}
      <FixedNavbar>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 border flex items-center justify-center"
              style={{ background: 'rgba(0,243,255,0.05)', borderColor: 'rgba(0,243,255,0.3)' }}
            >
              <Briefcase className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <div className="font-['Orbitron'] font-black text-base tracking-widest text-white">IMS</div>
              <div
                className="font-['Share_Tech_Mono'] text-xs"
                style={{ color: 'rgba(0,243,255,0.5)', letterSpacing: '0.08em' }}
              >
                Student Terminal
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-9 h-9 flex items-center justify-center border transition-colors"
              style={{
                background: 'rgba(0,243,255,0.03)',
                borderColor: 'rgba(0,243,255,0.2)',
                cursor: 'pointer'
              }}
            >
              <RefreshCw className={`h-4 w-4 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleLogout} className="btn-retro-danger-sm">
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </FixedNavbar>

      <main id="main" className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        {/* Welcome */}
        <div className="mb-8 animate-fade-in-up">
          <div className="section-tag" style={{ display: 'inline-flex' }}>
            <span style={{ marginLeft: '0.25rem' }}>Student Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl text-white mb-1">
            Welcome back,{' '}
            <span style={{ color: 'var(--neon-cyan)' }} className="text-glow-cyan">
              {user?.name}
            </span>
          </h1>
          <p
            className="font-['Share_Tech_Mono'] text-xs"
            style={{ color: 'rgba(0,243,255,0.4)', letterSpacing: '0.08em' }}
          >
            Discover your next opportunity in the network
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="font-['Orbitron'] font-black text-3xl mb-1" style={{ color: s.color }}>
                <StatCounter value={s.value} />
              </div>
              <div
                className="font-['Orbitron'] text-xs tracking-widest uppercase"
                style={{ color: 'rgba(160,180,200,0.5)' }}
              >
                {s.label}
              </div>
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full"
                style={{ background: s.color, boxShadow: `0 0 6px ${s.color}`, opacity: 0.7 }}
              />
            </div>
          ))}
        </div>

        <InsightsSection applications={applications} />

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          {(['browse', 'applications'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'retro-tab-active' : 'retro-tab-inactive'}
            >
              {tab === 'browse' ? 'Browse Internships' : 'My Applications'}
            </button>
          ))}
        </div>

        {activeTab === 'browse' && (
          <BrowseTab
            internships={filtered}
            searchTerm={searchTerm}
            locationFilter={locationFilter}
            onSearchChange={handleSearchChange}
            onLocationChange={handleLocationChange}
            onApply={handleApply}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationsTab applications={applications} onBrowseClick={() => setActiveTab('browse')} />
        )}
      </main>
    </div>
  );
}
