import { useMemo, useState } from 'react';
import { LifeBuoy, Mail, RotateCcw, CheckCircle, MessageSquare, X, Send, Clock } from 'lucide-react';
import { formatIST } from '../../utils/adminData';
import { grantStudentRetake, updateHelpRequestStatus } from '../../services/adminService';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
};

const QUICK_TEMPLATES = [
  {
    label: '📷 Camera Fix',
    text: 'We reviewed your camera issue. Please close background video apps (Zoom, Teams, Meet), ensure camera permission is set to "Allow" in your browser site settings, and try again.',
  },
  {
    label: '🔄 Retake Granted',
    text: 'Your query has been reviewed and approved. A retake has been granted for your exam. You can take the test now from the student portal.',
  },
  {
    label: '⏱️ Reset & Retry',
    text: 'Your exam session has been reset. Please ensure a stable internet connection and complete the exam without switching tabs.',
  },
  {
    label: '✅ General Resolution',
    text: 'Your query has been reviewed and resolved by the examination administration. If you still encounter issues, please let us know.',
  },
];

export default function AdminQueriesTab({ helpRequests }) {
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [replyModalRow, setReplyModalRow] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('resolved');
  const [grantRetakeChecked, setGrantRetakeChecked] = useState(false);
  const [retakeDay, setRetakeDay] = useState('1');

  const rows = useMemo(() => {
    const sorted = [...helpRequests].sort((a, b) =>
      String(b.submittedAt || b.createdAt || '').localeCompare(String(a.submittedAt || a.createdAt || ''))
    );
    if (filter === 'all') return sorted;
    return sorted.filter((r) => (r.status || 'pending') === filter);
  }, [helpRequests, filter]);

  const pendingCount = helpRequests.filter((r) => (r.status || 'pending') === 'pending').length;

  const openReplyModal = (row) => {
    setReplyModalRow(row);
    setReplyText(row.adminReply || '');
    setReplyStatus(row.status === 'resolved' ? 'resolved' : 'resolved');
    setGrantRetakeChecked(false);
    setRetakeDay('1');
  };

  const closeReplyModal = () => {
    setReplyModalRow(null);
    setReplyText('');
  };

  const handleSaveReply = async (sendEmailAlso = false) => {
    if (!replyModalRow) return;
    const row = replyModalRow;
    setBusyId(row.id);

    try {
      const now = new Date();
      const adminReplyAtIST = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const extraPayload = {
        adminReply: replyText.trim(),
        adminReplyAt: now.toISOString(),
        adminReplyAtIST,
        resolvedAt: replyStatus === 'resolved' ? now.toISOString() : null,
      };

      if (grantRetakeChecked && row.uid && retakeDay) {
        await grantStudentRetake({
          uid: row.uid,
          testKey: String(retakeDay).trim(),
          helpRequestId: row.id,
          extra: extraPayload,
        });
      } else {
        await updateHelpRequestStatus(row.id, replyStatus, extraPayload);
      }

      if (sendEmailAlso && row.email) {
        const subject = encodeURIComponent(`[Aptitude Arcade] Response to: ${row.issueType || 'Help Center Query'}`);
        const body = encodeURIComponent(
          `Dear ${row.fullName || 'Student'},\n\n` +
          `Regarding your support query (${row.issueType}):\n\n` +
          `"${row.query || row.description || ''}"\n\n` +
          `Admin Resolution / Reply:\n` +
          `${replyText.trim()}\n\n` +
          (grantRetakeChecked ? `A retake has been granted for Day ${retakeDay}.\n\n` : '') +
          `You can also view this resolution live on the Aptitude Arcade portal Help Center.\n\n` +
          `Best regards,\nAptitude Arcade Examination Committee`
        );
        window.open(`mailto:${row.email}?subject=${subject}&body=${body}`, '_blank');
      }

      closeReplyModal();
    } catch (err) {
      alert(`Failed to save reply: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleQuickResolve = async (id) => {
    setBusyId(id);
    try {
      await updateHelpRequestStatus(id, 'resolved', {
        resolvedAt: new Date().toISOString(),
        adminReply: 'Your query has been reviewed and marked resolved by the admin.',
        adminReplyAtIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      });
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
    const day = window.prompt(
      `Which test day would you like to grant retake for ${row.fullName || row.rollNumber}? (Enter 1 to 14 or 'finale'):`,
      '1'
    );
    if (!day) return;
    setBusyId(row.id);
    try {
      await grantStudentRetake({
        uid: row.uid,
        testKey: String(day).trim(),
        helpRequestId: row.id,
        extra: {
          adminReply: `Retake granted for Day ${day}. Please take your test from the student portal.`,
          adminReplyAtIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        },
      });
      alert(`Day ${day} retake granted and query marked resolved.`);
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
        <table className="w-full text-left text-sm min-w-[950px]">
          <thead>
            <tr className="text-xs uppercase text-gray-400 border-b border-gray-200">
              <th className="p-4 font-bold">Student</th>
              <th className="p-4 font-bold">Roll No</th>
              <th className="p-4 font-bold">Email</th>
              <th className="p-4 font-bold">Issue</th>
              <th className="p-4 font-bold">Query &amp; Reply</th>
              <th className="p-4 font-bold">Submitted (IST)</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold min-w-[280px]">Actions</th>
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
                const hasReply = !!row.adminReply;

                return (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors align-top">
                    <td className="p-4 font-bold text-gray-900">{row.fullName || '—'}</td>
                    <td className="p-4 font-medium text-gray-700">{row.rollNumber || '—'}</td>
                    <td className="p-4 text-gray-600 text-xs">{row.email || '—'}</td>
                    <td className="p-4 font-semibold text-gray-800">{row.issueType || '—'}</td>
                    <td className="p-4 max-w-xs text-gray-700 text-xs leading-relaxed">
                      <div className="whitespace-pre-wrap">{row.query || row.description || '—'}</div>
                      {hasReply && (
                        <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-2 text-[11px] text-emerald-900">
                          <span className="font-bold flex items-center gap-1 text-emerald-800">
                            <MessageSquare size={12} /> Admin Reply:
                          </span>
                          <p className="mt-0.5 whitespace-pre-wrap">{row.adminReply}</p>
                          {row.adminReplyAtIST && (
                            <span className="text-[10px] text-emerald-700 mt-1 block">
                              Sent: {row.adminReplyAtIST}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                      {row.submittedAtIST || formatIST(row.submittedAt || row.createdAt)}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status === 'resolved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {status === 'resolved' ? 'Resolved' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          disabled={busyId === row.id}
                          onClick={() => openReplyModal(row)}
                          className="inline-flex items-center gap-1 rounded-lg border border-orange-300 bg-orange-50 px-2.5 py-1.5 text-xs font-bold text-orange-700 shadow-xs transition hover:bg-orange-100 hover:border-orange-400 active:scale-95 disabled:opacity-50"
                          title="Write reply that student sees on website and email"
                        >
                          <MessageSquare size={13} className="text-orange-600 shrink-0" />
                          {hasReply ? 'Edit Reply' : 'Write Reply'}
                        </button>

                        {status !== 'resolved' ? (
                          <>
                            <button
                              type="button"
                              disabled={busyId === row.id}
                              onClick={() => handleQuickResolve(row.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 shadow-xs transition hover:bg-emerald-100 hover:border-emerald-400 active:scale-95 disabled:opacity-50"
                              title="Mark resolved"
                            >
                              <CheckCircle size={13} className="text-emerald-600 shrink-0" />
                              Resolve
                            </button>
                            <button
                              type="button"
                              disabled={busyId === row.id}
                              onClick={() => handleRetake(row)}
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 shadow-xs transition hover:bg-blue-100 hover:border-blue-400 active:scale-95 disabled:opacity-50"
                              title="Grant retake"
                            >
                              <RotateCcw size={13} className="text-blue-600 shrink-0" />
                              Retake
                            </button>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                            <CheckCircle size={12} className="text-emerald-600 shrink-0" /> Solved
                          </span>
                        )}

                        {row.email && (
                          <a
                            href={`mailto:${row.email}?subject=Re: ${encodeURIComponent(row.issueType || 'Support')}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 hover:border-gray-400 active:scale-95"
                            title="Open email draft"
                          >
                            <Mail size={12} className="text-gray-500 shrink-0" />
                            Email
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

      {/* Reply & Resolution Modal */}
      {replyModalRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Reply to Student Query</h3>
                  <p className="text-xs text-gray-500">
                    Your response will appear immediately on the student&apos;s website portal.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeReplyModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Student & Query Summary */}
            <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-100 mb-4 text-xs space-y-1">
              <div className="flex justify-between font-semibold text-gray-800">
                <span>{replyModalRow.fullName || 'Student'} ({replyModalRow.rollNumber || '—'})</span>
                <span className="text-orange-600 font-bold">{replyModalRow.issueType}</span>
              </div>
              <p className="text-gray-600 italic line-clamp-3 bg-white p-2 rounded border border-gray-100 mt-1">
                &ldquo;{replyModalRow.query || replyModalRow.description}&rdquo;
              </p>
            </div>

            {/* Quick Templates */}
            <div className="mb-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Quick Fill Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.label}
                    type="button"
                    onClick={() => setReplyText(tmpl.text)}
                    className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Textarea */}
            <div className="mb-4">
              <label htmlFor="adminReplyArea" className="block text-xs font-bold text-gray-700 mb-1">
                Your Formal Reply / Action Taken <span className="text-red-500">*</span>
              </label>
              <textarea
                id="adminReplyArea"
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Explain the solution, camera instructions, or retake confirmation..."
                className="w-full rounded-xl border border-gray-300 p-3 text-xs leading-relaxed focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none bg-gray-50/50"
              />
            </div>

            {/* Optional Retake & Status Options */}
            <div className="space-y-3 mb-5 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Set Query Status:</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="replyStatus"
                      value="resolved"
                      checked={replyStatus === 'resolved'}
                      onChange={() => setReplyStatus('resolved')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-emerald-800">Resolved</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="replyStatus"
                      value="in_progress"
                      checked={replyStatus === 'in_progress'}
                      onChange={() => setReplyStatus('in_progress')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-blue-800">In Progress</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-200/60 text-xs">
                <input
                  type="checkbox"
                  id="grantRetakeCheck"
                  checked={grantRetakeChecked}
                  onChange={(e) => setGrantRetakeChecked(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="grantRetakeCheck" className="font-semibold text-gray-800 cursor-pointer">
                  Also grant test retake for Day:
                </label>
                {grantRetakeChecked && (
                  <input
                    type="text"
                    value={retakeDay}
                    onChange={(e) => setRetakeDay(e.target.value)}
                    placeholder="1-14 or finale"
                    className="w-20 rounded border border-gray-300 px-2 py-0.5 text-xs font-bold text-center"
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeReplyModal}
                disabled={busyId === replyModalRow.id}
                className="w-full sm:w-auto rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              {replyModalRow.email && (
                <button
                  type="button"
                  disabled={busyId === replyModalRow.id || !replyText.trim()}
                  onClick={() => handleSaveReply(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50 transition"
                  title="Save to website and open email client"
                >
                  <Mail size={14} className="text-gray-500" />
                  Save &amp; Email
                </button>
              )}
              <button
                type="button"
                disabled={busyId === replyModalRow.id || !replyText.trim()}
                onClick={() => handleSaveReply(false)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-600/20 hover:bg-orange-700 disabled:opacity-50 transition"
              >
                <Send size={14} />
                {busyId === replyModalRow.id ? 'Publishing...' : 'Publish to Website'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
