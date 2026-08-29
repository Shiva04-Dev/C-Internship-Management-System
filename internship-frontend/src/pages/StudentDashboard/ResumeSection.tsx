import { useState, useEffect } from 'react';
import { FileText, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { studentAPI } from '../../services/api';
import DropZone from '../../motion/DropZone';
import { ConfirmState } from './types';

interface ResumeSectionProps {
  openConfirm: (state: ConfirmState | null) => void;
}

export default function ResumeSection({ openConfirm }: ResumeSectionProps) {
  const [loading, setLoading] = useState(true);
  const [hasBaseResume, setHasBaseResume] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getMyResume();
      setHasBaseResume(res.data.hasBaseResume);
    } catch {
      toast.error('Failed to load resume status');
    } finally {
      setLoading(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    setResumeFile(file);
  };

  const handleUpload = async () => {
    if (!resumeFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', resumeFile);
      await studentAPI.uploadResume(fd);
      toast.success('Base CV saved');
      setResumeFile(null);
      setShowUploadForm(false);
      loadStatus();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await studentAPI.downloadResume();
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', 'My_Base_CV.pdf');
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download resume');
    }
  };

  const handleRemove = () => {
    openConfirm({
      title: 'Remove Base CV',
      message: 'Remove your base CV? Applications already submitted with it are not affected.',
      confirmLabel: 'Remove',
      tone: 'danger',
      onConfirm: async () => {
        openConfirm(null);
        try {
          await studentAPI.deleteResume();
          toast.success('Base CV removed');
          loadStatus();
        } catch {
          toast.error('Failed to remove resume');
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="retro-panel p-6 text-center">
        <div className="retro-spinner mx-auto" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  return (
    <div className="retro-panel p-6 max-w-xl">
      <h3 className="font-['Orbitron'] text-sm text-white tracking-wide mb-1">// MY RESUME</h3>
      <p className="font-['Share_Tech_Mono'] text-xs mb-5" style={{ color: 'rgba(0,243,255,0.4)' }}>
        Save a base CV to apply to internships with one click.
      </p>

      {hasBaseResume && !showUploadForm ? (
        <div>
          <div
            className="flex items-center gap-3 p-4 mb-4"
            style={{ background: 'rgba(0,0,20,0.6)', border: '1px solid rgba(0,243,255,0.12)' }}
          >
            <FileText className="h-8 w-8 flex-shrink-0" style={{ color: '#00cc66' }} />
            <div>
              <p className="font-['Share_Tech_Mono'] text-sm" style={{ color: '#00cc66' }}>
                Base CV on file
              </p>
              <p className="font-['Share_Tech_Mono'] text-xs mt-0.5" style={{ color: 'rgba(100,120,140,0.5)' }}>
                Used automatically when you apply, unless you choose otherwise
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleDownload} className="btn-retro-sm">
              <Download className="h-3 w-3" />
              Download
            </button>
            <button onClick={() => setShowUploadForm(true)} className="btn-retro-sm">
              Replace
            </button>
            <button onClick={handleRemove} className="btn-retro-danger-sm">
              <Trash2 className="h-3 w-3" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div>
          <DropZone onFileSelect={validateAndSetFile} selectedFile={resumeFile} label="UPLOAD BASE CV" />
          <div className="flex gap-3 mt-4">
            {hasBaseResume && (
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  setResumeFile(null);
                }}
                className="btn-retro-secondary flex-1 justify-center"
                style={{ fontSize: '0.65rem' }}
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleUpload}
              disabled={!resumeFile || uploading}
              className="btn-retro-primary flex-1 justify-center"
              style={{ fontSize: '0.65rem', opacity: !resumeFile || uploading ? 0.5 : 1 }}
            >
              {uploading ? 'Saving...' : 'Save Base CV'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
