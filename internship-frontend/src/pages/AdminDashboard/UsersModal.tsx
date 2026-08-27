import { motion } from 'framer-motion';
import { Users, Building2, X, Ban } from 'lucide-react';
import AnimatedModal from '../../motion/AnimatedModal';
import SuccessPulse from '../../motion/SuccessPulse';
import { staggerContainer, staggerItem } from '../../motion/staggerVariants';
import { Student, Company } from './types';

interface UsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userModalType: 'students' | 'companies';
  students: Student[];
  companies: Company[];
  banPulseUserId: number | null;
  banPulse: number;
  onBanUser: (userId: number, userType: string, userName: string) => void;
}

export default function UsersModal({
  isOpen,
  onClose,
  userModalType,
  students,
  companies,
  banPulseUserId,
  banPulse,
  onBanUser,
}: UsersModalProps) {
  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="800px"
      ariaLabel={userModalType === 'students' ? 'All students' : 'All companies'}
    >
      <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,243,255,0.15)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center border"
            style={{
              background: userModalType === 'students' ? 'rgba(0,243,255,0.1)' : 'rgba(176,38,255,0.1)',
              borderColor: userModalType === 'students' ? 'rgba(0,243,255,0.3)' : 'rgba(176,38,255,0.3)'
            }}
          >
            {userModalType === 'students' ? (
              <Users className="h-5 w-5" style={{ color: 'var(--neon-cyan)' }} />
            ) : (
              <Building2 className="h-5 w-5" style={{ color: 'var(--neon-purple)' }} />
            )}
          </div>
          <div>
            <h2 className="font-['Orbitron'] text-sm text-white tracking-widest">
              // {userModalType === 'students' ? 'ALL STUDENTS' : 'ALL COMPANIES'}
            </h2>
            <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(0,243,255,0.5)' }}>
              {userModalType === 'students' ? students.length : companies.length} total
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,243,255,0.5)' }}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <motion.div key={userModalType} className="p-6 space-y-3 max-h-[60vh] overflow-y-auto" variants={staggerContainer()} initial="hidden" animate="show">
        {(userModalType === 'students' ? students : companies).map((item) => (
          <motion.div
            key={userModalType === 'students' ? (item as Student).studentID : (item as Company).companyID}
            variants={staggerItem()}
            className="p-4 flex items-center justify-between"
            style={{ background: 'rgba(0,0,20,0.6)', border: '1px solid rgba(0,243,255,0.12)' }}
          >
            <div className="flex-1">
              <h3 className="font-['Orbitron'] text-sm text-white mb-1">
                {userModalType === 'students'
                  ? `${(item as Student).firstName} ${(item as Student).lastName}`
                  : (item as Company).companyName}
              </h3>
              <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(0,243,255,0.5)' }}>
                {item.email}
              </p>
              {userModalType === 'students' && (item as Student).university && (
                <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{ color: 'rgba(100,120,140,0.6)' }}>
                  {(item as Student).university} - {(item as Student).degree}
                </p>
              )}
            </div>
            {/* The ban pulse is anchored HERE, on the row's own Ban button
                inside the Users modal, not on the header's ShieldAlert
                button. `onBanUser` is only reachable from inside this
                modal, and the modal stays open on success — a pulse on the
                header button would fire behind the overlay's blur backdrop
                and never actually be seen. */}
            <div className="relative inline-block">
              <button
                onClick={() => onBanUser(
                  userModalType === 'students' ? (item as Student).studentID : (item as Company).companyID,
                  userModalType === 'students' ? 'Student' : 'Company',
                  userModalType === 'students' ? `${(item as Student).firstName} ${(item as Student).lastName}` : (item as Company).companyName
                )}
                className="btn-retro-danger-sm"
              >
                <Ban className="h-3 w-3" />
                Ban
              </button>
              <SuccessPulse
                trigger={
                  (userModalType === 'students' ? (item as Student).studentID : (item as Company).companyID) === banPulseUserId
                    ? banPulse
                    : 0
                }
                color="#ff6666"
              />
            </div>
          </motion.div>
        ))}
        {(userModalType === 'students' ? students : companies).length === 0 && (
          <div className="text-center py-8">
            <p className="font-['Orbitron'] text-xs tracking-widest" style={{ color: 'rgba(0,243,255,0.3)' }}>
              NO {userModalType.toUpperCase()} FOUND
            </p>
          </div>
        )}
      </motion.div>
    </AnimatedModal>
  );
}
