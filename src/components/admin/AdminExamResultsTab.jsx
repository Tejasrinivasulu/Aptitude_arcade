<<<<<<< HEAD
import { useState, useMemo } from 'react';
import { ClipboardList, Search, X } from 'lucide-react';
import { formatIST, getTotalViolations } from '../../utils/adminData';
import { PROGRAM_DAY_KEYS } from '../../data/testSchedule';
=======
import { useMemo, useState } from 'react';
import { ClipboardList, Users } from 'lucide-react';
import { filterStudents, formatIST, getTotalViolations } from '../../utils/adminData';
>>>>>>> a5ab288 (results modified)

const PER_PAGE = 10;
const SUMMARY_DAYS = ['1', '2', '3'];

<<<<<<< HEAD
export default function AdminExamResultsTab({ allResults = [] }) {
=======
/** Unique members who completed a day (from user profiles + exam result rows). */
function countMembersCompleted(students, results, testKey) {
  const key = String(testKey);
  const ids = new Set();

  students.forEach((u) => {
    if (u.attemptedTests?.[key]) {
      ids.add(String(u.id));
    }
  });

  results.forEach((r) => {
    if (String(r.testKey) !== key) return;
    const id = r.uid || r.rollNumber || r.email;
    if (id) ids.add(String(id));
  });

  return ids.size;
}

export default function AdminExamResultsTab({ allResults, users = [] }) {
>>>>>>> a5ab288 (results modified)
  const [page, setPage] = useState(1);
  const [selectedDay, setSelectedDay] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate submission counts for each day
  const dayCounts = useMemo(() => {
    const counts = { all: allResults.length };
    allResults.forEach((r) => {
      const key = String(r.testKey || '');
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [allResults]);

  // Construct tab list (All Days, Day 1..14, Grand Finale, and any extra custom keys)
  const tabs = useMemo(() => {
    const list = [
      { key: 'all', label: 'All Days', count: dayCounts.all || 0 },
      ...PROGRAM_DAY_KEYS.map((k) => ({
        key: k,
        label: `Day ${k}`,
        count: dayCounts[k] || 0,
      })),
      { key: 'finale', label: 'Grand Finale', count: dayCounts['finale'] || 0 },
    ];

    const knownKeys = new Set(['all', ...PROGRAM_DAY_KEYS, 'finale']);
    Object.keys(dayCounts).forEach((k) => {
      if (!knownKeys.has(k) && k !== '') {
        list.push({ key: k, label: `Day ${k}`, count: dayCounts[k] || 0 });
      }
    });

    return list;
  }, [dayCounts]);

  // Filtered results based on selected day and search query
  const filteredResults = useMemo(() => {
    return allResults.filter((r) => {
      if (selectedDay !== 'all' && String(r.testKey) !== String(selectedDay)) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const name = String(r.fullName || '').toLowerCase();
        const roll = String(r.rollNumber || '').toLowerCase();
        const email = String(r.email || '').toLowerCase();
        return name.includes(q) || roll.includes(q) || email.includes(q);
      }
      return true;
    });
  }, [allResults, selectedDay, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PER_PAGE));
  const current = filteredResults.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSelectDay = (key) => {
    setSelectedDay(key);
    setPage(1);
  };

  const students = useMemo(() => filterStudents(users), [users]);

  const dayCompletionCounts = useMemo(
    () =>
      SUMMARY_DAYS.map((day) => ({
        day,
        count: countMembersCompleted(students, results, day),
      })),
    [students, results]
  );

  return (
<<<<<<< HEAD
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <ClipboardList size={24} className="text-blue-600" /> Exam Results
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredResults.length} {filteredResults.length === 1 ? 'submission' : 'submissions'} shown
              {selectedDay !== 'all' && ` · ${selectedDay === 'finale' ? 'Grand Finale' : `Day ${selectedDay}`}`}
              {searchTerm && ` · matching "${searchTerm}"`}
              {' · demo data filtered out'}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search student, roll no..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-9 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Day Filter Tabs */}
        <div className="mt-5 pt-4 border-t border-gray-200">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
            Filter by Test / Day:
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {tabs.map((tab) => {
              const isActive = selectedDay === tab.key;
              const hasSubmissions = tab.count > 0;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleSelectDay(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1'
                      : hasSubmissions
                      ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                      : 'bg-gray-100/70 border border-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : hasSubmissions
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-200/60 text-gray-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-gray-400 border-b border-gray-200 bg-gray-50/50">
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
              <tr>
                <td colSpan={9} className="p-12 text-center text-gray-500">
                  {searchTerm
                    ? `No exam results matching "${searchTerm}" for ${selectedDay === 'all' ? 'any day' : selectedDay === 'finale' ? 'Grand Finale' : `Day ${selectedDay}`}.`
                    : selectedDay === 'all'
                    ? 'No exam results yet.'
                    : `No exam results submitted yet for ${selectedDay === 'finale' ? 'Grand Finale' : `Day ${selectedDay}`}.`}
                </td>
              </tr>
            ) : (
              current.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{r.fullName || '—'}</td>
                  <td className="p-4 text-gray-600">{r.rollNumber || '—'}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                      {r.testKey === 'finale' ? 'Grand Finale' : `Day ${r.testKey}`}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    {r.score}/{r.total} <span className="text-xs font-medium text-gray-500">({r.percentage}%)</span>
                  </td>
                  <td className="p-4 text-xs text-gray-500">{formatIST(r.submittedAt)}</td>
                  <td className="p-4 text-gray-600">{r.tabViolations || 0}</td>
                  <td className="p-4 text-gray-600">{r.faceWarnings || 0}</td>
                  <td className="p-4">
                    <span className={`font-bold ${getTotalViolations(r) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {getTotalViolations(r)}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-gray-500">
                    {r.submitReason || (r.autoSubmit ? 'tab_limit' : 'manual')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
        <span className="text-xs font-bold text-gray-500">
          Page {page} of {totalPages} ({filteredResults.length} total)
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-xs font-bold border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-xs font-bold border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
          >
            Next
          </button>
=======
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {dayCompletionCounts.map(({ day, count }) => (
          <div
            key={day}
            className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Day {day} Exam
                </p>
                <p className="mt-2 text-4xl font-black text-gray-900 tabular-nums">{count}</p>
                <p className="mt-1 text-sm font-semibold text-gray-600">
                  {count === 1 ? 'member completed' : 'members completed'}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Users size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
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
>>>>>>> a5ab288 (results modified)
        </div>
      </div>
    </div>
  );
}
