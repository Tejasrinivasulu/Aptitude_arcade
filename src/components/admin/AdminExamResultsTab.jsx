import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Search, X } from 'lucide-react';
import { filterStudents, formatIST, formatDuration, getTotalViolations, filterExamResults, enrichExamResults } from '../../utils/adminData';
import { PROGRAM_DAY_KEYS } from '../../data/testSchedule';
import { listenToResultsByDay } from '../../services/adminService';

const PER_PAGE = 10;

/** Unique members who have taken a day's exam. */
function countMembersTaken(students, results, testKey) {
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

export default function AdminExamResultsTab({ allResults = [], users = [] }) {
  const [page, setPage] = useState(1);
  const [selectedDay, setSelectedDay] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dayResults, setDayResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsub = listenToResultsByDay(selectedDay, (results) => {
      setDayResults(results);
      setLoading(false);
    });
    return () => unsub?.();
  }, [selectedDay]);

  const students = useMemo(() => filterStudents(users), [users]);

  // Unique members taken per day (shown on Filter by Test / Day tabs)
  const dayCounts = useMemo(() => {
    const keys = [...PROGRAM_DAY_KEYS, 'finale'];
    const counts = {};

    keys.forEach((key) => {
      counts[key] = countMembersTaken(students, allResults, key);
    });

    // Also include any unexpected test keys from results
    allResults.forEach((r) => {
      const key = String(r.testKey || '');
      if (key && counts[key] === undefined) {
        counts[key] = countMembersTaken(students, allResults, key);
      }
    });

    // All Days = total exams taken across every day (sum of each day's members taken)
    counts.all = Object.entries(counts).reduce((sum, [key, value]) => {
      if (key === 'all') return sum;
      return sum + (Number(value) || 0);
    }, 0);

    return counts;
  }, [students, allResults]);

  const tabs = useMemo(() => {
    const list = [
      { key: 'all', label: 'All Days', count: dayCounts.all || 0 },
      ...PROGRAM_DAY_KEYS.map((k) => ({
        key: k,
        label: `Day ${k}`,
        count: dayCounts[k] || 0,
      })),
      { key: 'finale', label: 'Grand Finale', count: dayCounts.finale || 0 },
    ];

    const knownKeys = new Set(['all', ...PROGRAM_DAY_KEYS, 'finale']);
    Object.keys(dayCounts).forEach((k) => {
      if (!knownKeys.has(k) && k !== '') {
        list.push({ key: k, label: `Day ${k}`, count: dayCounts[k] || 0 });
      }
    });

    return list;
  }, [dayCounts]);

  const activeResultsSource = dayResults.length > 0 || selectedDay !== 'all' ? dayResults : allResults;

  const enrichedResults = useMemo(
    () => filterExamResults(enrichExamResults(activeResultsSource, users)),
    [activeResultsSource, users]
  );

  const filteredResults = useMemo(() => {
    return enrichedResults.filter((r) => {
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
  }, [enrichedResults, selectedDay, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PER_PAGE));
  const current = filteredResults.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSelectDay = (key) => {
    setSelectedDay(key);
    setPage(1);
  };

  return (
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

        <div className="mt-5 pt-4 border-t border-gray-200">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
            Filter by Test / Day: <span className="font-medium normal-case tracking-normal text-gray-500">(number = members taken)</span>
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
              <th className="p-4 font-bold">Duration</th>
              <th className="p-4 font-bold">Submitted At (IST)</th>
              <th className="p-4 font-bold">Tab</th>
              <th className="p-4 font-bold">Face</th>
              <th className="p-4 font-bold">Total</th>
              <th className="p-4 font-bold">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && current.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-12 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Loading {selectedDay === 'all' ? 'results' : `Day ${selectedDay} results`}...</span>
                  </div>
                </td>
              </tr>
            ) : current.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-12 text-center text-gray-500">
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
                  <td className="p-4 text-xs font-mono font-semibold text-gray-700">
                    {formatDuration(r.timeTakenSeconds)}
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
        </div>
      </div>
    </div>
  );
}
