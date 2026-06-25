import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Maximize,
  MonitorOff,
  Send,
  Shield,
  Wifi,
  WifiOff,
  X,
  RefreshCw,
  User,
  Timer,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudentProgress } from '../context/StudentProgressContext';
import { useExamSecurity, MAX_TAB_VIOLATIONS } from '../hooks/useExamSecurity';
import { useFaceMonitoring } from '../hooks/useFaceMonitoring';
import { getExamMeta } from '../data/examQuestions';
import { getAssignedTestSummary, getTestAvailability, getTodaysAssignedDay } from '../data/testSchedule';
import { startExam, submitExam } from '../services/examService';
import ProctorCamera from '../components/exam/ProctorCamera';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function SecurityBadge({ ok, icon: Icon, label, warn }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
        ok ? 'bg-green-50 text-green-700' : warn ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
      }`}
      title={label}
    >
      <Icon size={14} />
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

export default function Exam() {
  const navigate = useNavigate();
  const { progress, markTestSubmitted } = useStudentProgress();

  const testKey = sessionStorage.getItem('exam_test_key') || String(getTodaysAssignedDay());
  
  // Use metadata for the setup UI
  const examMeta = useMemo(() => getExamMeta(testKey), [testKey]);
  const assignedSummary = useMemo(
    () => (testKey === 'finale' ? null : getAssignedTestSummary(Number(testKey))),
    [testKey]
  );

  const { totalQuestions: defaultTotal, durationSeconds: defaultDuration, title, topicLabel } = examMeta;
  const displayTopic = testKey === 'finale' ? topicLabel : assignedSummary?.topicLabel || progress.todayTopic;

  const [phase, setPhase] = useState('setup');
  const [serverSession, setServerSession] = useState(null); // Will hold questions & sessionId
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => Array(defaultTotal).fill(null));
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  
  const [centerWarning, setCenterWarning] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [faceWarnings, setFaceWarnings] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [serverError, setServerError] = useState('');

  const submittingRef = useRef(false);
  const tabViolationsRef = useRef(0);
  const faceWarningsRef = useRef(0);

  const submitExamRef = useRef(null);

  const handleFinalSubmit = useCallback(
    async (autoSubmit = false, submitReason = 'manual') => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);

      try {
        const result = await submitExam({
          testKey,
          answers,
          sessionId: serverSession?.sessionId || '',
          violations: {
            tabViolations: tabViolationsRef.current,
            faceWarnings: faceWarningsRef.current,
            autoSubmit,
            submitReason,
          },
        });

        const enriched = {
          ...result,
          title: result.title || title,
          answers: result.userAnswers || answers,
          userAnswers: result.userAnswers || answers,
          tabViolations: result.tabViolations ?? tabViolationsRef.current,
          faceWarnings: result.faceWarnings ?? faceWarningsRef.current,
          submitReason: result.submitReason || submitReason,
        };

        markTestSubmitted(testKey, enriched);

        sessionStorage.removeItem('exam_verified');
        sessionStorage.removeItem('exam_test_key');
        sessionStorage.removeItem('exam_in_progress');

        stopCameraRef.current?.();
        if (document.fullscreenElement) {
          await document.exitFullscreen().catch(() => {});
        }

        navigate('/student/results', {
          replace: true,
          state: { examSubmitted: true, ...enriched },
        });
      } catch (err) {
        alert('Failed to submit exam: ' + err.message);
        setSubmitting(false);
        submittingRef.current = false;
        setShowSubmitModal(false);
      }
    },
    [answers, markTestSubmitted, navigate, serverSession, testKey, title]
  );

  submitExamRef.current = handleFinalSubmit;

  const handleViolation = useCallback((type, count) => {
    if (type === 'tab') {
      tabViolationsRef.current = count;
      if (count >= MAX_TAB_VIOLATIONS) {
        setCenterWarning({
          type: 'tab',
          message: `Maximum ${MAX_TAB_VIOLATIONS} tab switches reached. Test is being auto-submitted.`,
        });
        return;
      }
      setCenterWarning({
        type: 'tab',
        message: `Tab switch detected! Violation ${count}/${MAX_TAB_VIOLATIONS}. Stay on the exam window.`,
      });
    }
  }, []);

  const handleTabLimitExceeded = useCallback(() => {
    submitExamRef.current?.(true, 'tab_limit');
  }, []);

  const handleFaceTurn = useCallback((direction, count) => {
    if (direction !== 'left' && direction !== 'right') return;
    faceWarningsRef.current = count;
    setFaceWarnings(count);
    setCenterWarning({
      type: 'face',
      message:
        direction === 'left'
          ? `Face turned left — please look at the screen. (Warning ${count})`
          : `Face turned right — please look at the screen. (Warning ${count})`,
    });
  }, []);

  const { videoRef, security, initializeSecurity, enableFullscreen, stopCamera } = useExamSecurity({
    enabled: phase === 'active',
    onViolation: handleViolation,
    onTabLimitExceeded: handleTabLimitExceeded,
  });

  const stopCameraRef = useRef(stopCamera);
  stopCameraRef.current = stopCamera;

  const faceStatus = useFaceMonitoring(videoRef, phase === 'active' && security.camera, handleFaceTurn);

  useEffect(() => {
    faceWarningsRef.current = faceWarnings;
  }, [faceWarnings]);

  useEffect(() => {
    const verified = sessionStorage.getItem('exam_verified') === 'true';
    const inProgress = sessionStorage.getItem('exam_in_progress') === 'true';

    if (!verified) {
      navigate('/student/take-test', { replace: true });
      return;
    }

    if (!inProgress) {
      const availability = getTestAvailability({
        testKey,
        attemptedTests: progress.attemptedTests,
        rescheduledTests: progress.rescheduledTests || {},
        currentDay: getTodaysAssignedDay(),
      });

      if (!availability.canStart) {
        navigate('/student/take-test', { replace: true });
      }
    }
  }, [navigate, progress, testKey]);

  useEffect(() => {
    if (phase !== 'active') return undefined;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 'active' && timeLeft === 0) {
      submitExamRef.current?.(true, 'time_up');
    }
  }, [phase, timeLeft]);

  const handleStartClick = async () => {
    setServerError('');
    setPhase('active');
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const ready = await initializeSecurity();
    
    if (ready) {
      try {
        // Fetch session and questions from Cloud Functions
        const sessionData = await startExam(testKey);
        setServerSession(sessionData);
        setTimeLeft(sessionData.durationSeconds);
        setAnswers(Array(sessionData.totalQuestions).fill(null));
        
        sessionStorage.setItem('exam_in_progress', 'true');
        setCenterWarning(null);
        tabViolationsRef.current = 0;
        faceWarningsRef.current = 0;
        setFaceWarnings(0);
      } catch (err) {
        const msg = err?.message || 'Could not start exam.';
        setServerError(msg);
        setPhase('setup');
        stopCamera();
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } else {
      setPhase('setup');
    }
  };

  const isLowTime = timeLeft <= 300;
  const questions = serverSession?.questions || [];
  const currentQuestion = questions[currentIndex];
  const answeredCount = answers.filter((a) => a !== null && a !== '').length;
  const actualTotalQuestions = serverSession?.totalQuestions || defaultTotal;

  if (phase === 'setup') {
    const checks = [
      { id: 'internet', icon: Wifi, label: 'Stable Internet Connection', badge: 'REQUIRED' },
      { id: 'camera', icon: Camera, label: 'Continuous Camera Proctoring', badge: 'REQUIRED' },
      { id: 'fullscreen', icon: Maximize, label: 'Fullscreen Mode Enforcement', badge: 'REQUIRED' },
      { id: 'tabswitch', icon: MonitorOff, label: 'Strict Tab Switch Monitoring', badge: 'ENFORCED' },
    ];

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4">
        <div className="w-full max-w-lg rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-2xl shadow-zinc-950/10">
          
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-zinc-300/40 animate-sonar" />
              <div className="absolute inset-0 rounded-full bg-zinc-300/30 animate-sonar-delay-1" />
              <div className="absolute inset-0 rounded-full bg-zinc-300/25 animate-sonar-delay-2" />
              <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-white shadow-md border border-zinc-800">
                <Shield size={16} className="animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 leading-none">
                Exam Security Setup
              </p>
              <h1 className="mt-1.5 text-xl font-black tracking-tight text-zinc-900">
                Entering the Arena
              </h1>
            </div>
          </div>

          <div className="mb-5 space-y-2.5">
            {checks.map(({ id, icon: Icon, label, badge }) => (
              <div
                key={id}
                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50/40 p-4 text-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-zinc-600 shrink-0" />
                  <span className="text-xs font-bold text-zinc-900">{label}</span>
                </div>
                <span className="shrink-0 px-2.5 py-0.5 rounded text-[9px] font-extrabold bg-zinc-850 text-white tracking-widest uppercase shadow-sm">
                  {badge}
                </span>
              </div>
            ))}
          </div>

          <div className="mb-5 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50/40 p-2.5 text-center transition-all duration-300 hover:bg-amber-50/70">
              <RefreshCw size={14} className="text-amber-600 mb-1" />
              <span className="text-[9px] font-bold text-amber-800 leading-tight">3 tab switches = auto-submit</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50/60 p-2.5 text-center transition-all duration-300 hover:bg-zinc-100/60">
              <User size={14} className="text-zinc-500 mb-1" />
              <span className="text-[9px] font-bold text-zinc-800 leading-tight">Face turn = warning</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/40 p-2.5 text-center transition-all duration-300 hover:bg-red-50/70">
              <Timer size={14} className="text-red-500 mb-1" />
              <span className="text-[9px] font-bold text-red-800 leading-tight">Time up = auto-submit</span>
            </div>
          </div>

          {security.error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-950 animate-shake">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-650" />
              <p className="font-semibold">{security.error}</p>
            </div>
          )}

          {serverError && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-950 animate-shake">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-650" />
              <p className="font-semibold">{serverError}</p>
            </div>
          )}

          <div className="mb-6 rounded-2xl bg-zinc-950 p-5 text-white shadow-xl relative overflow-hidden border border-zinc-850">
            <div className="flex flex-col gap-2">
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-500">Target Assignment</p>
              <h3 className="text-lg font-black tracking-tight text-white leading-tight">
                {title}
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {displayTopic.split(' · ').map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-zinc-850 px-2.5 py-0.5 text-[9px] font-bold text-zinc-300 border border-zinc-800 shadow-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-900 pt-3">
                <span className="font-mono text-xs font-black tracking-wider text-zinc-100">
                  {defaultTotal}Q &middot; {defaultDuration / 60}MIN
                </span>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                  Live Server Scoring
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('exam_verified');
                sessionStorage.removeItem('exam_test_key');
                navigate('/student/take-test');
              }}
              className="px-5 rounded-xl border border-zinc-200 py-3 text-sm font-semibold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex-1">
              <button
                type="button"
                onClick={handleStartClick}
                disabled={security.loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-black text-white py-3.5 text-sm font-extrabold shadow-lg shadow-zinc-950/10 hover:shadow-zinc-950/20 transition-all border border-zinc-850 cursor-pointer disabled:opacity-75 animate-pulse-glow"
              >
                {security.loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-zinc-400" />
                    <span>Entering Arena...</span>
                  </>
                ) : (
                  <>
                    <span>Begin Examination</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex min-h-screen flex-col bg-[#f8fafc] select-none"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
    >
      {security.loading && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-white/90">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm font-medium text-gray-700">Starting camera & fullscreen...</p>
          </div>
        </div>
      )}

      {!security.fullscreen && !security.loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
          <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <Maximize size={32} className="mx-auto text-primary" />
            <h2 className="mt-3 text-lg font-bold text-gray-900">Fullscreen Required</h2>
            <p className="mt-2 text-sm text-gray-600">
              The exam must run in fullscreen mode. Please re-enter fullscreen to continue.
            </p>
            <button
              type="button"
              onClick={enableFullscreen}
              className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Enter Fullscreen
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">{title}</p>
            <h1 className="text-sm font-bold text-gray-900 sm:text-base">{displayTopic}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SecurityBadge ok={security.internet} icon={security.internet ? Wifi : WifiOff} label="Online" />
            <SecurityBadge ok={security.camera} icon={Camera} label="Camera" />
            <SecurityBadge ok={security.fullscreen} icon={Maximize} label="Fullscreen" warn={!security.fullscreen} />
            <SecurityBadge
              ok={security.tabViolations < MAX_TAB_VIOLATIONS}
              icon={MonitorOff}
              label={`Tab: ${security.tabViolations}/${MAX_TAB_VIOLATIONS}`}
              warn={security.tabViolations > 0}
            />
            <div
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold ${
                isLowTime ? 'bg-red-50 text-red-700' : 'bg-primary/10 text-primary'
              }`}
            >
              <Clock size={16} />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      {centerWarning && phase === 'active' && (
        <div className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center p-4">
          <div
            className={`pointer-events-auto max-w-md w-full rounded-2xl border-2 bg-white/95 p-6 shadow-2xl text-center ${
              centerWarning.type === 'tab' && security.tabViolations >= MAX_TAB_VIOLATIONS
                ? 'border-red-400'
                : 'border-amber-400'
            }`}
          >
            <AlertTriangle
              size={32}
              className={`mx-auto mb-3 ${
                centerWarning.type === 'tab' && security.tabViolations >= MAX_TAB_VIOLATIONS
                  ? 'text-red-600'
                  : 'text-amber-600'
              }`}
            />
            <p className="text-sm font-semibold text-amber-900">{centerWarning.message}</p>
            <div className="mt-4 flex justify-center gap-4 text-xs font-bold text-gray-600">
              <span>Tab switches: {security.tabViolations}/{MAX_TAB_VIOLATIONS}</span>
              <span>Face warnings: {faceWarnings}</span>
            </div>
            <button
              type="button"
              onClick={() => setCenterWarning(null)}
              className="mt-4 text-xs text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {currentQuestion ? (
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4 pb-36 lg:flex-row">
          <section className="flex-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Question {currentIndex + 1} of {actualTotalQuestions}
              </span>
              <span className="text-xs text-gray-500">{answeredCount} answered</span>
            </div>

            <h2 className="text-base font-semibold leading-relaxed text-gray-900 sm:text-lg">
              {currentQuestion.question}
            </h2>

            <div className="mt-6 space-y-3">
              {currentQuestion.type === 'fill' ? (
                <input
                  type="text"
                  value={answers[currentIndex] ?? ''}
                  onChange={(e) =>
                    setAnswers((prev) => {
                      const next = [...prev];
                      next[currentIndex] = e.target.value;
                      return next;
                    })
                  }
                  disabled={submitting}
                  placeholder="Type your answer"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              ) : (
                (currentQuestion.options || []).map((option, optionIndex) => {
                  const selected = answers[currentIndex] === optionIndex;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => {
                          const next = [...prev];
                          next[currentIndex] = optionIndex;
                          return next;
                        })
                      }
                      disabled={submitting}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        selected
                          ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                          : 'border-gray-200 text-gray-700 hover:border-primary/30 hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          selected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      {option}
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0 || submitting}
                className="flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {currentIndex < actualTotalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((i) => Math.min(actualTotalQuestions - 1, i + 1))}
                  disabled={submitting}
                  className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  disabled={submitting}
                  className="flex items-center gap-1 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-70"
                >
                  <Send size={16} /> Submit Exam
                </button>
              )}
            </div>
          </section>

          <aside className="w-full shrink-0 lg:w-72">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-bold text-gray-900">Question Palette</p>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, idx) => {
                  const answered = answers[idx] !== null && answers[idx] !== '';
                  const active = idx === currentIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      disabled={submitting}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                        active
                          ? 'bg-primary text-white ring-2 ring-primary/30'
                          : answered
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                disabled={submitting}
                className="mt-4 w-full rounded-xl border border-green-600 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:opacity-70"
              >
                Submit Exam
              </button>
            </div>
          </aside>
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary w-10 h-10" />
        </div>
      )}

      <ProctorCamera videoRef={videoRef} cameraOk={security.camera} faceStatus={faceStatus} />

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSubmitModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900">Finish Assessment?</h2>
            <p className="mt-1 text-xs text-gray-500">Please review your submission details before submitting.</p>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-gray-50 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Answered</p>
                <p className="mt-1 text-base font-bold text-green-600">{answeredCount} / {actualTotalQuestions}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Time Left</p>
                <p className="mt-1 text-base font-bold text-primary">{formatTime(timeLeft)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Violations</p>
                <p className="mt-1 text-base font-bold text-amber-600">{security.tabViolations + faceWarnings}</p>
              </div>
            </div>

            {actualTotalQuestions - answeredCount > 0 && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3 text-xs text-amber-800">
                <span className="text-sm leading-none">⚠️</span>
                <div>
                  <p className="font-semibold">Unanswered Questions Detected</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700">
                    You have left {actualTotalQuestions - answeredCount} questions blank. Once submitted, your answers cannot be modified.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <HoldToSubmitButton 
                onComplete={() => {
                  setShowSubmitModal(false);
                  handleFinalSubmit(false, 'manual');
                }} 
                disabled={submitting} 
              />
              
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition cursor-pointer"
              >
                Go Back &amp; Review
              </button>
            </div>
          </div>
        </div>
      )}

      {submitting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm font-medium text-gray-700">Submitting exam & scoring...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function HoldToSubmitButton({ onComplete, disabled }) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const startHold = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const startTime = Date.now();
    const duration = 1200;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      
      if (pct >= 100) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        onComplete();
      }
    }, 30);
  };

  const endHold = (e) => {
    e.preventDefault();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    let current = progress;
    intervalRef.current = setInterval(() => {
      current = Math.max(0, current - 8);
      setProgress(current);
      if (current === 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 15);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const holding = progress > 0;

  return (
    <button
      type="button"
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      disabled={disabled}
      className="relative w-full overflow-hidden rounded-xl bg-green-600 py-3 text-xs font-semibold text-white shadow-md shadow-green-200 select-none cursor-pointer transition active:scale-[0.99] disabled:opacity-50"
    >
      <div 
        className="absolute bottom-0 left-0 top-0 bg-green-700 transition-all duration-75"
        style={{ width: `${progress}%` }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {holding ? (
          <span>Hold to Submit... {Math.round(progress)}%</span>
        ) : (
          <span>Press &amp; Hold to Submit Exam</span>
        )}
      </span>
    </button>
  );
}
