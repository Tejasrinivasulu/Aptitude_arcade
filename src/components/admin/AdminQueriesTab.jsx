import { useMemo, useState } from 'react';
import { LifeBuoy, Mail, RotateCcw, CheckCircle } from 'lucide-react';
import { formatIST } from '../../utils/adminData';
import { grantStudentRetake, updateHelpRequestStatus } from '../../services/adminService';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function AdminQueriesTab({ helpRequests }) {
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);

  const rows = useMemo(() => {
    const sorted = [...helpRequests].sort((a, b) =>
      String(b.submittedAt || b.createdAt || '').localeCompare(String(a.submittedAt || a.createdAt || ''))
    );
    if (filter === 'all') return sorted;
    return sorted.filter((r) => (r.status || 'pending') === filter);
  }, [helpRequests, filter]);

  const pendingCount = helpRequests.filter((r) => (r.status || 'pending') === 'pending').length;

  const handleResolve = async (id) => {
    setBusyId(id);
    try {
      await updateHelpRequestStatus(id, 'resolved', { resolvedAt: new Date().toISOString() });
    } catch (err) {
      alert(`Failed to update: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleRetake = async (row) => {
    if (!row.uid) {
      alert('Missing student account id for this query.');
      return;
    }
    if (!window.confirm(`Grant Day 1 retake for ${row.fullName || row.rollNumber}?`)) return;
    setBusyId(row.id);
    try {
      await grantStudentRetake({ uid: row.uid, testKey: '1', helpRequestId: row.id });
      alert('Retake granted and query marked resolved.');
    } catch (err) {
      alert(`Retake failed: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <LifeBuoy className="text-orange-600" size={24} /> Student Queries
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Help Center submissions · {pendingCount} pending · live from Firebase
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold"
        >
          <option value="all">All queries</option>
          <option value="pending">Pending only</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[900px]">
          <thead>
            <tr className="text-xs uppercase text-gray-400 border-b border-gray-200">
              <th className="p-4 font-bold">Student</th>
              <th className="p-4 font-bold">Roll No</th>
              <th className="p-4 font-bold">Email</th>
              <th className="p-4 font-bold">Issue</th>
              <th className="p-4 font-bold">Query</th>
              <th className="p-4 font-bold">Submitted (IST)</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-gray-500">
                  No help queries yet. Students can submit from Help Center.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const status = row.status || 'pending';
                return (
                  <tr key={row.id} className="hover:bg-gray-50 align-top">
                    <td className="p-4 font-bold text-gray-900">{row.fullName || '—'}</td>
                    <td className="p-4">{row.rollNumber || '—'}</td>
                    <td className="p-4 text-gray-600 text-xs">{row.email || '—'}</td>
                    <td className="p-4 font-medium">{row.issueType || '—'}</td>
                    <td className="p-4 max-w-xs text-gray-700 whitespace-pre-wrap">{row.query || row.description || '—'}</td>
                    <td className="p-4 text-xs text-gray-500">{row.submittedAtIST || formatIST(row.submittedAt || row.createdAt)}</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded border ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        {status !== 'resolved' && (
                          <>
                            <button
                              type="button"
                              disabled={busyId === row.id}
                              onClick={() => handleRetake(row)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline disabled:opacity-50"
                            >
                              <RotateCcw size={12} /> Grant Day 1 retake
                            </button>
                            <button
                              type="button"
                              disabled={busyId === row.id}
                              onClick={() => handleResolve(row.id)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-green-700 hover:underline disabled:opacity-50"
                            >
                              <CheckCircle size={12} /> Mark resolved
                            </button>
                          </>
                        )}
                        {row.email && (
                          <a
                            href={`mailto:${row.email}?subject=Re: ${encodeURIComponent(row.issueType || 'Support')}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:underline"
                          >
                            <Mail size={12} /> Reply by email
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
