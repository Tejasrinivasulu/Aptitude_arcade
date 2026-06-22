import { useState } from 'react';
import { LifeBuoy, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitHelpRequest } from '../services/adminService';
import { db, isFirebaseReady } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

const ADMIN_NOTIFY_EMAIL = 'admin@aptitudearcade.com';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const formData = new FormData(e.target);
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

      formData.append('access_key', 'e3fbf152-ea11-405b-ac93-f8e6a0c10fe3');
      formData.append('subject', `[Aptitude Arcade] ${issueType} — ${student.rollNumber || student.fullName}`);
      formData.append('from_name', student.fullName || 'Aptitude Arcade Student');
      formData.append('email', student.email);
      formData.append('to_email', ADMIN_NOTIFY_EMAIL);
      formData.append('message', emailBody);

      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        e.target.reset();
      } else {
        setIsSuccess(true);
        e.target.reset();
      }
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
              Report issues during tests. Your name, time, and query are saved for admin review.
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center shadow-sm">
            <div className="flex justify-center mb-4">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Query Submitted Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Admin can see your request in the dashboard. You will be contacted if a retake is needed.
            </p>
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            >
              Submit Another Query
            </button>
          </div>
        ) : (
          <form className="space-y-4 bg-white p-6 rounded-xl border border-orange-100 shadow-sm" onSubmit={handleSubmit}>
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
                rows={6}
                placeholder="Please provide full details about what happened..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none bg-gray-50"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Submit Query'}
            </button>
            {errorMsg && <p className="text-red-500 text-sm text-center font-medium mt-2">{errorMsg}</p>}
          </form>
        )}
      </section>
    </div>
  );
}
