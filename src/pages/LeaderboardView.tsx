import { useEffect, useState, useRef } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { StatusChip } from '../lib/ui';

interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  score: number;
  status: string;
  submittedAt: number;
  rank?: number;
}

export default function LeaderboardView() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isJudgingBehind, setIsJudgingBehind] = useState(false);
  const [isPublished, setIsPublished] = useState(false); // LEADERBOARD_LIVE
  
  const prevRanks = useRef<Record<string, number>>({});
  const [pulsingRanks, setPulsingRanks] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const db = getFirebaseDb();
      
      // Listen to stats to determine SCORING_AT_RISK
      const unsubStats = onSnapshot(doc(db, 'stats', 'live'), snap => {
        if (snap.exists()) {
          const stats = snap.data();
          // Assume behind pace if judging is less than expected (mocking the "14/22" logic)
          if (stats.judgingComplete < stats.judgingTotal) {
            setIsJudgingBehind(true);
          } else {
            setIsJudgingBehind(false);
          }
          setIsPublished(stats.judgingComplete >= stats.judgingTotal); // mock LEADERBOARD_LIVE trigger
        }
      });

      // Listen to scores
      const unsubScores = onSnapshot(collection(db, 'scores'), snap => {
        if (snap.empty) return;
        
        const scoreMap: Record<string, { total: number; count: number; earliest: number }> = {};
        snap.docs.forEach(d => {
          const s = d.data();
          if (!scoreMap[s.teamId]) {
            scoreMap[s.teamId] = { total: 0, count: 0, earliest: s.submittedAt?.toMillis() || Date.now() };
          }
          scoreMap[s.teamId].total += s.total;
          scoreMap[s.teamId].count += 1;
          const ts = s.submittedAt?.toMillis() || Date.now();
          if (ts < scoreMap[s.teamId].earliest) scoreMap[s.teamId].earliest = ts;
        });

        // Resolve team names (mock resolution)
        const newEntries: LeaderboardEntry[] = Object.keys(scoreMap).map(teamId => {
          const name = teamId.split('-')[1] || teamId;
          const capitalName = name.charAt(0).toUpperCase() + name.slice(1);
          return {
            teamId,
            teamName: 'Team ' + capitalName,
            score: scoreMap[teamId].total / scoreMap[teamId].count, // average
            status: 'SCORED',
            submittedAt: scoreMap[teamId].earliest
          };
        });

        // Sort: Score descending, Tie-breaker: earliest submittedAt ascending
        newEntries.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.submittedAt - b.submittedAt;
        });

        // Assign ranks and check changes
        const changedRanks = new Set<string>();
        const newRanks: Record<string, number> = {};
        
        newEntries.forEach((e, idx) => {
          e.rank = idx + 1;
          newRanks[e.teamId] = e.rank;
          if (prevRanks.current[e.teamId] && prevRanks.current[e.teamId] !== e.rank) {
            changedRanks.add(e.teamId);
          }
        });

        if (changedRanks.size > 0) {
          setPulsingRanks(changedRanks);
          setTimeout(() => setPulsingRanks(new Set()), 1000);
        }
        
        prevRanks.current = newRanks;
        setEntries(newEntries.slice(0, 10));
      });

      return () => {
        unsubStats();
        unsubScores();
      };
    } catch (e) {
      console.warn('Firebase not ready', e);
    }
  }, []);

  // Ensure seeded list if empty
  const displayEntries = entries.length > 0 ? entries : [
    { teamId: 'team-orion', teamName: 'Team Orion', score: 88.5, status: 'SCORED', submittedAt: 0, rank: 1 },
    { teamId: 'team-nexus', teamName: 'Team Nexus', score: 86.0, status: 'SCORED', submittedAt: 0, rank: 2 },
    { teamId: 'team-pulse', teamName: 'Team Pulse', score: 84.5, status: 'SCORED', submittedAt: 0, rank: 3 },
    { teamId: 'team-vertex', teamName: 'Team Vertex', score: 81.0, status: 'SCORED', submittedAt: 0, rank: 4 },
  ];

  return (
    <main className="min-h-screen bg-slate-900 pb-10">
      <nav className="border-b border-slate-700/50 px-4 md:px-6 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <span className="text-amber-400 font-bold text-sm">EP</span>
          <span className="text-sm text-slate-500">/ Leaderboard</span>
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Banner */}
        {isJudgingBehind && !isPublished && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
            <span className="text-red-400 text-sm font-medium">Judging pace is behind schedule.</span>
            <StatusChip status="SCORING_AT_RISK" />
          </div>
        )}
        {isPublished && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
            <span className="text-emerald-400 text-sm font-medium">Final Rankings</span>
            <StatusChip status="LEADERBOARD_LIVE" />
          </div>
        )}

        <div className="card-gradient rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
            <h1 className="text-xl font-bold text-white">Live Leaderboard</h1>
            <p className="text-xs text-slate-400">Top 10 teams. Ties broken by submission time.</p>
          </div>
          
          <ol aria-live="polite" aria-label="Live leaderboard rankings" className="divide-y divide-slate-700/30">
            {displayEntries.map(entry => {
              const isPulsing = pulsingRanks.has(entry.teamId);
              return (
                <li key={entry.teamId} className={`p-4 flex items-center justify-between transition-all ${isPulsing ? 'bg-amber-500/10 pulse-update' : 'hover:bg-slate-800/50'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 text-center font-mono font-bold text-lg ${entry.rank! <= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
                      #{entry.rank}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{entry.teamName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                        <StatusChip status={entry.status} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-white">{entry.score.toFixed(1)}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Points</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </main>
  );
}
