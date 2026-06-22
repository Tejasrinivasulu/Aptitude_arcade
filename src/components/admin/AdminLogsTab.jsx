import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const PER_PAGE = 10;

export default function AdminLogsTab({ systemLogs }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(systemLogs.length / PER_PAGE));
  const current = systemLogs.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <h2 className="text-xl font-black flex items-center gap-2">
          <AlertTriangle className="text-orange-500" size={24} /> System Logs & Flags
        </h2>
        <p className="text-sm text-gray-500 mt-1">Proctoring violations and audit events (newest first).</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase text-gray-400 border-b border-gray-200">
              <th className="p-5 font-bold">Timestamp</th>
              <th className="p-5 font-bold">User ID</th>
              <th className="p-5 font-bold">Event</th>
              <th className="p-5 font-bold">Severity</th>
              <th className="p-5 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {current.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-gray-500">No flags or violations recorded.</td></tr>
            ) : (
              current.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="p-5 text-xs text-gray-500">{new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                  <td className="p-5 text-sm font-bold">{log.user || log.uid || '—'}</td>
                  <td className="p-5 text-sm text-gray-600">{log.event}</td>
                  <td className="p-5">
                    <SeverityBadge severity={log.severity} />
                  </td>
                  <td className="p-5">
                    <button type="button" className="text-xs font-bold text-blue-600">Review</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
        <span className="text-xs font-bold text-gray-500">Showing {current.length} of {systemLogs.length}</span>
        <div className="flex gap-2">
          <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 text-xs font-bold border rounded disabled:opacity-50">Previous</button>
          <span className="px-4 py-2 text-xs font-bold">Page {page} / {totalPages}</span>
          <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 text-xs font-bold border rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const styles = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-orange-100 text-orange-700',
    low: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase ${styles[severity] || styles.low}`}>
      {severity || 'low'}
    </span>
  );
}
