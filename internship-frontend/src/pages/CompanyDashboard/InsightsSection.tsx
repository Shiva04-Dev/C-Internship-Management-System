import DonutChart from '../../motion/charts/DonutChart';
import RankedBarChart from '../../motion/charts/RankedBarChart';
import { Internship, ApplicationStatusCount } from './types';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'var(--neon-orange)',
  Accepted: '#00ff78',
  Rejected: '#ff6666',
};

export default function InsightsSection({
  internships,
  applicationsByStatus,
}: {
  internships: Internship[];
  applicationsByStatus: ApplicationStatusCount[];
}) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <div className="retro-panel p-6">
        <h4 className="font-['Orbitron'] text-sm text-white tracking-wide mb-4">
          Applications per Internship
        </h4>
        <RankedBarChart
          color="var(--neon-cyan)"
          items={internships.map((i) => ({ label: i.title, value: i.applicationCount ?? 0 }))}
          emptyLabel="Post an internship to see applications roll in"
        />
      </div>
      <div className="retro-panel p-6">
        <h4 className="font-['Orbitron'] text-sm text-white tracking-wide mb-4">Applicant Status</h4>
        <DonutChart
          segments={applicationsByStatus.map((s) => ({
            label: s.status,
            value: s.count,
            color: STATUS_COLORS[s.status] ?? 'var(--neon-purple)',
          }))}
          emptyLabel="No applicants yet"
        />
      </div>
    </div>
  );
}
