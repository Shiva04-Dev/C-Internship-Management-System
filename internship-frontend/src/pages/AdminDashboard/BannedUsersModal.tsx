import { ShieldAlert, X, UserX, CheckCircle } from 'lucide-react';
import AnimatedModal from '../../motion/AnimatedModal';
import { BannedUser } from './types';

interface BannedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  bannedUsers: BannedUser[];
  formatDate: (dateValue: string | null | undefined) => string;
  onUnbanUser: (userId: number, userType: string, userName: string) => void;
}

export default function BannedUsersModal({
  isOpen,
  onClose,
  bannedUsers,
  formatDate,
  onUnbanUser,
}: BannedUsersModalProps) {
  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="640px"
      ariaLabel="Banned users"
    >
      <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,80,80,0.2)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center border"
            style={{ background: 'rgba(255,80,80,0.1)', borderColor: 'rgba(255,80,80,0.3)' }}
          >
            <ShieldAlert className="h-5 w-5" style={{ color: '#ff6666' }} />
          </div>
          <div>
            <h2 className="font-['Orbitron'] text-sm text-white tracking-widest">// BANNED USERS</h2>
            <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(255,80,80,0.5)' }}>
              {bannedUsers.length} users banned
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,80,80,0.5)' }}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
        {bannedUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserX className="h-12 w-12 mx-auto mb-3" style={{ color: 'rgba(255,80,80,0.2)' }} />
            <p className="font-['Orbitron'] text-xs tracking-widest" style={{ color: 'rgba(255,80,80,0.3)' }}>
              NO BANNED USERS
            </p>
          </div>
        ) : (
          bannedUsers.map((ban) => (
            <div
              key={ban.banId}
              className="p-4 flex items-start justify-between"
              style={{ background: 'rgba(20,0,0,0.6)', border: '1px solid rgba(255,80,80,0.15)' }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-['Orbitron'] text-sm text-white">{ban.userName}</h3>
                  <span
                    className="px-2 py-0.5 text-xs font-['Orbitron']"
                    style={{
                      background: ban.userType === 'Student' ? 'rgba(0,243,255,0.1)' : 'rgba(176,38,255,0.1)',
                      border: `1px solid ${ban.userType === 'Student' ? 'rgba(0,243,255,0.3)' : 'rgba(176,38,255,0.3)'}`,
                      color: ban.userType === 'Student' ? 'var(--neon-cyan)' : 'var(--neon-purple)'
                    }}
                  >
                    {ban.userType}
                  </span>
                </div>
                <p className="font-['Share_Tech_Mono'] text-xs mb-2" style={{ color: 'rgba(255,80,80,0.5)' }}>
                  {ban.email}
                </p>
                {ban.reason && (
                  <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(100,120,140,0.6)' }}>
                    Reason: {ban.reason}
                  </p>
                )}
                <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{ color: 'rgba(100,120,140,0.5)' }}>
                  Banned on: {formatDate(ban.bannedAt)}
                </p>
              </div>
              <button
                onClick={() => onUnbanUser(ban.userId, ban.userType, ban.userName)}
                className="btn-retro-green-sm"
              >
                <CheckCircle className="h-3 w-3" />
                Unban
              </button>
            </div>
          ))
        )}
      </div>
    </AnimatedModal>
  );
}
