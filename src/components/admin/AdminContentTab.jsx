import { useEffect, useState } from 'react';
import { FileText, Save, Plus, Trash2, Upload, Download, Copy, Check, AlertCircle, X, Sparkles } from 'lucide-react';
import { listenToQuestionBank, publishQuestionBank } from '../../services/adminService';
import { DAY_TOPICS } from '../../utils/adminData';
import { PROGRAM_DAY_KEYS } from '../../data/testSchedule';
import { parseQuestionsInput } from '../../utils/questionParser';

const DAYS = PROGRAM_DAY_KEYS;

const SAMPLE_JSON_TEMPLATE = `[
  {
    "question": "What is the LCM of 12 and 18?",
    "options": ["24", "36", "48", "72"],
    "answer": 1
  },
  {
    "type": "fill",
    "question": "The remainder when 100 is divided by 9 is ______.",
    "answer": "1"
  }
]`;

const SAMPLE_TEXT_TEMPLATE = `Q1. If 20% of a number is 50, find the number.
A) 200
B) 250
C) 300
D) 350
Answer: B

Q2. What is 5! (factorial of 5)?
A) 60
B) 100
C) 120
D) 150
Answer: C`;

export default function AdminContentTab() {
  const [selectedDay, setSelectedDay] = useState('1');
  const [bank, setBank] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = listenToQuestionBank(selectedDay, (data) => {
      // Check local storage fallback first if data is empty
      let localFallback = null;
      try {
        const stored = localStorage.getItem(`local_qbank_${selectedDay}`);
        if (stored) localFallback = JSON.parse(stored);
      } catch {
        // Ignore
      }

      setBank(
        data || localFallback || {
          title: `Day ${selectedDay} Assessment`,
          topicLabel: DAY_TOPICS[selectedDay] || `Day ${selectedDay}`,
          durationMinutes: 30,
          questions: [],
          lastPublishedAt: null,
        }
      );
    });
    return unsub;
  }, [selectedDay]);

  const updateQuestion = (index, field, value) => {
    setBank((prev) => {
      const questions = [...(prev.questions || [])];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  const updateOption = (qIndex, oIndex, value) => {
    setBank((prev) => {
      const questions = [...prev.questions];
      const options = [...(questions[qIndex].options || [])];
      options[oIndex] = value;
      questions[qIndex] = { ...questions[qIndex], options };
      return { ...prev, questions };
    });
  };

  const addQuestion = (type = 'mcq') => {
    if ((bank?.questions?.length || 0) >= 30) {
      alert('Maximum 30 questions per day.');
      return;
    }
    setBank((prev) => ({
      ...prev,
      questions: [
        ...(prev.questions || []),
        type === 'fill'
          ? { id: (prev.questions?.length || 0) + 1, type: 'fill', question: '', answer: '' }
          : {
              id: (prev.questions?.length || 0) + 1,
              type: 'mcq',
              question: '',
              options: ['', '', '', ''],
              answer: 0,
            },
      ],
    }));
  };

  const removeQuestion = (index) => {
    setBank((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const clearAllQuestions = () => {
    if (window.confirm(`Clear all questions for Day ${selectedDay}? This cannot be undone.`)) {
      setBank((prev) => ({ ...prev, questions: [] }));
    }
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(bank.questions || [], null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyImport = (mode = 'replace') => {
    const res = parseQuestionsInput(importText);
    if (!res.success) {
      setImportStatus({ error: res.error });
      return;
    }

    const imported = res.questions;
    setBank((prev) => {
      const newQuestions = mode === 'append' ? [...(prev.questions || []), ...imported] : imported;
      return {
        ...prev,
        questions: newQuestions.slice(0, 30).map((q, idx) => ({ ...q, id: idx + 1 })),
      };
    });

    setShowImportModal(false);
    setImportText('');
    setImportStatus(null);
    alert(`Successfully loaded ${imported.length} questions into Day ${selectedDay}! Click 'Publish Changes' when ready.`);
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      const published = await publishQuestionBank(selectedDay, bank);
      setBank(published);
      alert(`Day ${selectedDay} question bank published successfully!`);
    } catch (err) {
      alert(`Publish failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!bank) {
    return <div className="p-12 text-center text-gray-500">Loading question bank...</div>;
  }

  const questionCount = bank.questions?.length || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <FileText className="text-blue-600" size={24} /> Content Manager
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {bank.lastPublishedAt
              ? `Last published: ${new Date(bank.lastPublishedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
              : 'Draft · Not published yet'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Sparkles size={16} /> Bulk Import Questions
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-xl transition-all border border-gray-200 cursor-pointer"
            title="Copy all questions as JSON"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            {copied ? 'Copied JSON!' : 'Export JSON'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handlePublish}
            className="flex items-center gap-2 px-6 py-2.5 bg-black text-white font-bold text-sm rounded-xl hover:bg-gray-900 disabled:opacity-60 transition-all cursor-pointer shadow-sm"
          >
            <Save size={16} /> {saving ? 'Publishing...' : 'Publish Changes'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* 14 Day Selector */}
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Select Day (1 - 14):</label>
          <div className="flex flex-wrap gap-1.5 border-b border-gray-200 pb-4">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedDay === day
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Day {day}
              </button>
            ))}
          </div>
        </div>

        {/* Bank Meta Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Field label="Test title" value={bank.title} onChange={(v) => setBank({ ...bank, title: v })} />
          <Field label="Topic label" value={bank.topicLabel} onChange={(v) => setBank({ ...bank, topicLabel: v })} />
          <Field label="Duration (minutes)" type="number" value={bank.durationMinutes || 30} onChange={(v) => setBank({ ...bank, durationMinutes: Number(v) })} />
        </div>

        {/* Header Toolbar */}
        <div className="flex items-center justify-between py-3 mb-4 border-y border-gray-100">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-gray-900">
              Questions ({questionCount} / 30)
            </h3>
            {questionCount >= 30 ? (
              <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Complete (30)</span>
            ) : (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{30 - questionCount} needed</span>
            )}
          </div>
          {questionCount > 0 && (
            <button
              type="button"
              onClick={clearAllQuestions}
              className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={13} /> Clear All
            </button>
          )}
        </div>

        {/* Questions List */}
        <div className="space-y-5">
          {questionCount === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <Sparkles className="mx-auto text-orange-500 mb-3" size={32} />
              <p className="font-bold text-gray-700 text-base">No questions added for Day {selectedDay} yet</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto mt-1 mb-5">
                Use the Bulk Importer to paste 30 questions at once from ChatGPT or JSON, or add them manually below.
              </p>
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Open Bulk Importer
              </button>
            </div>
          ) : (
            (bank.questions || []).map((q, qi) => (
              <div key={qi} className="border border-gray-200 rounded-xl p-5 bg-white shadow-xs">
                <div className="flex justify-between items-center mb-3 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-gray-100 text-gray-700 px-2 py-1 rounded">Q{qi + 1}</span>
                    <select
                      value={q.type || 'mcq'}
                      onChange={(e) => {
                        const type = e.target.value;
                        setBank((prev) => {
                          const questions = [...prev.questions];
                          questions[qi] =
                            type === 'fill'
                              ? { id: q.id, type: 'fill', question: q.question || '', answer: q.answer || '' }
                              : {
                                  id: q.id,
                                  type: 'mcq',
                                  question: q.question || '',
                                  options: q.options || ['', '', '', ''],
                                  answer: typeof q.answer === 'number' ? q.answer : 0,
                                };
                          return { ...prev, questions };
                        });
                      }}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white font-medium"
                    >
                      <option value="mcq">MCQ (4 Options)</option>
                      <option value="fill">Fill in the Blank</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => removeQuestion(qi)} className="text-gray-400 hover:text-red-600 transition-colors p-1 cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                </div>

                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(qi, 'question', e.target.value)}
                  placeholder="Type question text..."
                  className="w-full mb-3 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500"
                />

                {q.type === 'fill' ? (
                  <div className="mt-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Correct Answer String</label>
                    <input
                      type="text"
                      value={q.answer || ''}
                      onChange={(e) => updateQuestion(qi, 'answer', e.target.value)}
                      placeholder="e.g. 1010 or 45"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-orange-50/30"
                    />
                  </div>
                ) : (
                  <div className="space-y-2 mt-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Select the correct radio option:</p>
                    {(q.options || ['', '', '', '']).map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name={`q-${qi}`}
                          checked={q.answer === oi}
                          onChange={() => updateQuestion(qi, 'answer', oi)}
                          className="h-4 w-4 text-blue-600 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-gray-400 w-5">{String.fromCharCode(65 + oi)})</span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(qi, oi, e.target.value)}
                          className={`flex-1 px-3 py-2 border rounded-xl text-sm ${
                            q.answer === oi ? 'border-green-400 bg-green-50/30 font-medium' : 'border-gray-200'
                          }`}
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Add Question Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => addQuestion('mcq')}
              className="flex-1 py-3.5 border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl text-gray-600 font-bold text-xs flex items-center justify-center gap-2 bg-gray-50/50 transition-colors cursor-pointer"
            >
              <Plus size={16} /> Add Single MCQ ({questionCount}/30)
            </button>
            <button
              type="button"
              onClick={() => addQuestion('fill')}
              className="flex-1 py-3.5 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-xl text-blue-600 font-bold text-xs flex items-center justify-center gap-2 bg-blue-50/30 transition-colors cursor-pointer"
            >
              <Plus size={16} /> Add Single Fill in Blank
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Importer Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black">Bulk Import Questions</h3>
                  <p className="text-xs text-gray-400">Import up to 30 questions at once for Day {selectedDay}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportStatus(null);
                }}
                className="text-gray-400 hover:text-black p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-4 space-y-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Paste JSON or Plain Text / AI Output:
                </label>
                <div className="flex gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setImportText(SAMPLE_TEXT_TEMPLATE)}
                    className="text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Load Text Example
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setImportText(SAMPLE_JSON_TEMPLATE)}
                    className="text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Load JSON Example
                  </button>
                </div>
              </div>

              <textarea
                rows={12}
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  if (importStatus) setImportStatus(null);
                }}
                placeholder="Paste your 30 questions here in JSON format or standard text (Q1. What is... A) ... B) ... Answer: B)..."
                className="w-full p-3.5 border border-gray-200 rounded-xl text-xs font-mono bg-gray-50 focus:bg-white focus:outline-none focus:border-orange-500"
              />

              {importStatus?.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{importStatus.error}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-gray-400">
                Supports automatic detection of questions, 4 options, and answer keys.
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyImport('replace')}
                  className="px-5 py-2.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Apply & Replace All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
      />
    </div>
  );
}
