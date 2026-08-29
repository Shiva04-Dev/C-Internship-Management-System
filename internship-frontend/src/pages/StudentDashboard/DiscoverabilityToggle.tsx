import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { studentAPI } from '../../services/api';

export default function DiscoverabilityToggle() {
  const [loading, setLoading] = useState(true);
  const [isDiscoverable, setIsDiscoverable] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getDiscoverable();
      setIsDiscoverable(res.data.isDiscoverable);
    } catch {
      toast.error('Failed to load discoverability status');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (value: boolean) => {
    if (value === isDiscoverable || saving) return;
    setSaving(true);
    try {
      await studentAPI.updateDiscoverable(value);
      setIsDiscoverable(value);
      toast.success(value ? 'You are now discoverable to companies' : 'You are no longer discoverable to companies');
    } catch {
      toast.error('Failed to update discoverability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="retro-panel p-6 max-w-xl text-center">
        <div className="retro-spinner mx-auto" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  return (
    <div className="retro-panel p-6 max-w-xl">
      <h3 className="font-['Orbitron'] text-sm text-white tracking-wide mb-1">// COMPANY DISCOVERY</h3>
      <p className="font-['Share_Tech_Mono'] text-xs mb-5" style={{ color: 'rgba(0,243,255,0.4)' }}>
        Let approved companies find you in search, even for internships you haven't applied to.
      </p>

      <div className="flex gap-1">
        <button
          onClick={() => handleToggle(true)}
          className={isDiscoverable ? 'retro-tab-active' : 'retro-tab-inactive'}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          Discoverable
        </button>
        <button
          onClick={() => handleToggle(false)}
          className={!isDiscoverable ? 'retro-tab-active' : 'retro-tab-inactive'}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          Not Discoverable
        </button>
      </div>
    </div>
  );
}
