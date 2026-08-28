import { ReactElement } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, Clock, XCircle, Download, Ban } from 'lucide-react';
import AnimatedModal from '../../motion/AnimatedModal';
import SuccessPulse from '../../motion/SuccessPulse';
import { staggerContainer, staggerItem } from '../../motion/staggerVariants';
import { Application } from './types';

// Prefer the nested student id; fall back to top-level if the API ever flattens.
const studentIdOf = (app: Application): number | undefined => app.student?.studentID ?? app.studentID;

/** Same name the application row renders, reused for the ban prompt/toast. */
const displayName = (app: Application): string =>
  app.student?.name || `${app.student?.firstName ?? ''} ${app.student?.lastName ?? ''}`.trim() || 'Student';

interface ApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  internshipTitle?: string;
  applications: Application[];
  banPulseStudentId: number | null;
  banPulse: number;
  onStatusUpdate: (applicationId: number, status: string) => void;
  onDownloadResume: (applicationId: number, name: string) => void;
  onBanStudent: (studentId: number | undefined, name: string) => void;
}

export default function ApplicationsModal({
  isOpen,
  onClose,
  internshipTitle,
  applications,
  banPulseStudentId,
  banPulse,
  onStatusUpdate,
  onDownloadResume,
  onBanStudent,
}: ApplicationsModalProps) {
  const getStatusBadge = (status: string) => {
    const classes: { [key: string]: string } = { Pending: 'badge-pending', Accepted: 'badge-accepted', Rejected: 'badge-rejected' };
    const icons: { [key: string]: ReactElement } = { Pending: <Clock className="h-3 w-3" />, Accepted: <CheckCircle className="h-3 w-3" />, Rejected: <XCircle className="h-3 w-3" /> };
    return <span className={classes[status] || 'badge-pending'}>{icons[status]}{status}</span>;
  };

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="640px"
      ariaLabel={`Applications for ${internshipTitle ?? 'internship'}`}
    >
      <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,243,255,0.15)' }}>
        <div>
          <h2 className="font-['Orbitron'] text-sm text-white mb-0.5">// APPLICATIONS</h2>
          <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(0,243,255,0.5)' }}>{internshipTitle}</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,243,255,0.5)' }}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <motion.div
        key={applications.length}
        className="p-6 space-y-4 max-h-[60vh] overflow-y-auto"
        variants={staggerContainer()}
        initial="hidden"
        animate="show"
      >
        {applications.length === 0 ? (
          <div className="text-center py-8">
          <p className="font-['Orbitron'] text-xs tracking-widest" style={{ color: 'rgba(0,243,255,0.3)' }}>NO APPLICATIONS RECEIVED</p>
        </div>
        ) : applications.map(app => (
        <motion.div key={app.applicationID} variants={staggerItem()} className="p-4" style={{ background: 'rgba(0,0,20,0.6)', border: '1px solid rgba(0,243,255,0.12)' }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-['Orbitron'] text-xs text-white">{app.student?.name || `${app.student?.firstName} ${app.student?.lastName}` || 'Student'}</p>
              <p className="font-['Share_Tech_Mono'] text-xs mt-0.5" style={{ color: 'rgba(0,243,255,0.4)' }}>{app.student?.email}</p>
            </div>
            {getStatusBadge(app.status)}
          </div>
          <p className="font-['Share_Tech_Mono'] text-xs mb-3" style={{ color: 'rgba(100,120,140,0.6)' }}>
            Applied: {new Date(app.appliedAt).toLocaleDateString()}
          </p>
          {app.status === 'Pending' && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => onStatusUpdate(app.applicationID, 'Accepted')} className="btn-retro-green-sm">
                <CheckCircle className="h-3 w-3" />Accept
              </button>
              <button onClick={() => onStatusUpdate(app.applicationID, 'Rejected')} className="btn-retro-danger-sm">
                <XCircle className="h-3 w-3" />Reject
              </button>
              {app.resumePath && (
              <button onClick={() => onDownloadResume(app.applicationID, displayName(app))} className="btn-retro-sm">
                <Download className="h-3 w-3" />Resume
              </button>
            )}
            {/* The ban pulse is anchored HERE, on the row's own Ban button
                inside the Applications modal, not on the header's "Banned"
                button. `onBanStudent` is only reachable from inside this
                modal, and the modal stays open on success — a pulse on the
                header button would fire behind the overlay's blur backdrop
                and never actually be seen. */}
            <div className="relative inline-block">
              <button onClick={() => onBanStudent(studentIdOf(app), displayName(app))} className="btn-retro-danger-sm">
                <Ban className="h-3 w-3" />Ban
              </button>
              <SuccessPulse trigger={studentIdOf(app) === banPulseStudentId ? banPulse : 0} color="#ff6666" />
            </div>
          </div>
          )}
          {app.status !== 'Pending' && app.resumePath && (
          <button onClick={() => onDownloadResume(app.applicationID, displayName(app))} className="btn-retro-sm">
            <Download className="h-3 w-3" />Download Resume
          </button>
        )}
        </motion.div>
        ))}
      </motion.div>
    </AnimatedModal>
  );
}
