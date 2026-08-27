import { ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Building2, ExternalLink, Briefcase } from 'lucide-react';
import TiltCard from '../../motion/TiltCard';
import { staggerContainer, staggerItem } from '../../motion/staggerVariants';
import { Internship } from './types';

interface BrowseTabProps {
  internships: Internship[];
  searchTerm: string;
  locationFilter: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onLocationChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onApply: (id: number) => void;
}

export default function BrowseTab({
  internships,
  searchTerm,
  locationFilter,
  onSearchChange,
  onLocationChange,
  onApply,
}: BrowseTabProps) {
  return (
    <div>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: 'rgba(0,243,255,0.4)' }}
          />
          <input
            type="text"
            placeholder="Search internships..."
            value={searchTerm}
            onChange={onSearchChange}
            className="retro-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <div className="relative">
          <MapPin
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: 'rgba(0,243,255,0.4)' }}
          />
          <input
            type="text"
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={onLocationChange}
            className="retro-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Keyed on the RESULT COUNT, not the raw filter text. Filtering
          is instant and client-side, so keying on `searchTerm` meant
          this container remounted and replayed the whole stagger
          entrance on every single keystroke — visible flicker while
          typing. Matches the `key={internships.length}` convention
          CompanyDashboard's own grid already uses. */}
      <motion.div
        key={internships.length}
        className="grid md:grid-cols-2 gap-5"
        variants={staggerContainer()}
        initial="hidden"
        animate="show"
      >
        {internships.length === 0 ? (
          <div className="col-span-2 text-center py-16">
            <Briefcase className="h-12 w-12 mx-auto mb-4" style={{ color: 'rgba(0,243,255,0.15)' }} />
            <p
              className="font-['Orbitron'] text-xs tracking-widest"
              style={{ color: 'rgba(0,243,255,0.3)' }}
            >
              NO INTERNSHIPS FOUND IN DATABASE
            </p>
          </div>
        ) : (
          internships.map(internship => (
            <motion.div key={internship.internshipID} variants={staggerItem()}>
            <TiltCard className="internship-card group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center border flex-shrink-0"
                    style={{ background: 'rgba(0,80,160,0.2)', borderColor: 'rgba(0,243,255,0.25)' }}
                  >
                    <Building2 className="h-5 w-5" style={{ color: 'var(--neon-cyan)' }} />
                  </div>
                  <div>
                    <h3 className="font-['Orbitron'] text-sm text-white mb-0.5">{internship.title}</h3>
                    <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(0,243,255,0.5)' }}>
                      {internship.companyName}
                    </p>
                  </div>
                </div>
              </div>
              <p
                className="text-sm mb-4 leading-relaxed line-clamp-2"
                style={{ color: 'rgba(160,180,210,0.65)', fontFamily: 'Rajdhani, sans-serif' }}
              >
                {internship.description}
              </p>
              <div
                className="flex items-center gap-2 mb-4 font-['Share_Tech_Mono'] text-xs"
                style={{ color: 'rgba(0,243,255,0.4)' }}
              >
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                {internship.location}
              </div>
              <button
                onClick={() => onApply(internship.internshipID)}
                className="btn-retro-sm w-full justify-center"
                style={{ clipPath: 'none', width: '100%' }}
              >
                <span>View Details</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </TiltCard>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
