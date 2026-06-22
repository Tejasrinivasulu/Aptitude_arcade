import { Activity, Terminal, RotateCcw } from 'lucide-react';
import { filterStudents, formatIST, getTotalViolations } from '../../utils/adminData';

export default function AdminOverviewTab({ users, allResults, metricsData, onRescheduleStudent, onOpenRescue }) {
  const students = filterStudents(users);
  const results = allResults;
  const recentResults = results.slice(0, 10);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Registered" value={students.length} suffix="Students" accent="purple" />
        <MetricCard label="Live Exam Sessions" value={metricsData.liveSessions} suffix="Online" accent="green" />
        <MetricCard label="Average System Score" value={`${metricsData.averageScore}%`} suffix="Overall Avg" accent="blue" />
        <MetricCard label="Flagged Sessions" value={metricsData.flaggedCount} suffix="Violations" accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-gray-900 font-black mb-6 flex items-center gap-2">
            <Activity size={18} className="text-orange-500" /> Pass Rate Heatmap
          </h3>
          <div className="space-y-4">
            {metricsData.heatmap.length === 0 && (
              <p className="text-sm text-gray-500 font-medium">No test data available yet.</p>
            )}
            {metricsData.heatmap.map((item) => (
              <div key={item.day}>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-gray-700">Day {item.day} — {item.topic}</span>
                  <span className={item.passRate < 65 ? 'text-red-500' : 'text-gray-500'}>
                    {item.passRate}% Pass ({item.totalAttempts} attempts)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.passRate < 65 ? 'bg-red-500' : item.passRate < 80 ? 'bg-orange-400' : 'bg-green-500'}`}
                    style={{ width: `${item.passRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-gray-900 font-black mb-6 flex items-center gap-2">
            <Terminal size={18} className="text-gray-400" /> Live Feed
          </h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {metricsData.activity.length === 0 && (
              <p className="text-sm text-gray-500 font-medium">No recent activity.</p>
            )}
            {metricsData.activity.map((log, i) => (
              <div key={i} className="border-l-2 border-gray-200 pl-3 py-1">
                <p className="text-sm text-gray-700 font-medium">{log.text}</p>
                <p className="text-[11px] font-bold text-gray-400 mt-1">{log.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TableCard title="Recent Exam Submissions" subtitle="Last 10 results">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-gray-400 border-b border-gray-100">
              <th className="p-4 font-bold">Student</th>
              <th className="p-4 font-bold">Roll No</th>
              <th className="p-4 font-bold">Test</th>
              <th className="p-4 font-bold">Score</th>
              <th className="p-4 font-bold">Submitted</th>
              <th className="p-4 font-bold">Warnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentResults.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No submissions yet.</td></tr>
            ) : (
              recentResults.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-900">{r.fullName || '—'}</td>
                  <td className="p-4 text-gray-600">{r.rollNumber || '—'}</td>
                  <td className="p-4">{r.testKey === 'finale' ? 'Grand Finale' : `Day ${r.testKey}`}</td>
                  <td className="p-4 font-bold">{r.score}/{r.total} ({r.percentage}%)</td>
                  <td className="p-4 text-gray-500 text-xs">{formatIST(r.submittedAt)}</td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${getTotalViolations(r) > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      T:{r.tabViolations || 0} F:{r.faceWarnings || 0}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableCard>

      <TableCard title="Registered Students" subtitle="Live from Firebase users">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-gray-400 border-b border-gray-100">
              <th className="p-4 font-bold">Name</th>
              <th className="p-4 font-bold">Roll No</th>
              <th className="p-4 font-bold">Email</th>
              <th className="p-4 font-bold">Branch</th>
              <th className="p-4 font-bold">Registered</th>
              <th className="p-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No students registered yet.</td></tr>
            ) : (
              students.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-900">{u.fullName || '—'}</td>
                  <td className="p-4">{u.rollNumber || '—'}</td>
                  <td className="p-4 text-gray-600">{u.email || '—'}</td>
                  <td className="p-4">{u.branch || '—'}</td>
                  <td className="p-4 text-gray-500 text-xs">{formatIST(u.createdAt)}</td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => onRescheduleStudent?.(u)}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                    >
                      <RotateCcw size={12} /> Reschedule
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}

function MetricCard({ label, value, suffix, accent }) {
  const colors = { purple: 'bg-purple-50', green: 'bg-green-50', blue: 'bg-blue-50', red: 'bg-red-50' };
  return (
    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 ${colors[accent]} rounded-full blur-3xl`} />
      <p className="text-gray-500 text-xs font-bold tracking-wider mb-2 uppercase">{label}</p>
      <div className="flex items-end gap-3">
        <h2 className="text-4xl font-black text-gray-900">{value}</h2>
        <span className="text-gray-500 text-sm font-bold mb-1">{suffix}</span>
      </div>
    </div>
  );
}

function TableCard({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-black text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
