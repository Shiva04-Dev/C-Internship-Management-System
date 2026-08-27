import { UserCheck, X, CheckCircle } from 'lucide-react';
import AnimatedModal from '../../motion/AnimatedModal';
import { Company } from './types';

interface PendingCompaniesModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingCompanies: Company[];
  onApprove: (companyId: number, companyName: string) => void;
}

export default function PendingCompaniesModal({
  isOpen,
  onClose,
  pendingCompanies,
  onApprove,
}: PendingCompaniesModalProps) {
  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="640px"
      ariaLabel="Pending company approvals"
    >
      <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,157,0,0.2)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center border"
            style={{ background: 'rgba(255,157,0,0.1)', borderColor: 'rgba(255,157,0,0.3)' }}
          >
            <UserCheck className="h-5 w-5" style={{ color: 'var(--neon-orange)' }} />
          </div>
          <div>
            <h2 className="font-['Orbitron'] text-sm text-white tracking-widest">// PENDING COMPANIES</h2>
            <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(255,157,0,0.5)' }}>
              {pendingCompanies.length} awaiting approval
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,157,0,0.5)' }}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
        {pendingCompanies.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="h-12 w-12 mx-auto mb-3" style={{ color: 'rgba(255,157,0,0.2)' }} />
            <p className="font-['Orbitron'] text-xs tracking-widest" style={{ color: 'rgba(255,157,0,0.3)' }}>
              NO PENDING COMPANIES
            </p>
          </div>
        ) : (
          pendingCompanies.map((company) => (
            <div
              key={company.companyID}
              className="p-4 flex items-center justify-between"
              style={{ background: 'rgba(20,10,0,0.6)', border: '1px solid rgba(255,157,0,0.15)' }}
            >
              <div className="flex-1">
                <h3 className="font-['Orbitron'] text-sm text-white mb-1">{company.companyName}</h3>
                <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(255,157,0,0.5)' }}>
                  {company.email}
                </p>
              </div>
              <button
                onClick={() => onApprove(company.companyID, company.companyName)}
                className="btn-retro-green-sm"
              >
                <CheckCircle className="h-3 w-3" />
                Approve
              </button>
            </div>
          ))
        )}
      </div>
    </AnimatedModal>
  );
}
