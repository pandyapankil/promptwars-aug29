import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { StatusChip } from '../lib/ui';

interface JudgeAssignmentData {
  teamId: string;
  teamName: string;
  judgeName: string;
  status: string; // AWAITING_JUDGE | SCORED | UNDER_REVIEW
  note?: string;
  judgeSummary?: string; // from Gemini
}

export default function JudgeAssignment() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<JudgeAssignmentData[]>([]);

  useEffect(() => {
    try {
      const db = getFirebaseDb();
      const unsub = onSnapshot(collection(db, 'scores'), snap => {
        if (snap.empty) return;
        const items: JudgeAssignmentData[] = snap.docs.map(d => {
          const s = d.data();
          const name = s.teamId.split('-')[1] || s.teamId;
          const capitalName = name.charAt(0).toUpperCase() + name.slice(1);
          return {
            teamId: s.teamId,
            teamName: 'Team ' + capitalName,
            judgeName: s.judgeId === 'prof-meera' ? 'Prof. Meera Pillai' : (s.judgeId === 'dr-arjun' ? 'Dr. Arjun Rao' : 'Ms. Kavita Singh'),
            status: 'SCORED',
            judgeSummary: s.judgeSummary
          };
        });
        setAssignments(items);
      });
      return unsub;
    } catch (e) {
      console.warn('Firebase not ready', e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 pb-10">
      <nav className="border-b border-slate-700/50 px-4 md:px-6 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <span className="text-amber-400 font-bold text-sm">EP</span>
          <span className="text-sm text-slate-500">/ Organizer / Judge Assignments</span>
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Judge Assignments</h1>
          <div className="text-sm text-slate-400">Scoring Pace: 14/22</div>
        </div>

        {/* AWAITING_JUDGE state (seeded example) */}
        <div className="card-gradient p-5 border-l-4 border-amber-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-bold text-lg">Team Nexus</span>
                <StatusChip status="AWAITING_JUDGE" />
              </div>
              <p className="text-sm text-amber-400">
                unassigned for 12 min — auto-reassigned to Dr. Arjun Rao
              </p>
            </div>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-white font-medium transition-colors">
              Reassign Judge
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {assignments.map((a, i) => (
            <div key={i} className="card-gradient p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold text-lg">{a.teamName}</span>
                    <StatusChip status={a.status} />
                  </div>
                  <p className="text-sm text-slate-400">Judged by {a.judgeName}</p>
                </div>
              </div>
              
              {a.judgeSummary && (
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-400">⚡</span>
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Gemini consensus — synthesized from judge feedback</span>
                  </div>
                  <p className="text-sm text-slate-300 italic">"{a.judgeSummary}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
