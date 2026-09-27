import { useState, useEffect } from 'react';
import { LifeBuoy, CheckCircle, Clock, AlertCircle, Send, MessageSquare, X, ChevronDown, ChevronUp, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitHelpRequest } from '../services/adminService';
import { auth, db, isFirebaseReady } from '../utils/firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

const WEB3FORMS_ACCESS_KEYS = [
  'e3fbf152-ea11-405b-ac93-f8e6a0c10fe3', // Primary Admin Email
  '24a932dd-1464-4246-9aba-d6d7dc1cb3d4', // Secondary Admin Email
];

function buildEmailBody({ fullName, rollNumber, email, branch, issueType, description, submittedAtIST }) {
  return [
    'Aptitude Arcade — Help Center Query',
    '-----------------------------------',
    `Student Name: ${fullName}`,
    `Roll Number: ${rollNumber}`,
    `Email: ${email}`,
    `Branch: ${branch || 'Not specified'}`,
    `Submitted (IST): ${submittedAtIST}`,
    `Issue Type: ${issueType}`,
    '',
    'Query / Description:',
    description,
    '',
    '— Sent from Aptitude Arcade Help Center',
  ].join('\n');
}

export default function HelpCenter() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [queries, setQueries] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(true);
  const [showAllQueries, setShowAllQueries] = useState(false);

  // Real-time listener for current student's help requests
  useEffect(() => {
    if (!isFirebaseReady() || !db || !user) {
      setLoadingQueries(false);
      return;
    }

    const uid = user.id || user.uid || auth?.currentUser?.uid;
    if (!uid) {
      setLoadingQueries(false);
      return;
    }

    const q = query(
      collection(db, 'help_requests'),
      where('uid', '==', uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        // Sort newest first
        list.sort((a, b) =>
          String(b.submittedAt || b.createdAt || '').localeCompare(String(a.submittedAt || a.createdAt || ''))
        );
        setQueries(list);
        setLoadingQueries(false);
      },
      (err) => {
        console.warn('Student queries listener:', err);
        setLoadingQueries(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const formEl = e.target;
    const formData = new FormData(formEl);
    const issueType = formData.get('issueType');
    const description = formData.get('description');
    const submittedAtIST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    try {
      if (!isFirebaseReady() || !user?.id) {
        throw new Error('Please log in to submit a help query.');
      }

      const profileSnap = await getDoc(doc(db, 'users', user.id));
      const profile = profileSnap.exists() ? profileSnap.data() : {};
      const student = {
        fullName: profile.fullName || user.fullName || '',
        rollNumber: profile.rollNumber || user.rollNumber || '',
        email: profile.email || user.email || '',
        branch: profile.branch || user.branch || '',
      };

      await submitHelpRequest({
        uid: user.id,
        ...student,
        issueType,
        description,
      });

      const emailBody = buildEmailBody({
        ...student,
        issueType,
        description,
        submittedAtIST,
      });

      // Deliver notification emails to both admin inboxes via Web3Forms
      try {
        for (const accessKey of WEB3FORMS_ACCESS_KEYS) {
          try {
            const body = new FormData();
            body.append('access_key', accessKey);
            body.append('subject', `[Aptitude Arcade] ${issueType} — ${student.rollNumber || student.fullName}`);
            body.append('from_name', student.fullName || 'Aptitude Arcade Student');
            body.append('email', student.email);
            body.append('message', emailBody);

            const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body });
            const result = await res.json();
            console.log(`[Web3Forms] Status for ${accessKey.slice(0, 8)}...:`, result);
          } catch (keyErr) {
            console.warn(`[Web3Forms] Failed for ${accessKey.slice(0, 8)}...:`, keyErr);
          }
          // 500ms spacing to prevent concurrent IP rate-limiting
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (e) {
        // web3forms is optional notification, Firestore entry already saved
      }

      setIsSuccess(true);
      formEl.reset();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <section className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <LifeBuoy size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support & Help Center</h1>
            <p className="text-sm text-gray-600 font-medium">
              Report issues during tests. Admin reviews your query and updates status in real-time.
            </p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {isSuccess && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 shadow-sm animate-fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle size={22} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-emerald-900">Query Submitted Successfully!</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Your query has been forwarded to the examination admin team. You can track its live status below.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="text-emerald-700 hover:text-emerald-950 p-1 rounded-lg"
              aria-label="Dismiss alert"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Live Query Status Section (if student has submitted queries) */}
        {queries.length > 0 && (
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="text-orange-500" size={20} />
                  {showAllQueries ? 'All Support Queries' : 'Latest Query Status'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {showAllQueries
                    ? `Showing all ${queries.length} submitted queries`
                    : 'Showing your most recent query. Live updates from admin appear here.'}
                </p>
              </div>

              {queries.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowAllQueries((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-xs font-bold text-orange-700 shadow-xs transition hover:bg-orange-50 hover:border-orange-300"
                >
                  <History size={14} className="text-orange-600" />
                  {showAllQueries ? (
                    <>
                      Show Latest Only <ChevronUp size={14} />
                    </>
                  ) : (
                    <>
                      View All Queries ({queries.length}) <ChevronDown size={14} />
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(showAllQueries ? queries : queries.slice(0, 1)).map((q) => {
                const isResolved = q.status === 'resolved';
                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-5 transition-all shadow-sm ${
                      isResolved
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : 'border-amber-200 bg-amber-50/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {q.issueType || 'Technical Issue'}
                        </span>
                        {q.submittedAtIST && (
                          <span className="text-xs text-gray-500">
                            • {q.submittedAtIST}
                          </span>
                        )}
                      </div>
                      <div>
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                            <CheckCircle size={14} className="text-emerald-600" />
                            Query Solved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
                            <Clock size={14} className="text-amber-600 animate-pulse" />
                            Pending Review
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 bg-white/90 p-3 rounded-lg border border-gray-100 mb-3 whitespace-pre-wrap leading-relaxed">
                      {q.query || q.description}
                    </p>

                    {isResolved ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/90 px-3.5 py-2.5 rounded-lg border border-emerald-200">
                        <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                        <span>
                          🎉 <strong>Query has been solved!</strong> Admin has reviewed and resolved this query.
                          {q.resolvedTestKey && ` A retake has been granted for Day ${q.resolvedTestKey}.`}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-100/80 px-3.5 py-2.5 rounded-lg border border-amber-200">
                        <Clock size={16} className="text-amber-600 shrink-0" />
                        <span>
                          ⏳ <strong>Under Review:</strong> Our examination admin team is reviewing your query. Once marked resolved, this status will update immediately.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {queries.length > 1 && !showAllQueries && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllQueries(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-800 hover:underline transition-colors"
                >
                  <ChevronDown size={14} /> View previous {queries.length - 1} {queries.length - 1 === 1 ? 'query' : 'queries'}
                </button>
              </div>
            )}
            {queries.length > 1 && showAllQueries && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllQueries(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 hover:underline transition-colors"
                >
                  <ChevronUp size={14} /> Collapse to latest query only
                </button>
              </div>
            )}
          </div>
        )}

        {/* Submit Query Form */}
        <div className="bg-white p-6 rounded-xl border border-orange-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Send size={18} className="text-orange-500" />
            {queries.length > 0 ? 'Submit Another Query' : 'Submit a Query'}
          </h3>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p><span className="font-bold text-gray-500">Name:</span> {user?.fullName || '—'}</p>
              <p><span className="font-bold text-gray-500">Roll No:</span> {user?.rollNumber || '—'}</p>
              <p className="sm:col-span-2"><span className="font-bold text-gray-500">Email:</span> {user?.email || '—'}</p>
            </div>

            <div>
              <label htmlFor="issueType" className="block text-sm font-semibold text-gray-700 mb-1">
                What kind of issue are you facing?
              </label>
              <select
                id="issueType"
                name="issueType"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 bg-gray-50"
              >
                <option value="">Select an issue type...</option>
                <option value="Test didn't load">Test didn&apos;t load</option>
                <option value="Camera verification failed">Camera verification failed</option>
                <option value="Answers not saving">Answers not saving</option>
                <option value="Auto-submitted / tab switch">Auto-submitted / tab switch</option>
                <option value="Question error">Error in a question</option>
                <option value="Request exam reschedule">Request exam reschedule</option>
                <option value="Other">Other technical issue</option>
              </select>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                Describe your query
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                placeholder="Please provide full details about what happened..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none bg-gray-50"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {isSubmitting ? 'Sending...' : 'Submit Query'}
            </button>
            {errorMsg && <p className="text-red-500 text-sm text-center font-medium mt-2">{errorMsg}</p>}
          </form>
        </div>
      </section>
    </div>
  );
}
