import { ReactElement } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, CheckCircle, Clock, XCircle, Ban } from 'lucide-react';
import TiltCard from '../../motion/TiltCard';
import { staggerContainer, staggerItem } from '../../motion/staggerVariants';
import { Application } from './types';

interface ApplicationsTabProps {
  applications: Application[];
  onBrowseClick: () => void;
  onWithdraw: (applicationID: number, companyName: string) => void;
}

export default function ApplicationsTab({ applications, onBrowseClick, onWithdraw }: ApplicationsTabProps) {
  const getStatusBadge = (status: string) => {
    const classes: { [key: string]: string } = {
      Pending: 'badge-pending',
      Accepted: 'badge-accepted',
      Rejected: 'badge-rejected',
      Withdrawn: 'badge-withdrawn'
    };
    const icons: { [key: string]: ReactElement } = {
      Pending: <Clock className="h-3 w-3" />,
      Accepted: <CheckCircle className="h-3 w-3" />,
      Rejected: <XCircle className="h-3 w-3" />,
      Withdrawn: <XCircle className="h-3 w-3" />
    };
    return (
      <span className={classes[status] || 'badge-withdrawn'}>
        {icons[status]}
        {status}
      </span>
    );
  };

  return (
    <motion.div className="space-y-4" variants={staggerContainer()} initial="hidden" animate="show">
      {applications.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 mx-auto mb-4" style={{ color: 'rgba(0,243,255,0.15)' }} />
          <p
            className="font-['Orbitron'] text-xs tracking-widest mb-6"
            style={{ color: 'rgba(0,243,255,0.3)' }}
          >
            NO APPLICATIONS LOGGED
          </p>
          <button onClick={onBrowseClick} className="btn-retro-sm">
            Browse Internships
          </button>
        </div>
      ) : (
        applications.map(app => (
          <motion.div key={app.applicationID} variants={staggerItem()}>
          <TiltCard className="internship-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-['Orbitron'] text-sm text-white mb-0.5">
                  {app.internship?.title || 'Internship'}
                </h3>
                <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(0,243,255,0.5)' }}>
                  {app.internship?.companyName || 'Company'}
                </p>
              </div>
              {getStatusBadge(app.status)}
            </div>
            <div
              className="flex items-center gap-2 font-['Share_Tech_Mono'] text-xs mb-3"
              style={{ color: 'rgba(100,120,140,0.6)' }}
            >
              <Calendar className="h-3.5 w-3.5" />
              Applied: {new Date(app.appliedAt).toLocaleDateString()}
            </div>
            {app.status === 'Pending' && (
              <button
                onClick={() => onWithdraw(app.applicationID, app.internship?.companyName || 'this company')}
                className="btn-retro-danger-sm"
              >
                <Ban className="h-3 w-3" />
                Withdraw
              </button>
            )}
          </TiltCard>
          </motion.div>
        ))
      )}
    </motion.div>
  );
}
