import { useEffect, useState } from 'react';
import {
  Search, ChevronRight, Users, Clock, AlertTriangle, Key, Ban, Trash2, RotateCcw, LifeBuoy,
} from 'lucide-react';
import { formatIST, getTotalViolations, DAY_TOPICS, filterStudents } from '../../utils/adminData';
import { grantStudentRetake, resetStudentAttempt, deleteStudentCompletely } from '../../services/adminService';

const PER_PAGE = 10;

export default function AdminRescueTab({
  users,
  helpRequests,
  selectedUser,
  setSelectedUser,
  selectedUserResults,
  studentProgress,
  onRefreshProgress,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rescheduleDay, setRescheduleDay] = useState('1');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      setRescheduleDay(String(studentProgress?.currentDay || selectedUser.currentDay || 1));
    }
  }, [selectedUser?.id, studentProgress?.currentDay, selectedUser?.currentDay]);

  const students = filterStudents(users);
  const filtered = students.filter(
    (u) =>
      u.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const userHelp = helpRequests.filter(
    (h) => h.uid === selectedUser?.id && h.status !== 'resolved'
  );

  const handleReschedule = async (helpRequestId) => {
    if (!selectedUser) return;
    const testKey = rescheduleDay;
    if (!window.confirm(`Grant retake for Day ${testKey} to ${selectedUser.fullName || selectedUser.rollNumber}?`)) return;
    setBusy(true);
    try {
      await grantStudentRetake({ uid: selectedUser.id, testKey, helpRequestId });
      alert('Test rescheduled successfully. Student can retake from Take Test.');
      onRefreshProgress?.();
    } catch (err) {
      alert(`Reschedule failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    const label = student.fullName || student.rollNumber || student.email;
    if (!window.confirm(`Permanently delete ${label}?\n\nThis removes their profile, exam results, progress, and help requests from Firebase.`)) return;
    const typed = window.prompt(`Type DELETE to confirm removal of ${label}:`);
    if (typed !== 'DELETE') {
      alert('Delete cancelled.');
      return;
    }
    setBusy(true);
    try {
      await deleteStudentCompletely(student.id);
      if (selectedUser?.id === student.id) setSelectedUser(null);
      alert('Student deleted from Firebase.');
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[700px]">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by roll number..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {current.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">No students found.</p>
          ) : (
            current.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setSelectedUser(u)}
                className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${selectedUser?.id === u.id ? 'bg-black text-white shadow-md' : 'hover:bg-gray-50'}`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{u.rollNumber || 'No Roll'}</p>
                  <p className={`text-xs mt-0.5 truncate ${selectedUser?.id === u.id ? 'text-gray-300' : 'text-gray-500'}`}>{u.fullName || u.email}</p>
                </div>
                <ChevronRight size={16} className="shrink-0" />
              </button>
            ))
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm min-h-[700px]">
          {!selectedUser ? (
            <EmptySelect />
          ) : (
            <>
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100 gap-4">
                <div>
                  <h2 className="text-2xl font-black">{selectedUser.fullName || 'No Name'}</h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedUser.rollNumber} • {selectedUser.email}</p>
                  <p className="text-xs font-bold text-blue-600 mt-2">
                    Current Day: {studentProgress?.currentDay || selectedUser.currentDay || 1}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {selectedUser.suspended ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg">SUSPENDED</span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">ACTIVE</span>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDeleteStudent(selectedUser)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-60"
                  >
                    <Trash2 size={14} /> Delete Student
                  </button>
                </div>
              </div>

              <section className="mb-8">
                <h3 className="text-xs font-bold tracking-widest text-gray-400 mb-3 uppercase flex items-center gap-2">
                  <RotateCcw size={14} /> Reschedule Test
                </h3>
                <div className="flex flex-wrap gap-3 items-end p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Test day</label>
                    <select
                      value={rescheduleDay}
                      onChange={(e) => setRescheduleDay(e.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    >
                      {['1', '2', '3', '4', '5', '6', '7', 'finale'].map((d) => (
                        <option key={d} value={d}>{d === 'finale' ? 'Grand Finale' : `Day ${d}`}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleReschedule()}
                    className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-60"
                  >
                    Grant Retake
                  </button>
                  {studentProgress?.rescheduledTests?.[rescheduleDay] && (
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">Rescheduled</span>
                  )}
                </div>
              </section>

              {userHelp.length > 0 && (
                <section className="mb-8">
                  <h3 className="text-xs font-bold tracking-widest text-gray-400 mb-3 uppercase flex items-center gap-2">
                    <LifeBuoy size={14} /> Pending Help Requests
                  </h3>
                  <div className="space-y-3">
                    {userHelp.map((hr) => (
                      <div key={hr.id} className="p-4 border border-orange-200 bg-orange-50 rounded-xl">
                        <p className="text-sm font-bold text-gray-900">{hr.issueType}</p>
                        <p className="text-sm text-gray-600 mt-1">{hr.description}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatIST(hr.createdAt)}</p>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleReschedule(hr.id)}
                          className="mt-3 text-xs font-bold text-orange-700 underline"
                        >
                          Resolve & Reschedule
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="mb-8">
                <h3 className="text-xs font-bold tracking-widest text-gray-400 mb-3 uppercase">Test Progress</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', 'finale'].map((d) => {
                    const done = selectedUser.attemptedTests?.[d] || selectedUserResults.some((r) => String(r.testKey) === d);
                    const rescheduled = studentProgress?.rescheduledTests?.[d];
                    return (
                      <div key={d} className={`p-3 rounded-lg border text-center text-xs font-bold ${done ? 'bg-green-50 border-green-200 text-green-800' : rescheduled ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                        {d === 'finale' ? 'Finale' : `Day ${d}`}
                        {rescheduled && <div className="text-[10px] mt-1">Rescheduled</div>}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="mb-8">
                <h3 className="text-xs font-bold tracking-widest text-gray-400 mb-3 uppercase">Exam Results</h3>
                {selectedUserResults.length === 0 ? (
                  <p className="text-sm text-gray-500 p-6 border border-dashed rounded-xl text-center">No submissions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedUserResults.map((r) => (
                      <div key={r.id} className="p-4 border border-gray-200 rounded-xl flex justify-between gap-4 flex-wrap">
                        <div>
                          <p className="font-bold text-sm">{r.testKey === 'finale' ? 'Grand Finale' : `Day ${r.testKey}`} — {DAY_TOPICS[r.testKey] || ''}</p>
                          <p className="text-xs text-gray-500 mt-1">{r.score}/{r.total} ({r.percentage}%) · {r.performance}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatIST(r.submittedAt)} · Warnings: {getTotalViolations(r)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm('Clear this attempt?')) return;
                            try {
                              await resetStudentAttempt(selectedUser.id, r.testKey);
                              alert('Attempt cleared.');
                            } catch (e) {
                              alert(e.message);
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-lg"
                        >
                          <Trash2 size={14} /> Clear
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-xs font-bold tracking-widest text-gray-400 mb-3 uppercase">Technical Overrides (UI mock)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <MockBtn icon={Clock} label="Grant +15 Min" onClick={() => alert('Time extension granted (mock).')} />
                  <MockBtn icon={AlertTriangle} label="Flag Account" onClick={() => alert('User flagged (mock).')} />
                  <MockBtn icon={Key} label="Reset Password" onClick={() => alert('Temp password: Pass123! (mock).')} />
                  <MockBtn icon={Ban} label="Suspend Account" onClick={() => alert('Suspend via cloud function when deployed.')} />
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptySelect() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-32 text-gray-400">
      <Users size={32} className="mb-4 text-gray-300" />
      <p className="font-medium text-gray-500">Select a student to view profile and overrides.</p>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  return (
    <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
      <button type="button" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 text-xs font-bold border rounded disabled:opacity-50">Prev</button>
      <span className="text-xs font-bold text-gray-500">Page {page} of {totalPages}</span>
      <button type="button" onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 text-xs font-bold border rounded disabled:opacity-50">Next</button>
    </div>
  );
}

function MockBtn({ icon: Icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50">
      <Icon size={16} /> {label}
    </button>
  );
}
