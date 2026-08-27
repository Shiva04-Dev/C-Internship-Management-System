import { motion } from 'framer-motion';
import { Award, PieChart, Users, BarChart3 } from 'lucide-react';
import { staggerContainer, staggerItem } from '../../motion/staggerVariants';
import { Reports } from './types';

export default function ReportsSection({ reports }: { reports: Reports }) {
  return (
    <>
      {/* Reports Section */}
      <div className="mb-8">
        <h3 className="font-['Orbitron'] text-sm tracking-widest mb-4" style={{ color: 'rgba(255,80,80,0.6)' }}>
          // REPORTS & ANALYTICS
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Companies */}
          <div className="retro-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 flex items-center justify-center border"
                style={{ background: 'rgba(0,243,255,0.1)', borderColor: 'rgba(0,243,255,0.3)' }}
              >
                <Award className="h-5 w-5" style={{ color: 'var(--neon-cyan)' }} />
              </div>
              <h4 className="font-['Orbitron'] text-sm text-white tracking-wide">Top Companies</h4>
            </div>
            <motion.div key={reports.topCompanies?.length ?? 0} className="space-y-3" variants={staggerContainer()} initial="hidden" animate="show">
              {reports.topCompanies?.slice(0, 5).map((company, index) => (
                <motion.div key={index} variants={staggerItem()} className="flex items-center justify-between p-3" style={{ background: 'rgba(0,0,20,0.5)', border: '1px solid rgba(0,243,255,0.1)' }}>
                  <div className="flex items-center gap-3">
                    <div className="font-['Orbitron'] text-xs" style={{ color: 'rgba(0,243,255,0.4)' }}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-['Orbitron'] text-xs text-white">{company.companyName}</p>
                      <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(0,243,255,0.5)' }}>
                        {company.internshipCount} internships
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {(!reports.topCompanies || reports.topCompanies.length === 0) && (
                <p className="font-['Share_Tech_Mono'] text-xs text-center py-4" style={{ color: 'rgba(0,243,255,0.3)' }}>
                  No data available
                </p>
              )}
            </motion.div>
          </div>

          {/* Application Status */}
          <div className="retro-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 flex items-center justify-center border"
                style={{ background: 'rgba(176,38,255,0.1)', borderColor: 'rgba(176,38,255,0.3)' }}
              >
                <PieChart className="h-5 w-5" style={{ color: 'var(--neon-purple)' }} />
              </div>
              <h4 className="font-['Orbitron'] text-sm text-white tracking-wide">Application Status</h4>
            </div>
            <motion.div key={reports.applicationsByStatus?.length ?? 0} className="space-y-3" variants={staggerContainer()} initial="hidden" animate="show">
              {reports.applicationsByStatus?.map((item, index) => (
                <motion.div key={index} variants={staggerItem()} className="flex items-center justify-between p-3" style={{ background: 'rgba(0,0,20,0.5)', border: '1px solid rgba(176,38,255,0.1)' }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        background: item.status === 'Pending' ? 'var(--neon-orange)' :
                                    item.status === 'Accepted' ? '#00ff78' : '#ff6666'
                      }}
                    />
                    <span className="font-['Share_Tech_Mono'] text-sm text-white">{item.status}</span>
                  </div>
                  <span className="font-['Orbitron'] text-lg" style={{ color: 'var(--neon-purple)' }}>
                    {item.count}
                  </span>
                </motion.div>
              ))}
              {(!reports.applicationsByStatus || reports.applicationsByStatus.length === 0) && (
                <p className="font-['Share_Tech_Mono'] text-xs text-center py-4" style={{ color: 'rgba(176,38,255,0.3)' }}>
                  No data available
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Second Row - More Reports */}
      <div className="mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Students */}
          <div className="retro-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 flex items-center justify-center border"
                style={{ background: 'rgba(0,255,120,0.1)', borderColor: 'rgba(0,255,120,0.3)' }}
              >
                <Users className="h-5 w-5" style={{ color: '#00ff78' }} />
              </div>
              <h4 className="font-['Orbitron'] text-sm text-white tracking-wide">Top Students</h4>
            </div>
            <motion.div key={reports.topStudents?.length ?? 0} className="space-y-3" variants={staggerContainer()} initial="hidden" animate="show">
              {reports.topStudents?.slice(0, 5).map((student, index) => (
                <motion.div key={index} variants={staggerItem()} className="flex items-center justify-between p-3" style={{ background: 'rgba(0,0,20,0.5)', border: '1px solid rgba(0,255,120,0.1)' }}>
                  <div className="flex items-center gap-3">
                    <div className="font-['Orbitron'] text-xs" style={{ color: 'rgba(0,255,120,0.4)' }}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-['Orbitron'] text-xs text-white">{student.studentName}</p>
                      <p className="font-['Share_Tech_Mono'] text-xs" style={{ color: 'rgba(0,255,120,0.5)' }}>
                        {student.applicationCount} applications · {student.acceptedCount} accepted
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {(!reports.topStudents || reports.topStudents.length === 0) && (
                <p className="font-['Share_Tech_Mono'] text-xs text-center py-4" style={{ color: 'rgba(0,255,120,0.3)' }}>
                  No data available
                </p>
              )}
            </motion.div>
          </div>

          {/* Internship Status */}
          <div className="retro-panel p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 flex items-center justify-center border"
                style={{ background: 'rgba(255,157,0,0.1)', borderColor: 'rgba(255,157,0,0.3)' }}
              >
                <BarChart3 className="h-5 w-5" style={{ color: 'var(--neon-orange)' }} />
              </div>
              <h4 className="font-['Orbitron'] text-sm text-white tracking-wide">Internship Status</h4>
            </div>
            <motion.div key={reports.internshipsByStatus?.length ?? 0} className="space-y-3" variants={staggerContainer()} initial="hidden" animate="show">
              {reports.internshipsByStatus?.map((item, index) => (
                <motion.div key={index} variants={staggerItem()} className="flex items-center justify-between p-3" style={{ background: 'rgba(0,0,20,0.5)', border: '1px solid rgba(255,157,0,0.1)' }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ background: item.status === 'Active' ? '#00ff78' : 'rgba(100,100,100,0.5)' }}
                    />
                    <span className="font-['Share_Tech_Mono'] text-sm text-white">{item.status}</span>
                  </div>
                  <span className="font-['Orbitron'] text-lg" style={{ color: 'var(--neon-orange)' }}>
                    {item.count}
                  </span>
                </motion.div>
              ))}
              {(!reports.internshipsByStatus || reports.internshipsByStatus.length === 0) && (
                <p className="font-['Share_Tech_Mono'] text-xs text-center py-4" style={{ color: 'rgba(255,157,0,0.3)' }}>
                  No data available
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
