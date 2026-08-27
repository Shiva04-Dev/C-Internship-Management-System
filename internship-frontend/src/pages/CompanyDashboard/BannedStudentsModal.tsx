import { X, CheckCircle } from 'lucide-react';
import AnimatedModal from '../../motion/AnimatedModal';
import { BannedStudent } from './types';

interface BannedStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bannedStudents: BannedStudent[];
  onUnbanStudent: (studentId: number, name: string) => void;
}

export default function BannedStudentsModal({
  isOpen,
  onClose,
  bannedStudents,
  onUnbanStudent,
}: BannedStudentsModalProps) {
  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="520px"
      ariaLabel="Banned students"
    >
      <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,80,80,0.2)' }}>
        <h2 className="font-['Orbitron'] text-sm text-white">// BANNED STUDENTS</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,80,80,0.5)' }}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
        {bannedStudents.length === 0 ? (
        <div className="text-center py-8">
          <p className="font-['Orbitron'] text-xs tracking-widest" style={{ color: 'rgba(0,243,255,0.3)' }}>NO BANNED STUDENTS</p>
        </div>
        ) : bannedStudents.map(s => (
        <div key={s.banId} className="flex items-center justify-between p-4" style={{ background: 'rgba(20,0,0,0.6)', border: '1px solid rgba(255,80,80,0.15)' }}>
          <div>
            <p className="font-['Orbitron'] text-xs text-white">{s.studentName}</p>
            <p className="font-['Share_Tech_Mono'] text-xs mt-0.5" style={{ color: 'rgba(255,80,80,0.5)' }}>{s.studentEmail}</p>
          </div>
          <button onClick={() => onUnbanStudent(s.studentId, s.studentName)} className="btn-retro-green-sm">
            <CheckCircle className="h-3 w-3" />Unban
          </button>
        </div>
      ))}
      </div>
    </AnimatedModal>
  );
}
