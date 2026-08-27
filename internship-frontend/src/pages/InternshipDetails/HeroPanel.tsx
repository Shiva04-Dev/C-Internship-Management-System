import { MapPin, Calendar, Briefcase, Building2, Clock } from 'lucide-react';
import { useParallax } from '../../motion/useParallax';
import { Internship } from './types';

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
export default function HeroPanel({ internship }: { internship: Internship }) {
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
