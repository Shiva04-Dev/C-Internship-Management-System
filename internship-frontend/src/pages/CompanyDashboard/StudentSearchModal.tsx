import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { X, Search, GraduationCap, BookOpen, Download, User } from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedModal from '../../motion/AnimatedModal';
import GlowInput from '../../motion/GlowInput';
import { staggerContainer, staggerItem } from '../../motion/staggerVariants';
import { companyAPI } from '../../services/api';
import { SearchStudent } from './types';

interface StudentSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentSearchModal({ isOpen, onClose }: StudentSearchModalProps) {
  const [university, setUniversity] = useState('');
  const [degree, setDegree] = useState('');
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState<SearchStudent[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      const res = await companyAPI.searchStudents({ university, degree, query });
      setStudents(res.data);
      setSearched(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to search students');
    } finally {
      setSearching(false);
    }
  };

  const handleDownload = async (studentId: number, name: string) => {
    try {
      const res = await companyAPI.downloadStudentResume(studentId);
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
    } catch {
      toast.error('Failed to download resume');
    }
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} maxWidth="640px" ariaLabel="Search students">
      <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,243,255,0.15)' }}>
        <h2 className="font-['Orbitron'] text-sm text-white">// SEARCH STUDENTS</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,243,255,0.5)' }}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSearch} className="p-6 border-b" style={{ borderColor: 'rgba(0,243,255,0.1)' }}>
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          <GlowInput
            placeholder="University"
            value={university}
            onChange={e => setUniversity(e.target.value)}
            icon={<GraduationCap className="h-4 w-4" />}
          />
          <GlowInput
            placeholder="Degree"
            value={degree}
            onChange={e => setDegree(e.target.value)}
            icon={<BookOpen className="h-4 w-4" />}
          />
          <GlowInput
            placeholder="Name"
            value={query}
            onChange={e => setQuery(e.target.value)}
            icon={<User className="h-4 w-4" />}
          />
        </div>
        <button type="submit" disabled={searching} className="btn-retro-primary" style={{ opacity: searching ? 0.5 : 1 }}>
          <Search className="h-3.5 w-3.5" />
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      <motion.div
        key={students.length}
        className="p-6 space-y-3 max-h-[50vh] overflow-y-auto"
        variants={staggerContainer()}
        initial="hidden"
        animate="show"
      >
        {!searched ? (
          <div className="text-center py-8">
            <p className="font-['Orbitron'] text-xs tracking-widest" style={{ color: 'rgba(0,243,255,0.3)' }}>
              SEARCH FOR DISCOVERABLE STUDENTS
            </p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-['Orbitron'] text-xs tracking-widest" style={{ color: 'rgba(0,243,255,0.3)' }}>
              NO MATCHING STUDENTS FOUND
            </p>
          </div>
        ) : (
          students.map(s => (
            <motion.div
              key={s.studentID}
              variants={staggerItem()}
              className="flex items-center justify-between p-4"
              style={{ background: 'rgba(0,0,20,0.6)', border: '1px solid rgba(0,243,255,0.12)' }}
            >
              <div>
                <p className="font-['Orbitron'] text-xs text-white">{s.firstName} {s.lastName}</p>
                <p className="font-['Share_Tech_Mono'] text-xs mt-0.5" style={{ color: 'rgba(0,243,255,0.5)' }}>{s.email}</p>
                {(s.university || s.degree) && (
                  <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{ color: 'rgba(100,120,140,0.6)' }}>
                    {s.university}{s.university && s.degree ? ' - ' : ''}{s.degree}
                  </p>
                )}
              </div>
              {s.hasResume && (
                <button onClick={() => handleDownload(s.studentID, `${s.firstName}_${s.lastName}`)} className="btn-retro-sm">
                  <Download className="h-3 w-3" />
                  Resume
                </button>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </AnimatedModal>
  );
}
