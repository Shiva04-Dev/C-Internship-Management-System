import DonutChart from '../../motion/charts/DonutChart';
import RingGauge from '../../motion/charts/RingGauge';
import { Application } from './types';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'var(--neon-orange)',
  Accepted: '#00ff78',
  Rejected: '#ff6666',
  Withdrawn: 'rgba(160,180,200,0.4)',
};

export default function InsightsSection({ applications }: { applications: Application[] }) {
  const counts = applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] ?? 0) + 1;
    return acc;
  }, {});

  const acceptedCount = counts['Accepted'] ?? 0;

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <div className="retro-panel p-6">
        <h4 className="font-['Orbitron'] text-sm text-white tracking-wide mb-4">Application Status</h4>
        <DonutChart
          segments={Object.entries(counts).map(([status, count]) => ({
            label: status,
            value: count,
            color: STATUS_COLORS[status] ?? 'var(--neon-cyan)',
          }))}
          emptyLabel="Apply to an internship to see your status breakdown"
        />
      </div>
      <div className="retro-panel p-6 flex items-center justify-center">
        <RingGauge
          value={acceptedCount}
          total={applications.length}
          label="Acceptance Rate"
          color="var(--neon-cyan)"
          emptyLabel="Apply to see your acceptance rate"
        />
      </div>
    </div>
  );
}
