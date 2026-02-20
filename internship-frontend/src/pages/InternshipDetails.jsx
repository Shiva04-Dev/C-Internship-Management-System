import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { internshipAPI, applicationAPI } from '../services/api';
import { ArrowLeft, MapPin, Calendar, Briefcase, Building2, CheckCircle, Upload, FileText, X, Clock, Zap } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => { loadInternship(); checkIfApplied(); }, [id]);

  const loadInternship = async () => {
    setLoading(true);
    try {
      const res = await internshipAPI.getById(id);
      setInternship(res.data);
    } catch { toast.error('Failed to load internship details'); }
    finally { setLoading(false); }
  };

  const checkIfApplied = async () => {
    try {
      const res = await applicationAPI.getMine();
      setApplied(res.data.some(a => a.internshipID === parseInt(id)));
    } catch {}
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return; }
    if (file.size > 5*1024*1024) { toast.error('File must be under 5MB'); return; }
    setResumeFile(file);
    toast.success('Resume selected');
  };

  const handleApply = async () => {
    if (!resumeFile) { toast.error('Please upload your resume first'); return; }
    setApplying(true);
    try {
      const fd = new FormData();
      fd.append('internshipID', parseInt(id));
      fd.append('resume', resumeFile);
      await applicationAPI.submitWithResume(fd);
      toast.success('Application submitted!');
      setApplied(true);
      setShowApplyModal(false);
      setTimeout(() => navigate('/student'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally { setApplying(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4" style={{background:'#050510'}}>
      <div className="retro-spinner" style={{width:'48px',height:'48px'}} />
      <p className="font-['Orbitron'] text-xs tracking-widest" style={{color:'rgba(0,243,255,0.5)'}}>LOADING INTERNSHIP DATA...</p>
    </div>
  );

  if (!internship) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#050510'}}>
      <div className="text-center">
        <Briefcase className="h-12 w-12 mx-auto mb-4" style={{color:'rgba(0,243,255,0.15)'}} />
        <p className="font-['Orbitron'] text-xs tracking-widest mb-6" style={{color:'rgba(0,243,255,0.3)'}}>INTERNSHIP NOT FOUND</p>
        <button onClick={()=>navigate('/student')} className="btn-retro-primary">Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{background:'#050510'}}>
      <Toaster position="top-right" toastOptions={{style:{background:'#080820',border:'1px solid rgba(0,243,255,0.3)',color:'#d0d8e8',fontFamily:'Share Tech Mono, monospace'}}} />

      {/* Top bar */}
      <div className="border-b sticky top-0 z-50" style={{background:'rgba(5,5,20,0.95)',borderColor:'rgba(0,243,255,0.15)',backdropFilter:'blur(16px)'}}>
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button onClick={()=>navigate('/student')} className="inline-flex items-center gap-2 transition-colors" style={{fontFamily:'Orbitron, sans-serif', fontSize:'0.6rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(0,243,255,0.5)', background:'none', border:'none', cursor:'pointer'}}>
            <ArrowLeft className="h-4 w-4"/>Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero Panel */}
        <div className="retro-panel mb-6 overflow-hidden animate-fade-in-up">
          <div className="p-8 md:p-12 relative" style={{background:'linear-gradient(135deg, rgba(0,60,150,0.3) 0%, rgba(80,0,150,0.3) 100%)'}}>
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-5">
                <div className="flex-1">
                  <div className="section-tag" style={{display:'inline-flex', marginBottom:'1rem'}}>
                    <span style={{marginLeft:'0.25rem'}}>Internship Listing</span>
                  </div>
                  <h1 className="font-['Orbitron'] font-black text-3xl md:text-4xl text-white mb-4 leading-tight">{internship.title}</h1>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 flex items-center justify-center border" style={{background:'rgba(0,243,255,0.08)',borderColor:'rgba(0,243,255,0.25)'}}>
                      <Building2 className="h-4 w-4" style={{color:'var(--neon-cyan)'}} />
                    </div>
                    <span className="font-['Orbitron'] text-base" style={{color:'var(--neon-cyan)'}}>{internship.companyName}</span>
                  </div>
                </div>
                <div className="hidden md:flex w-16 h-16 items-center justify-center border flex-shrink-0" style={{background:'rgba(0,243,255,0.05)',borderColor:'rgba(0,243,255,0.2)'}}>
                  <Briefcase className="h-8 w-8" style={{color:'rgba(0,243,255,0.4)'}} />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 font-['Share_Tech_Mono'] text-sm" style={{color:'rgba(0,243,255,0.6)'}}>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4"/>{internship.location}</div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4"/>{new Date(internship.startDate).toLocaleDateString()} — {new Date(internship.endDate).toLocaleDateString()}</div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4"/>{internship.duration || 'Full-time'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5">
            {/* Description */}
            <div className="retro-panel p-7">
              <h2 className="font-['Orbitron'] text-xs tracking-widest mb-4" style={{color:'rgba(0,243,255,0.6)'}}>// ABOUT THIS INTERNSHIP</h2>
              <p className="leading-relaxed" style={{color:'rgba(190,210,230,0.8)', fontFamily:'Rajdhani, sans-serif', fontSize:'1.05rem'}}>{internship.description}</p>
            </div>

            {/* Requirements */}
            <div className="retro-panel p-7">
              <h2 className="font-['Orbitron'] text-xs tracking-widest mb-4" style={{color:'rgba(0,243,255,0.6)'}}>// REQUIREMENTS</h2>
              <p className="leading-relaxed" style={{color:'rgba(190,210,230,0.8)', fontFamily:'Rajdhani, sans-serif', fontSize:'1.05rem'}}>{internship.requirements}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Timeline */}
            <div className="retro-panel p-6">
              <h3 className="font-['Orbitron'] text-xs tracking-widest mb-4" style={{color:'rgba(0,243,255,0.5)'}}>// TIMELINE</h3>
              <div className="space-y-4">
                {[['Start Date', internship.startDate], ['End Date', internship.endDate]].map(([label, date]) => (
                  <div key={label} className="p-3" style={{background:'rgba(0,0,20,0.5)', border:'1px solid rgba(0,243,255,0.1)'}}>
                    <p className="font-['Orbitron'] text-xs mb-1" style={{color:'rgba(0,243,255,0.4)', letterSpacing:'0.1em'}}>{label.toUpperCase()}</p>
                    <p className="font-['Share_Tech_Mono'] text-sm text-white">{new Date(date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply section */}
            <div className="retro-panel p-6">
              <h3 className="font-['Orbitron'] text-xs tracking-widest mb-4" style={{color:'rgba(0,243,255,0.5)'}}>// ACTION</h3>
              {applied ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center border" style={{background:'rgba(0,200,80,0.1)',borderColor:'rgba(0,200,80,0.3)'}}>
                    <CheckCircle className="h-6 w-6" style={{color:'#00cc55'}} />
                  </div>
                  <p className="font-['Orbitron'] text-xs tracking-widest text-white mb-1">APPLICATION SUBMITTED</p>
                  <p className="font-['Share_Tech_Mono'] text-xs" style={{color:'rgba(0,200,80,0.5)'}}>Check dashboard for updates</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-['Share_Tech_Mono'] text-xs mb-5" style={{color:'rgba(160,180,200,0.5)'}}>Submit your application with your resume to get started</p>
                  <button onClick={()=>setShowApplyModal(true)} className="btn-retro-primary w-full justify-center" style={{clipPath:'none',borderRadius:0}}>
                    <Upload className="h-4 w-4"/>Apply Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="retro-modal-overlay" onClick={e=>{if(e.target===e.currentTarget){setShowApplyModal(false);setResumeFile(null);}}}>
          <div className="retro-modal" style={{maxWidth:'480px'}}>
            <div className="p-6 border-b flex items-center justify-between" style={{borderColor:'rgba(0,243,255,0.15)'}}>
              <h2 className="font-['Orbitron'] text-sm text-white">// SUBMIT APPLICATION</h2>
              <button onClick={()=>{setShowApplyModal(false);setResumeFile(null);}} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(0,243,255,0.5)'}}>
                <X className="h-5 w-5"/>
              </button>
            </div>
            <div className="p-6">
              <div className="p-4 mb-5" style={{background:'rgba(0,0,20,0.6)',border:'1px solid rgba(0,243,255,0.1)'}}>
                <p className="font-['Orbitron'] text-xs text-white">{internship.title}</p>
                <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{color:'rgba(0,243,255,0.4)'}}>{internship.companyName}</p>
              </div>

              <label className="retro-label">Resume (PDF, max 5MB) *</label>
              <div className="relative mb-5 p-8 text-center" style={{border:'2px dashed rgba(0,243,255,0.2)',cursor:'pointer',transition:'border-color 0.2s',background:'rgba(0,243,255,0.02)'}}
                   onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,243,255,0.4)'}
                   onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(0,243,255,0.2)'}>
                <input type="file" accept=".pdf" onChange={handleFileSelect} style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:0,cursor:'pointer'}} />
                {resumeFile ? (
                  <>
                    <FileText className="h-10 w-10 mx-auto mb-3" style={{color:'#00cc66'}} />
                    <p className="font-['Share_Tech_Mono'] text-sm" style={{color:'#00cc66'}}>{resumeFile.name}</p>
                    <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{color:'rgba(100,120,140,0.5)'}}>Click to change</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto mb-3" style={{color:'rgba(0,243,255,0.3)'}} />
                    <p className="font-['Orbitron'] text-xs text-white tracking-widest">UPLOAD RESUME</p>
                    <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{color:'rgba(100,120,140,0.5)'}}>PDF only, up to 5MB</p>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={()=>{setShowApplyModal(false);setResumeFile(null);}} className="btn-retro-secondary flex-1 justify-center" style={{fontSize:'0.65rem'}}>Cancel</button>
                <button onClick={handleApply} disabled={!resumeFile||applying} className="btn-retro-primary flex-1 justify-center" style={{fontSize:'0.65rem',opacity:(!resumeFile||applying)?0.5:1}}>
                  {applying ? <><div className="retro-spinner" style={{width:'14px',height:'14px',borderWidth:'2px'}} />Submitting...</> : <><Zap className="h-3.5 w-3.5"/>Submit</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}