import { AlertTriangle } from 'lucide-react';
import AnimatedModal from './AnimatedModal';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

const TONE_STYLES = {
  default: {
    accent: 'var(--neon-cyan)',
    iconBg: 'rgba(0,243,255,0.1)',
    iconBorder: 'rgba(0,243,255,0.35)',
    confirmBorder: 'var(--neon-cyan)',
    confirmBackground: 'linear-gradient(135deg,#0066cc,#6600cc)',
  },
  danger: {
    accent: '#ff6666',
    iconBg: 'rgba(255,102,102,0.1)',
    iconBorder: 'rgba(255,102,102,0.4)',
    confirmBorder: '#ff6666',
    confirmBackground: 'linear-gradient(135deg,#661100,#aa2200)',
  },
};

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const palette = TONE_STYLES[tone];

  return (
    <AnimatedModal isOpen={isOpen} onClose={onCancel} maxWidth="420px" ariaLabel={title}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 flex items-center justify-center border flex-shrink-0"
            style={{ background: palette.iconBg, borderColor: palette.iconBorder }}
          >
            <AlertTriangle className="h-5 w-5" style={{ color: palette.accent }} />
          </div>
          <h2 className="font-['Orbitron'] text-sm text-white tracking-widest">{title}</h2>
        </div>
        <p
          className="text-sm mb-6 leading-relaxed"
          style={{ color: 'rgba(160,180,210,0.7)', fontFamily: 'Rajdhani, sans-serif' }}
        >
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-retro-secondary">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="btn-retro-primary"
            style={{ borderColor: palette.confirmBorder, background: palette.confirmBackground }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </AnimatedModal>
  );
}
