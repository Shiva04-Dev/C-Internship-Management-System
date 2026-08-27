import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { internshipAPI, applicationAPI } from '../../services/api';
import { Briefcase, CheckCircle, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import StickyReveal from '../../motion/StickyReveal';
import DrawTimelineBar from '../../motion/DrawTimelineBar';
import SuccessPulse from '../../motion/SuccessPulse';
import HeroPanel from './HeroPanel';
import PinnedTopBar from './PinnedTopBar';
import ApplyModal from './ApplyModal';
import { Internship, Application } from './types';

export default function InternshipDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [pulseTrigger, setPulseTrigger] = useState(0);

  useEffect(() => {
    loadInternship();
    checkIfApplied();
  }, [id]);

  const loadInternship = async () => {
    setLoading(true);
    try {
      const res = await internshipAPI.getById(id as string);
      setInternship(res.data);
    } catch {
      toast.error('Failed to load internship details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const res = await applicationAPI.getMine();
      setApplied(res.data.some((a: Application) => a.internship?.internshipID === parseInt(id as string)));
    } catch {
      // Silently fail
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    setResumeFile(file);
    toast.success('Resume selected');
  };

  const handleApply = async () => {
    if (!resumeFile) {
      toast.error('Please upload your resume first');
      return;
    }
    setApplying(true);
    try {
      const fd = new FormData();
      fd.append('internshipID', id as string);
      fd.append('resume', resumeFile);
      await applicationAPI.submitWithResume(fd);
      toast.success('Application submitted!');
      setApplied(true);
      setPulseTrigger(t => t + 1);
      setShowApplyModal(false);
      setTimeout(() => navigate('/student'), 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const closeModal = () => {
    setShowApplyModal(false);
    setResumeFile(null);
  };

  if (loading) {
    return (
      <main id="main" className="min-h-screen flex items-center justify-center flex-col gap-4" style={{ background: '#050510' }}>
        <div className="retro-spinner" style={{ width: '48px', height: '48px' }} />
        <p className="font-['Orbitron'] text-xs tracking-widest" style={{ color: 'rgba(0,243,255,0.5)' }}>
          LOADING INTERNSHIP DATA...
        </p>
      </main>
    );
  }

  if (!internship) {
    return (
      <main id="main" className="min-h-screen flex items-center justify-center" style={{ background: '#050510' }}>
        <div className="text-center">
          <Briefcase className="h-12 w-12 mx-auto mb-4" style={{ color: 'rgba(0,243,255,0.15)' }} />
          <p className="font-['Orbitron'] text-xs tracking-widest mb-6" style={{ color: 'rgba(0,243,255,0.3)' }}>
            INTERNSHIP NOT FOUND
          </p>
          <button onClick={() => navigate('/student')} className="btn-retro-primary">
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="min-h-screen" style={{ background: '#050510' }}>
      {/* Top bar */}
      <PinnedTopBar onBack={() => navigate('/student')} />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero Panel */}
        <HeroPanel internship={internship} />

        {/* Content */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5">
            {/* Description */}
            <div className="retro-panel p-7">
              <h2 className="font-['Orbitron'] text-xs tracking-widest mb-4" style={{ color: 'rgba(0,243,255,0.6)' }}>
                // ABOUT THIS INTERNSHIP
              </h2>
              <p
                className="leading-relaxed"
                style={{ color: 'rgba(190,210,230,0.8)', fontFamily: 'Rajdhani, sans-serif', fontSize: '1.05rem' }}
              >
                {internship.description}
              </p>
            </div>

            {/* Requirements */}
            <div className="retro-panel p-7">
              <h2 className="font-['Orbitron'] text-xs tracking-widest mb-4" style={{ color: 'rgba(0,243,255,0.6)' }}>
                // REQUIREMENTS
              </h2>
              <p
                className="leading-relaxed"
                style={{ color: 'rgba(190,210,230,0.8)', fontFamily: 'Rajdhani, sans-serif', fontSize: '1.05rem' }}
              >
                {internship.requirements}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Timeline */}
            <div className="retro-panel p-6">
              <h3 className="font-['Orbitron'] text-xs tracking-widest mb-4" style={{ color: 'rgba(0,243,255,0.5)' }}>
                // TIMELINE
              </h3>
              <DrawTimelineBar startDate={internship.startDate} endDate={internship.endDate} />
            </div>

            {/* Apply section */}
            <StickyReveal topOffset={72}>
              <div className="retro-panel p-6">
                <h3 className="font-['Orbitron'] text-xs tracking-widest mb-4" style={{ color: 'rgba(0,243,255,0.5)' }}>
                  // ACTION
                </h3>
                {applied ? (
                  <div className="text-center py-4">
                    <div
                      className="relative w-12 h-12 mx-auto mb-3 flex items-center justify-center border"
                      style={{ background: 'rgba(0,200,80,0.1)', borderColor: 'rgba(0,200,80,0.3)' }}
                    >
                      <CheckCircle className="h-6 w-6" style={{ color: '#00cc55' }} />
                      <SuccessPulse trigger={pulseTrigger} color="#00cc55" />
                    </div>
                    <p className="font-['Orbitron'] text-xs tracking-widest text-white mb-1">APPLICATION SUBMITTED</p>
                    <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(0,200,80,0.5)' }}>
                      Check dashboard for updates
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-['Share_Tech_Mono'] text-xs mb-5" style={{ color: 'rgba(160,180,200,0.5)' }}>
                      Submit your application with your resume to get started
                    </p>
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="btn-retro-primary w-full justify-center"
                      style={{ clipPath: 'none', borderRadius: 0 }}
                    >
                      <Upload className="h-4 w-4" />
                      Apply Now
                    </button>
                  </div>
                )}
              </div>
            </StickyReveal>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={showApplyModal}
        onClose={closeModal}
        internship={internship}
        resumeFile={resumeFile}
        onFileSelect={validateAndSetFile}
        applying={applying}
        onApply={handleApply}
      />
    </main>
  );
}
