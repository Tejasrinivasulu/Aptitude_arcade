import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { formatIST, getTotalViolations } from '../../utils/adminData';

const PER_PAGE = 10;

export default function AdminExamResultsTab({ allResults }) {
  const [page, setPage] = useState(1);
  const results = allResults;
  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const current = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <h2 className="text-xl font-black flex items-center gap-2">
          <ClipboardList size={24} className="text-blue-600" /> Exam Results
        </h2>
        <p className="text-sm text-gray-500 mt-1">{results.length} submissions · demo data filtered out</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-gray-400 border-b border-gray-200">
              <th className="p-4 font-bold">Student</th>
              <th className="p-4 font-bold">Roll No</th>
              <th className="p-4 font-bold">Test</th>
              <th className="p-4 font-bold">Score</th>
              <th className="p-4 font-bold">Submitted At (IST)</th>
              <th className="p-4 font-bold">Tab</th>
              <th className="p-4 font-bold">Face</th>
              <th className="p-4 font-bold">Total</th>
              <th className="p-4 font-bold">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {current.length === 0 ? (
              <tr><td colSpan={9} className="p-12 text-center text-gray-500">No exam results yet.</td></tr>
            ) : (
              current.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold">{r.fullName || '—'}</td>
                  <td className="p-4">{r.rollNumber || '—'}</td>
                  <td className="p-4">{r.testKey === 'finale' ? 'Grand Finale' : `Day ${r.testKey}`}</td>
                  <td className="p-4 font-bold">{r.score}/{r.total} ({r.percentage}%)</td>
                  <td className="p-4 text-xs text-gray-500">{formatIST(r.submittedAt)}</td>
                  <td className="p-4">{r.tabViolations || 0}</td>
                  <td className="p-4">{r.faceWarnings || 0}</td>
                  <td className="p-4">
                    <span className={`font-bold ${getTotalViolations(r) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {getTotalViolations(r)}
                    </span>
                  </td>
                  <td className="p-4 text-xs">{r.submitReason || (r.autoSubmit ? 'tab_limit' : 'manual')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
        <span className="text-xs font-bold text-gray-500">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 text-xs font-bold border rounded disabled:opacity-50">Previous</button>
          <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 text-xs font-bold border rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
