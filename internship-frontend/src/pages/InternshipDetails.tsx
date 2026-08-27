import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { internshipAPI, applicationAPI } from '../services/api';
import { ArrowLeft, MapPin, Calendar, Briefcase, Building2, CheckCircle, Upload, X, Clock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useParallax } from '../motion/useParallax';
import { registerGsapPlugins, ScrollTrigger } from '../motion/gsapSetup';
import { prefersReducedMotion } from '../motion/reducedMotion';
import StickyReveal from '../motion/StickyReveal';
import DrawTimelineBar from '../motion/DrawTimelineBar';
import DropZone from '../motion/DropZone';
import SuccessPulse from '../motion/SuccessPulse';
import AnimatedModal from '../motion/AnimatedModal';

registerGsapPlugins();

interface Internship {
  internshipID: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  startDate: string;
  endDate: string;
  companyName: string;
  duration?: string;
}

interface Application {
  applicationID: number;
  internshipID: number;
  status: string;
}

/**
 * Hero Panel is split into its own component so `useParallax`'s ref
 * attaches on ITS OWN first mount. useParallax's effect only runs once
 * (deps=[speed], fixed) — if it lived directly in InternshipDetails, that
 * one-shot effect would fire during the initial `loading` render, when
 * this JSX (and therefore the ref's DOM node) doesn't exist yet, and the
 * effect would never re-run once the real content mounts. Mounting this
 * component only after `internship` has loaded guarantees the ref is
 * already attached when useParallax's effect fires for the first time.
 */
function HeroPanel({ internship }: { internship: Internship }) {
  const parallaxRef = useParallax<HTMLDivElement>(0.25);

  return (
    <div className="retro-panel mb-6 overflow-hidden animate-fade-in-up">
      <div className="p-8 md:p-12 relative">
        <div
          ref={parallaxRef}
          style={{
            position: 'absolute',
            top: '-40%',
            left: 0,
            right: 0,
            height: '155%',
            background: 'linear-gradient(135deg, rgba(0,60,150,0.3) 0%, rgba(80,0,150,0.3) 100%)',
            pointerEvents: 'none',
          }}
        />
        <div className="absolute inset-0 grid-bg opacity-20" style={{ pointerEvents: 'none' }} />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1">
              <div className="section-tag" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
                <span style={{ marginLeft: '0.25rem' }}>Internship Listing</span>
              </div>
              <h1 className="font-['Orbitron'] font-black text-3xl md:text-4xl text-white mb-4 leading-tight">
                {internship.title}
              </h1>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-8 h-8 flex items-center justify-center border"
                  style={{ background: 'rgba(0,243,255,0.08)', borderColor: 'rgba(0,243,255,0.25)' }}
                >
                  <Building2 className="h-4 w-4" style={{ color: 'var(--neon-cyan)' }} />
                </div>
                <span className="font-['Orbitron'] text-base" style={{ color: 'var(--neon-cyan)' }}>
                  {internship.companyName}
                </span>
              </div>
            </div>
            <div
              className="hidden md:flex w-16 h-16 items-center justify-center border flex-shrink-0"
              style={{ background: 'rgba(0,243,255,0.05)', borderColor: 'rgba(0,243,255,0.2)' }}
            >
              <Briefcase className="h-8 w-8" style={{ color: 'rgba(0,243,255,0.4)' }} />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 font-['Share_Tech_Mono'] text-sm" style={{ color: 'rgba(0,243,255,0.6)' }}>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {internship.location}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(internship.startDate).toLocaleDateString()} — {new Date(internship.endDate).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {internship.duration || 'Full-time'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The page's back-to-dashboard bar. Held at the top of the viewport with a
 * GSAP `ScrollTrigger` pin rather than CSS `position: sticky`: the app is
 * wrapped in ScrollSmoother globally (see `App.tsx`), which simulates
 * scrolling by transforming `#smooth-content` instead of natively scrolling
 * an ancestor — so native sticky inside it has nothing to stick against and
 * silently does nothing. GSAP's ScrollSmoother docs name `pin: true` as the
 * replacement, which is what this uses. `end: "max"` keeps it pinned for the
 * whole remaining page, and `pinSpacing: false` reproduces sticky's layout:
 * the bar keeps its own space in flow and the page scrolls underneath it.
 *
 * Split into its own component (like `HeroPanel` above) so its one-shot
 * `useGSAP` runs on ITS first mount — the parent renders a `loading` early
 * return first, so an effect living up there would fire with the bar's DOM
 * node not yet in the document and never wire the pin up.
 *
 * Under reduced motion no smoother is created at all, so the page scrolls
 * natively and plain CSS sticky works — that path falls back to it and runs
 * no GSAP.
 */
function PinnedTopBar({ onBack }: { onBack: () => void }) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const reduced = prefersReducedMotion();

  useGSAP(
    () => {
      if (!barRef.current || reduced) return;
      ScrollTrigger.create({
        trigger: barRef.current,
        start: 'top top',
        end: 'max',
        pin: barRef.current,
        pinSpacing: false,
        invalidateOnRefresh: true,
      });
    },
    { scope: barRef, dependencies: [] }
  );

  return (
    <div
      ref={barRef}
      className="border-b"
      style={{
        position: reduced ? 'sticky' : 'relative',
        top: 0,
        zIndex: 50,
        background: 'rgba(5,5,20,0.95)',
        borderColor: 'rgba(0,243,255,0.15)',
        backdropFilter: 'blur(16px)'
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 transition-colors"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.6rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(0,243,255,0.5)',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

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
      setApplied(res.data.some((a: Application) => a.internshipID === parseInt(id as string)));
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
      <AnimatedModal isOpen={showApplyModal} onClose={closeModal} maxWidth="480px" ariaLabel="Submit application">
        <div
          className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: 'rgba(0,243,255,0.15)' }}
        >
          <h2 className="font-['Orbitron'] text-sm text-white">// SUBMIT APPLICATION</h2>
          <button
            onClick={closeModal}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,243,255,0.5)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="p-4 mb-5" style={{ background: 'rgba(0,0,20,0.6)', border: '1px solid rgba(0,243,255,0.1)' }}>
            <p className="font-['Orbitron'] text-xs text-white">{internship.title}</p>
            <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{ color: 'rgba(0,243,255,0.4)' }}>
              {internship.companyName}
            </p>
          </div>

          <label className="retro-label">Resume (PDF, max 5MB) *</label>
          <div className="mb-5">
            <DropZone onFileSelect={validateAndSetFile} selectedFile={resumeFile} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={closeModal}
              className="btn-retro-secondary flex-1 justify-center"
              style={{ fontSize: '0.65rem' }}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!resumeFile || applying}
              className="btn-retro-primary flex-1 justify-center"
              style={{ fontSize: '0.65rem', opacity: (!resumeFile || applying) ? 0.5 : 1 }}
            >
              {applying ? (
                <>
                  <div className="retro-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                  Submitting...
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5" />
                  Submit
                </>
              )}
            </button>
          </div>
        </div>
      </AnimatedModal>
    </main>
  );
}