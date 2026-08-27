import { X, Upload, Zap } from 'lucide-react';
import AnimatedModal from '../../motion/AnimatedModal';
import DropZone from '../../motion/DropZone';
import { Internship } from './types';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  internship: Internship;
  resumeFile: File | null;
  onFileSelect: (file: File) => void;
  applying: boolean;
  onApply: () => void;
}

export default function ApplyModal({
  isOpen,
  onClose,
  internship,
  resumeFile,
  onFileSelect,
  applying,
  onApply,
}: ApplyModalProps) {
  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} maxWidth="480px" ariaLabel="Submit application">
      <div
        className="p-6 border-b flex items-center justify-between"
        style={{ borderColor: 'rgba(0,243,255,0.15)' }}
      >
        <h2 className="font-['Orbitron'] text-sm text-white">// SUBMIT APPLICATION</h2>
        <button
          onClick={onClose}
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
          <DropZone onFileSelect={onFileSelect} selectedFile={resumeFile} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-retro-secondary flex-1 justify-center"
            style={{ fontSize: '0.65rem' }}
          >
            Cancel
          </button>
          <button
            onClick={onApply}
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
  );
}
