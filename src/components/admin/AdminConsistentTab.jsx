import { useMemo, useState } from 'react';
import {
  Award,
  Download,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Trophy,
  Flame,
  Clock,
  ShieldCheck,
  ChevronRight,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import consistentStudentsData from '../../data/consistentStudentsData.json';
import { formatIST } from '../../utils/adminData';

const PER_PAGE = 15;

const TIER_CONFIG = {
  TIER_1_UNSTOPPABLE_CHAMPION: {
    label: '🏆 Unstoppable Champion',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-black',
  },
  TIER_1_COMPLETED_ALL_12: {
    label: '⭐ Completed All 12',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold',
  },
  TIER_2_CONSISTENT: {
    label: '👍 Tier 2 Consistent',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 font-semibold',
  },
  TIER_3_PARTICIPANT: {
    label: 'Participant',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  FLAGGED_CHEATING: {
    label: '🚨 Speed Flagged',
    badgeClass: 'bg-red-100 text-red-800 border-red-300 font-black',
  },
};

export default function AdminConsistentTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showMethodology, setShowMethodology] = useState(true);

  const stats = useMemo(() => {
    const total = consistentStudentsData.length;
    const tier1 = consistentStudentsData.filter((s) => s.tier === 'TIER_1_UNSTOPPABLE_CHAMPION').length;
    const all12 = consistentStudentsData.filter((s) => s.totalAttempted === 12 && !s.cheatFlag).length;
    const tier2 = consistentStudentsData.filter((s) => s.tier === 'TIER_2_CONSISTENT').length;
    const flagged = consistentStudentsData.filter((s) => s.cheatFlag).length;
    return { total, tier1, all12, tier2, flagged };
  }, []);

  const filtered = useMemo(() => {
    return consistentStudentsData.filter((s) => {
      if (selectedTier === 'tier1' && s.tier !== 'TIER_1_UNSTOPPABLE_CHAMPION') return false;
      if (selectedTier === 'all12' && (s.totalAttempted !== 12 || s.cheatFlag)) return false;
      if (selectedTier === 'tier2' && s.tier !== 'TIER_2_CONSISTENT') return false;
      if (selectedTier === 'flagged' && !s.cheatFlag) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const name = (s.name || '').toLowerCase();
        const roll = (s.rollNumber || '').toLowerCase();
        const email = (s.email || '').toLowerCase();
        const branch = (s.branch || '').toLowerCase();
        return name.includes(q) || roll.includes(q) || email.includes(q) || branch.includes(q);
      }
      return true;
    });
  }, [selectedTier, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentStudents = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const exportCSV = () => {
    const headers = [
      'Rank',
      'Name',
      'Roll Number',
      'Branch',
      'Email',
      'Tier',
      'Integrity Status',
      'Cheat Flag',
      'Flag Reason',
      'Total Attempted (out of 12)',
      'On-Time Days',
      'Overall Avg %',
      'Hard Topics Avg % (D8,10,11,12)',
      'Admin Overrides',
      'Min Same-Day Gap (mins)',
    ];

    const rows = filtered.map((s) => [
      s.rank,
      `"${s.name}"`,
      `"${s.rollNumber}"`,
      `"${s.branch}"`,
      `"${s.email}"`,
      `"${s.tier}"`,
      `"${s.integrityStatus}"`,
      s.cheatFlag ? 'YES' : 'NO',
      `"${s.cheatReason || ''}"`,
      s.totalAttempted,
      s.onTimeCount,
      `${s.avgPercentage}%`,
      `${s.advTopicsPercentage}%`,
      s.rescheduleCount,
      s.minGapMinutesSameDay != null ? `${s.minGapMinutesSameDay}m` : 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `consistent_candidates_days_1_to_12_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
            <Trophy size={16} className="text-amber-500" /> Tier 1 Champions
          </div>
          <p className="mt-2 text-3xl font-black text-amber-600">{stats.tier1}</p>
          <p className="text-[11px] text-gray-400 mt-1">10–12 On-Time &amp; ≥85% Avg</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
            <CheckCircle2 size={16} className="text-emerald-500" /> Completed All 12
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-600">{stats.all12}</p>
          <p className="text-[11px] text-gray-400 mt-1">12 / 12 Days Completed</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
            <Flame size={16} className="text-blue-500" /> Tier 2 Consistent
          </div>
          <p className="mt-2 text-3xl font-black text-blue-600">{stats.tier2}</p>
          <p className="text-[11px] text-gray-400 mt-1">≥10 Tests &amp; ≥75% Avg</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
            <AlertTriangle size={16} className="text-red-500" /> Speed Flagged
          </div>
          <p className="mt-2 text-3xl font-black text-red-600">{stats.flagged}</p>
          <p className="text-[11px] text-gray-400 mt-1">&lt; 5m Gap with High Marks</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
            <Calendar size={16} className="text-purple-500" /> Total Evaluated
          </div>
          <p className="mt-2 text-3xl font-black text-purple-600">{stats.total}</p>
          <p className="text-[11px] text-gray-400 mt-1">Students with attempts</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-black flex items-center gap-2 text-gray-900">
                <Award size={24} className="text-amber-500" /> Consistent Students Leaderboard (Days 1–12)
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Evaluated by On-Time Schedule Punctuality, Cumulative Accuracy, Hard Topics (D8, 10, 11, 12), and Speed Integrity.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMethodology((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  showMethodology
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Info size={14} className={showMethodology ? 'text-amber-700' : 'text-gray-500'} />
                Parameters Considered
                {showMethodology ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              <button
                type="button"
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Download size={14} /> Export CSV
              </button>

              <div className="relative w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="text"
                  placeholder="Search name, roll no..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Collapsible Parameters Considered Guide */}
          {showMethodology && (
            <div className="mt-5 p-5 bg-white border border-amber-200 rounded-2xl shadow-xs space-y-4 animate-fade-in text-xs text-gray-700">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <div className="flex items-center gap-2 font-black text-sm text-gray-900">
                  <Sparkles size={16} className="text-amber-500" />
                  Parameters Considered (Days 1–12 Evaluation)
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Deterministic Multi-Factor Algorithm
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pillar 1: Generalized Benchmark Example */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-2">
                    <Trophy size={15} className="text-amber-600" /> Benchmark Top Candidate Profile
                  </div>
                  <ul className="space-y-1.5 text-gray-700 text-[11px] leading-relaxed">
                    <li>
                      • <strong className="text-gray-900">100% Attendance:</strong> Completed all 12 / 12 tests without missing any day.
                    </li>
                    <li>
                      • <strong className="text-gray-900">12 / 12 On-Time:</strong> Every single test submitted on its exact live calendar date during scheduled hours.
                    </li>
                    <li>
                      • <strong className="text-gray-900">Highest Cumulative Score:</strong> Highest overall average percentage (e.g. 96% cumulative performance across all 12 tests).
                    </li>
                    <li>
                      • <strong className="text-gray-900">Hard Topics Mastery:</strong> Top-tier performance (e.g. ≥95%) on advanced discriminator tests: Day 8 (Work), Day 10 (Speed &amp; Distance), Day 11 (Permutations), Day 12 (Mixtures).
                    </li>
                    <li>
                      • <strong className="text-gray-900">Zero Admin Resets:</strong> 0 manual overrides/retests (fully organic first-attempt completion).
                    </li>
                    <li>
                      • <strong className="text-gray-900">Zero Speed Flags:</strong> Natural human time gaps and realistic question review times.
                    </li>
                  </ul>
                </div>

                {/* Pillar 2: 6 Deterministic Parameters */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-2">
                    <ShieldCheck size={15} className="text-slate-700" /> Parameter Hierarchy &amp; Tie-Breakers
                  </div>
                  <ol className="space-y-1.5 text-gray-700 text-[11px] leading-relaxed list-decimal pl-4">
                    <li>
                      <strong className="text-gray-900">Integrity Gate:</strong> Speed-flagged candidates pushed to the bottom.
                    </li>
                    <li>
                      <strong className="text-gray-900">Total Attempted:</strong> 12/12 candidates always rank above 11, 10, etc.
                    </li>
                    <li>
                      <strong className="text-gray-900">On-Time Punctuality:</strong> Tests completed during live daily window prioritized over catch-up sessions.
                    </li>
                    <li>
                      <strong className="text-gray-900">Overall Accuracy:</strong> Cumulative score percentage across all tests.
                    </li>
                    <li>
                      <strong className="text-gray-900">Advanced Topics:</strong> Discriminator score on high-difficulty days (8, 10, 11, 12).
                    </li>
                    <li>
                      <strong className="text-gray-900">Overrides Count:</strong> Fewer admin resets preferred.
                    </li>
                  </ol>
                </div>

                {/* Pillar 3: Tiers & Anti-Cheat */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-2">
                    <AlertTriangle size={15} className="text-red-500" /> Tiers &amp; Anti-Speed Filter
                  </div>
                  <div className="space-y-2 text-gray-700 text-[11px] leading-relaxed">
                    <p>
                      <strong className="text-amber-800">🏆 Tier 1 Champion (8):</strong> 12/12 attempted, ≥10 on-time, ≥85% avg, 0 cheat flags.
                    </p>
                    <p>
                      <strong className="text-emerald-800">⭐ Completed 12/12 (23):</strong> 12/12 tests submitted without speed flags.
                    </p>
                    <p>
                      <strong className="text-blue-800">👍 Tier 2 Consistent (20):</strong> ≥10 attempted &amp; ≥75% average score.
                    </p>
                    <div className="p-2 bg-red-50 rounded-lg border border-red-200 text-red-800 font-medium text-[10.5px]">
                      <strong>🚨 Speed Flag Heuristic:</strong> Same-day consecutive tests completed in &lt; 5 minutes with ≥80% score were flagged as suspicious speed submissions.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 scrollbar-thin">
            {[
              { id: 'all', label: 'All Candidates', count: consistentStudentsData.length },
              { id: 'tier1', label: '🏆 Tier 1 Champions', count: stats.tier1 },
              { id: 'all12', label: '⭐ Completed 12/12', count: stats.all12 },
              { id: 'tier2', label: '👍 Tier 2 Consistent', count: stats.tier2 },
              { id: 'flagged', label: '🚨 Speed Flagged', count: stats.flagged },
            ].map(({ id, label, count }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSelectedTier(id);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedTier === id
                    ? 'bg-black text-white shadow-sm ring-2 ring-black ring-offset-1'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${selectedTier === id ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase text-gray-400 border-b border-gray-200 bg-gray-50/60 tracking-wider">
                <th className="p-4 font-bold text-center">Rank</th>
                <th className="p-4 font-bold">Student</th>
                <th className="p-4 font-bold">Roll Number</th>
                <th className="p-4 font-bold">Tier</th>
                <th className="p-4 font-bold text-center">Attempted</th>
                <th className="p-4 font-bold text-center">On-Time</th>
                <th className="p-4 font-bold text-center">Overall Avg</th>
                <th className="p-4 font-bold text-center">Hard Topics (D8,10,11,12)</th>
                <th className="p-4 font-bold">Integrity Status</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-gray-500 font-medium">
                    No matching students found.
                  </td>
                </tr>
              ) : (
                currentStudents.map((s) => {
                  const tierCfg = TIER_CONFIG[s.tier] || TIER_CONFIG.TIER_3_PARTICIPANT;
                  const isTop3 = typeof s.rank === 'number' && s.rank <= 3;
                  return (
                    <tr key={s.rollNumber || s.email} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-4 text-center">
                        {s.cheatFlag ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-700 border border-red-300">
                            FLAG
                          </span>
                        ) : isTop3 ? (
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black shadow-sm ${
                            s.rank === 1 ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300' : s.rank === 2 ? 'bg-slate-300 text-slate-900 ring-2 ring-slate-200' : 'bg-orange-300 text-orange-950 ring-2 ring-orange-200'
                          }`}>
                            #{s.rank}
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-gray-600">#{s.rank}</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{s.name}</span>
                          {s.rank === 1 && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-black uppercase tracking-wider">
                              #1 Ranked
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-normal">{s.branch}</div>
                      </td>
                      <td className="p-4 font-mono text-gray-600">{s.rollNumber}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border ${tierCfg.badgeClass}`}>
                          {tierCfg.label}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold">
                        <span className={s.totalAttempted === 12 ? 'text-emerald-700' : 'text-gray-700'}>
                          {s.totalAttempted}/12
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold">
                        <span className={s.onTimeCount >= 10 ? 'text-amber-700' : 'text-gray-700'}>
                          {s.onTimeCount}/12
                        </span>
                      </td>
                      <td className="p-4 text-center font-black text-gray-900">
                        {s.avgPercentage}%
                      </td>
                      <td className="p-4 text-center font-bold text-blue-700">
                        {s.advTopicsPercentage}%
                        <span className="text-[10px] font-normal text-gray-400 ml-1">({s.advTopicsScore})</span>
                      </td>
                      <td className="p-4">
                        {s.cheatFlag ? (
                          <div className="flex flex-col text-red-600" title={s.cheatReason}>
                            <span className="font-bold flex items-center gap-1">
                              <AlertTriangle size={12} /> Speed Flag
                            </span>
                            <span className="text-[10px] text-red-500 line-clamp-1">{s.cheatReason}</span>
                          </div>
                        ) : (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <ShieldCheck size={14} className="text-emerald-600" /> Genuine Solver
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(s)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-all flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <Eye size={12} /> Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center text-xs">
          <span className="font-medium text-gray-500">
            Page {page} of {totalPages} ({filtered.length} candidates)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 font-bold border border-gray-200 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 font-bold border border-gray-200 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Student Daily Breakdown Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-gray-900">{selectedStudent.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${TIER_CONFIG[selectedStudent.tier]?.badgeClass}`}>
                    {TIER_CONFIG[selectedStudent.tier]?.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  {selectedStudent.rollNumber} · {selectedStudent.branch} · {selectedStudent.email}
                </p>
                {selectedStudent.cheatFlag && (
                  <p className="text-xs text-red-600 font-bold mt-1 bg-red-50 p-2 rounded-lg border border-red-200">
                    ⚠️ Flag Detail: {selectedStudent.cheatReason}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto my-4 divide-y divide-gray-100 pr-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 uppercase text-[10px] bg-gray-50 border-b">
                    <th className="p-2.5 font-bold">Day</th>
                    <th className="p-2.5 font-bold">Score</th>
                    <th className="p-2.5 font-bold">Percentage</th>
                    <th className="p-2.5 font-bold">Submitted At (IST)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((day) => {
                    const test = selectedStudent.testsSummary?.[day];
                    return (
                      <tr key={day} className="hover:bg-gray-50">
                        <td className="p-2.5 font-bold text-gray-900">Day {day}</td>
                        <td className="p-2.5">
                          {test ? (
                            <span className="font-bold text-gray-900">{test.score}/{test.total}</span>
                          ) : (
                            <span className="text-gray-400 italic">Not Attempted</span>
                          )}
                        </td>
                        <td className="p-2.5 font-bold">
                          {test ? (
                            <span className={test.percentage >= 85 ? 'text-emerald-700' : test.percentage >= 70 ? 'text-blue-700' : 'text-amber-700'}>
                              {test.percentage}%
                            </span>
                          ) : '—'}
                        </td>
                        <td className="p-2.5 text-gray-500 font-mono text-[11px]">
                          {test ? formatIST(test.submittedAt) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
