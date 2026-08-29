import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, getDoc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { StatusChip, formatCountdown, formatTime } from '../lib/ui';
import { Team, Score } from '../lib/types';

interface ScoredHistory {
  id: string;
  teamName: string;
  total: number;
  submittedAt: any;
}

export default function JudgeQueue() {
  const navigate = useNavigate();

  const [activeTeam, setActiveTeam] = useState<{ id: string; name: string; projectLink: string | null } | null>({
    id: 'team-orion',
    name: 'Team Orion',
    projectLink: 'github.com/orion/hackproject',
  });
  const [history, setHistory] = useState<ScoredHistory[]>([]);
  const [countdown, setCountdown] = useState('00:31:00');
  
  // Rubric state
  const [rubric, setRubric] = useState({ functionality: 0, innovation: 0, presentation: 0, implementation: 0 });
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalScore = rubric.functionality + rubric.innovation + rubric.presentation + rubric.implementation;

  const JUDGING_CUTOFF = new Date(Date.now() + 31 * 60 * 1000);

  useEffect(() => {
    function tick() {
      setCountdown(formatCountdown(JUDGING_CUTOFF.getTime() - Date.now()));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch history (mock seeded history for this judge)
  useEffect(() => {
    try {
      const db = getFirebaseDb();
      const unsub = onSnapshot(collection(db, 'scores'), snap => {
        if (!snap.empty) {
          const items = snap.docs
            .map(d => ({ id: d.id, ...d.data() } as any))
            .filter(s => s.judgeId === 'prof-meera')
            .map(s => ({
              id: s.id,
              teamName: 'Team ' + s.teamId.split('-')[1], // mock name resolution
              total: s.total,
              submittedAt: s.submittedAt
            }));
          setHistory(items);
        }
      });
      return unsub;
    } catch (e) {
      console.warn('Firebase not ready', e);
    }
  }, []);

  const handleSubmit = async () => {
    if (!activeTeam) return;
    setIsSubmitting(true);
    try {
      const db = getFirebaseDb();
      
      // Call Gemini for summary via our new endpoint
      let judgeSummary = '';
      try {
        const res = await fetch('/api/judge-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback })
        });
        const data = await res.json();
        judgeSummary = data.summary;
      } catch (err) {
        console.error('Failed to fetch Gemini summary', err);
      }

      try {
        // 1. Write Score
        await addDoc(collection(db, 'scores'), {
          teamId: activeTeam.id,
          judgeId: 'prof-meera',
          criteria: rubric,
          total: totalScore,
          feedback,
          judgeSummary,
          submittedAt: serverTimestamp()
        });

        // 2. Update Team submissionStatus
        await updateDoc(doc(db, 'teams', activeTeam.id), {
          submissionStatus: 'SCORED'
        });

        // 3. Increment Judging Counter in Stats
        await updateDoc(doc(db, 'stats', 'live'), {
          judgingComplete: increment(1)
        });
      } catch (writeErr) {
        console.warn('Firestore write skipped (using optimistic UI):', writeErr);
      }

      // Mock moving to next submission
      setActiveTeam(null); // Wait for next in queue
      setRubric({ functionality: 0, innovation: 0, presentation: 0, implementation: 0 });
      setFeedback('');
    } catch (e) {
      console.error('Submit error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-10">
      <nav className="border-b border-slate-700/50 px-4 md:px-6 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <span className="text-violet-400 font-bold text-sm">EP</span>
          <span className="text-sm text-slate-500">/ Judge</span>
        </button>
        <div className="flex items-center gap-2">
          <StatusChip status="JUDGE_OVERDUE" />
          <span className="text-sm text-slate-400">Prof. Meera Pillai</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div className="card-gradient rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white mb-1">Your Queue — 8 submissions to score</h1>
            <p className="text-sm text-slate-400">Judging cutoff: 3:30 PM | Time remaining: <span className="font-mono text-violet-400">{countdown}</span></p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
            <span>⚠</span> 3 submissions unscored — organizer has been notified
          </div>
        </div>

        {activeTeam ? (
          <div className="card-gradient p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{activeTeam.name}</h2>
                <p className="text-sm text-slate-400 mb-2">PulseBoard — AI Event Orchestrator</p>
                <a href={`https://${activeTeam.projectLink}`} target="_blank" rel="noreferrer" className="text-sm text-violet-400 hover:text-violet-300">
                  View Project Files ↗
                </a>
              </div>
              <div className="text-right">
                <div className="text-4xl font-mono font-bold text-white">{totalScore}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Total Score</div>
              </div>
            </div>

            <div className="space-y-6">
              {['functionality', 'innovation', 'presentation', 'implementation'].map(crit => (
                <div key={crit}>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm text-slate-300 capitalize">{crit}</label>
                    <span className="text-sm font-mono text-slate-400">
                      {rubric[crit as keyof typeof rubric]} / 25
                    </span>
                  </div>
                  <input 
                    type="range" min="0" max="25" 
                    value={rubric[crit as keyof typeof rubric]}
                    onChange={e => setRubric(r => ({ ...r, [crit]: parseInt(e.target.value) }))}
                    className="w-full accent-violet-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm text-slate-300 mb-2">Constructive Feedback</label>
                <textarea 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-violet-500 focus:outline-none"
                  rows={4}
                  placeholder="Provide feedback here..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || totalScore === 0}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-sm transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Score'}
              </button>
            </div>
          </div>
        ) : (
          <div className="card-gradient p-12 text-center text-slate-500">
            You have cleared your active queue.
          </div>
        )}

        {/* History */}
        <details className="card-gradient rounded-xl p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-300 flex justify-between items-center outline-none">
            Recently Scored ({history.length})
          </summary>
          <div className="mt-4 space-y-2">
            {history.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <span className="text-sm text-white font-medium">{item.teamName}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">{item.submittedAt ? formatTime(item.submittedAt) : ''}</span>
                  <span className="text-sm font-mono text-violet-400 font-bold">{item.total} pts</span>
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
