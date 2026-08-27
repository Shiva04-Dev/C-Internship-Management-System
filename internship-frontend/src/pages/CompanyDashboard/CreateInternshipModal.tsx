import { ChangeEvent, FormEvent } from 'react';
import { X, Zap } from 'lucide-react';
import AnimatedModal from '../../motion/AnimatedModal';
import { FormData, FormErrors } from './types';

interface CreateInternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  formErrors: FormErrors;
  onInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function CreateInternshipModal({
  isOpen,
  onClose,
  formData,
  formErrors,
  onInputChange,
  onSubmit,
}: CreateInternshipModalProps) {
  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} maxWidth="580px" ariaLabel="Post new internship">
      <div className="p-6 border-b" style={{ borderColor: 'rgba(0,243,255,0.15)' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-['Orbitron'] text-sm tracking-widest text-white">// POST NEW INTERNSHIP</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,243,255,0.5)' }}>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        {[['title', 'Internship Title', 'text', 'e.g. Frontend Developer Intern'], ['location', 'Location', 'text', 'e.g. Remote / Cape Town']].map(([name, label, type, ph]) => (
          <div key={name}>
            <label className="retro-label" htmlFor={name}>{label} *</label>
            <input id={name} type={type} name={name} value={formData[name as keyof FormData]} onChange={onInputChange} placeholder={ph} className="retro-input" />
            {formErrors[name] && <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{ color: '#ff6666' }}>{formErrors[name]}</p>}
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          {[['startDate', 'Start Date'], ['endDate', 'End Date']].map(([name, label]) => (
            <div key={name}>
              <label className="retro-label" htmlFor={name}>{label} *</label>
              <input id={name} type="date" name={name} value={formData[name as keyof FormData]} onChange={onInputChange} className="retro-input" style={{ colorScheme: 'dark' }} />
              {formErrors[name] && <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{ color: '#ff6666' }}>{formErrors[name]}</p>}
            </div>
          ))}
        </div>
        <div>
          <label className="retro-label" htmlFor="description">Description *</label>
          <textarea id="description" name="description" value={formData.description} onChange={onInputChange} placeholder="Describe the internship role..." rows={3} className="retro-input" style={{ resize: 'vertical' }} />
          {formErrors.description && <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{ color: '#ff6666' }}>{formErrors.description}</p>}
        </div>
        <div>
          <label className="retro-label" htmlFor="requirements">Requirements *</label>
          <textarea id="requirements" name="requirements" value={formData.requirements} onChange={onInputChange} placeholder="List requirements..." rows={3} className="retro-input" style={{ resize: 'vertical' }} />
          {formErrors.requirements && <p className="font-['Share_Tech_Mono'] text-xs mt-1" style={{ color: '#ff6666' }}>{formErrors.requirements}</p>}
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-retro-secondary flex-1 justify-center" style={{ fontSize: '0.65rem' }}>Cancel</button>
          <button type="submit" className="btn-retro-primary flex-1 justify-center" style={{ borderColor: 'var(--neon-purple)', background: 'linear-gradient(135deg,#4400aa,#8800cc)', fontSize: '0.65rem' }}>
            <Zap className="h-3.5 w-3.5" />Post Internship
          </button>
        </div>
      </form>
    </AnimatedModal>
  );
}
