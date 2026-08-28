import GlowAreaChart from '../../motion/charts/GlowAreaChart';
import DonutChart from '../../motion/charts/DonutChart';
import RankedBarChart from '../../motion/charts/RankedBarChart';
import FunnelChart from '../../motion/charts/FunnelChart';
import RadialChart from '../../motion/charts/RadialChart';
import { Reports } from './types';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'var(--neon-orange)',
  Accepted: '#00ff78',
  Rejected: '#ff6666',
};

export default function ReportsSection({ reports }: { reports: Reports }) {
  const applicationsByStatus = reports.applicationsByStatus ?? [];
  const totalApplications = applicationsByStatus.reduce((sum, s) => sum + s.count, 0);
  const pendingCount = applicationsByStatus.find((s) => s.status === 'Pending')?.count ?? 0;
  const acceptedCount = applicationsByStatus.find((s) => s.status === 'Accepted')?.count ?? 0;
  const decidedCount = totalApplications - pendingCount;

  const internshipsByStatus = reports.internshipsByStatus ?? [];

  return (
    <>
      <div className="mb-8">
        <h3
          className="font-['Orbitron'] text-sm tracking-widest mb-4"
          style={{ color: 'rgba(255,80,80,0.6)' }}
        >
          // APPLICATION ACTIVITY (30 DAYS)
        </h3>
        <div className="retro-panel p-6">
          <GlowAreaChart data={reports.applicationsOverTime ?? []} color="var(--neon-cyan)" height={160} />
        </div>
      </div>

      <div className="mb-8">
        <h3
          className="font-['Orbitron'] text-sm tracking-widest mb-4"
          style={{ color: 'rgba(255,80,80,0.6)' }}
        >
          // REPORTS & ANALYTICS
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="retro-panel p-6">
            <h4 className="font-['Orbitron'] text-sm text-white tracking-wide mb-4">Application Status</h4>
            <DonutChart
              segments={applicationsByStatus.map((s) => ({
                label: s.status,
                value: s.count,
                color: STATUS_COLORS[s.status] ?? 'var(--neon-cyan)',
              }))}
            />
          </div>
          <div className="retro-panel p-6">
            <h4 className="font-['Orbitron'] text-sm text-white tracking-wide mb-4">Top Companies</h4>
            <RankedBarChart
              color="var(--neon-purple)"
              items={(reports.topCompanies ?? []).slice(0, 5).map((c) => ({
                label: c.companyName,
                value: c.internshipCount,
                sublabel: `${c.activeInternships ?? 0} active`,
              }))}
            />
          </div>
          <div className="retro-panel p-6">
            <h4 className="font-['Orbitron'] text-sm text-white tracking-wide mb-4">Top Students</h4>
            <RankedBarChart
              color="#00ff78"
              items={(reports.topStudents ?? []).slice(0, 5).map((s) => ({
                label: s.studentName,
                value: s.applicationCount,
                sublabel: `${s.acceptedCount} accepted`,
              }))}
            />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="retro-panel p-6">
            <h4 className="font-['Orbitron'] text-sm text-white tracking-wide mb-4">Conversion Funnel</h4>
            <FunnelChart
              color="#ff6666"
              stages={[
                { label: 'Applied', value: totalApplications },
                { label: 'Decided', value: decidedCount },
                { label: 'Accepted', value: acceptedCount },
              ]}
            />
          </div>
          <div className="retro-panel p-6">
            <h4 className="font-['Orbitron'] text-sm text-white tracking-wide mb-4">Internship Status Mix</h4>
            <RadialChart
              segments={internshipsByStatus.map((s) => ({
                label: s.status,
                value: s.count,
                color: s.status === 'Active' ? '#00ff78' : 'rgba(160,180,200,0.4)',
              }))}
            />
          </div>
        </div>
      </div>
    </>
  );
}
