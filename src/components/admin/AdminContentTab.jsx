import { useEffect, useRef, useState } from 'react';
import { FileText, Save, Plus, Trash2 } from 'lucide-react';
import { listenToQuestionBank, publishQuestionBank } from '../../services/adminService';
import { DAY_TOPICS } from '../../utils/adminData';
import { DAY1_QUESTION_BANK } from '../../data/day1QuestionBank';

const DAYS = ['1', '2', '3', '4', '5', '6', '7'];

export default function AdminContentTab() {
  const [selectedDay, setSelectedDay] = useState('1');
  const [bank, setBank] = useState(null);
  const [saving, setSaving] = useState(false);
  const day1AutoPublished = useRef(false);

  useEffect(() => {
    const unsub = listenToQuestionBank(selectedDay, (data) => {
      setBank(
        data || {
          title: `Day ${selectedDay} Assessment`,
          topicLabel: DAY_TOPICS[selectedDay] || `Day ${selectedDay}`,
          durationMinutes: selectedDay === '1' ? 30 : 20,
          questions: [],
          lastPublishedAt: null,
        }
      );
    });
    return unsub;
  }, [selectedDay]);

  useEffect(() => {
    if (selectedDay !== '1' || day1AutoPublished.current || !bank) return;
    if (bank.lastPublishedAt || (bank.questions?.length || 0) >= 30) return;
    day1AutoPublished.current = true;
    publishQuestionBank('1', DAY1_QUESTION_BANK).catch(() => {
      day1AutoPublished.current = false;
    });
  }, [selectedDay, bank]);

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

  const handlePublish = async () => {
    setSaving(true);
    try {
      const published = await publishQuestionBank(selectedDay, bank);
      setBank(published);
      alert('Question bank published to Firebase. Students will see updates on next exam start.');
    } catch (err) {
      alert(`Publish failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!bank) {
    return <div className="p-12 text-center text-gray-500">Loading question bank...</div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <FileText className="text-blue-600" size={24} /> Content Manager
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {bank.lastPublishedAt ? `Last published: ${new Date(bank.lastPublishedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}` : 'Not published yet'}
          </p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={handlePublish}
          className="flex items-center gap-2 px-6 py-2.5 bg-black text-white font-bold text-sm rounded-xl hover:bg-gray-900 disabled:opacity-60"
        >
          <Save size={16} /> {saving ? 'Publishing...' : 'Publish Changes'}
        </button>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg text-sm font-bold ${selectedDay === day ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Day {day}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Field label="Test title" value={bank.title} onChange={(v) => setBank({ ...bank, title: v })} />
          <Field label="Topic label" value={bank.topicLabel} onChange={(v) => setBank({ ...bank, topicLabel: v })} />
          <Field label="Duration (minutes)" type="number" value={bank.durationMinutes} onChange={(v) => setBank({ ...bank, durationMinutes: Number(v) })} />
        </div>

        <div className="space-y-6">
          {(bank.questions || []).map((q, qi) => (
            <div key={qi} className="border border-gray-200 rounded-xl p-5">
              <div className="flex justify-between items-center mb-3 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">Q{qi + 1}</span>
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
                                answer: q.answer ?? 0,
                              };
                        return { ...prev, questions };
                      });
                    }}
                    className="text-xs border border-gray-200 rounded px-2 py-1"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="fill">Fill in the Blank</option>
                  </select>
                </div>
                <button type="button" onClick={() => removeQuestion(qi)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
              </div>
              <input
                type="text"
                value={q.question}
                onChange={(e) => updateQuestion(qi, 'question', e.target.value)}
                placeholder="Question text"
                className="w-full mb-4 px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold"
              />
              {q.type === 'fill' ? (
                <input
                  type="text"
                  value={q.answer || ''}
                  onChange={(e) => updateQuestion(qi, 'answer', e.target.value)}
                  placeholder="Correct answer"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              ) : (
                (q.options || []).map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2 mb-2">
                    <input type="radio" name={`q-${qi}`} checked={q.answer === oi} onChange={() => updateQuestion(qi, 'answer', oi)} />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder={`Option ${oi + 1}`}
                    />
                  </div>
                ))
              )}
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => addQuestion('mcq')} className="flex-1 py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-bold text-sm flex items-center justify-center gap-2 hover:border-gray-400 bg-gray-50">
              <Plus size={18} /> Add MCQ ({bank.questions?.length || 0}/30)
            </button>
            <button type="button" onClick={() => addQuestion('fill')} className="flex-1 py-4 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 font-bold text-sm flex items-center justify-center gap-2 hover:border-blue-400 bg-blue-50/50">
              <Plus size={18} /> Add Fill in Blank
            </button>
          </div>
        </div>
      </div>
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
