import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { StatusChip } from '../lib/ui';

interface Match {
  name: string;
  skills: string[];
  reason: string;
  fit: number;
  participantId: string;
}

const UNTEAMED_EXAMPLE = {
  name: 'Dev Patel',
  skills: ['DevOps', 'Docker', 'Kubernetes'],
  status: 'UNTEAMED',
  note: 'Teamless past 11:00 AM deadline — see walk-in matching desk, Hall B',
};

const SEEDED_MATCHES: Match[] = [
  {
    participantId: 'uid-rohan',
    name: 'Rohan Kulkarni',
    skills: ['PyTorch', 'CI/CD', 'Python'],
    reason: 'Strong PyTorch + CI/CD background; needs a UI/UX person — 92% fit',
    fit: 92,
  },
  {
    participantId: 'uid-rahul',
    name: 'Rahul Verma',
    skills: ['Node.js', 'Express', 'Firebase'],
    reason: 'Full backend coverage with Firebase expertise; complements your design skills — 88% fit',
    fit: 88,
  },
  {
    participantId: 'uid-sneha',
    name: 'Sneha Iyer',
    skills: ['React Native', 'GraphQL', 'AWS'],
    reason: 'Cross-platform focus + GraphQL; your Figma + React Native combo is ideal — 81% fit',
    fit: 81,
  },
];

export default function FindMyTeam() {
  const navigate = useNavigate();

  const [skills, setSkills] = useState('React, Figma, CSS');
  const [role, setRole] = useState('UI/UX Designer');
  const [interests, setInterests] = useState('AI/ML tools, Productivity apps');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitedId, setInvitedId] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState<string | null>(null);

  async function runGeminiMatch() {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, role, interests }),
      });
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches ?? SEEDED_MATCHES);
      } else {
        setMatches(SEEDED_MATCHES);
      }
    } catch {
      setMatches(SEEDED_MATCHES);
    } finally {
      setLoading(false);
    }
  }

  // Auto-run on mount to show matches immediately
  useEffect(() => {
    setMatches(SEEDED_MATCHES);
    // Try to fetch live Gemini matches in background
    runGeminiMatch();
  }, []);

  async function handleInvite(match: Match) {
    setInviteLoading(match.participantId);
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, 'participants', match.participantId), {
        teamId: 'team-forming-ishita',
      });
      await updateDoc(doc(db, 'participants', 'uid-ishita'), {
        teamId: 'team-forming-ishita',
      });
    } catch (e) {
      console.warn('Firestore updateDoc skipped (using local state):', e);
    } finally {
      setInvitedId(match.participantId);
      setInviteLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Nav */}
      <nav className="border-b border-slate-700/50 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/participant')} className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
          ← Participant Home
        </button>
        <span className="text-emerald-400 text-sm font-semibold">⚡ AI Teammate Finder</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Gemini banner */}
        <div className="rounded-xl px-4 py-3 bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
          <span className="text-xl">⚡</span>
          <p className="text-sm text-amber-300">
            <span className="font-semibold">Powered by Gemini AI</span> — ranks candidates by skills fit and writes a one-line match reason for each
          </p>
        </div>

        {/* Profile for Ishita Rao */}
        <div className="card-gradient">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-lg font-bold text-emerald-400">I</div>
            <div>
              <div className="font-semibold text-white">Ishita Rao</div>
              <div className="flex items-center gap-1.5">
                <StatusChip status="CHECKED_IN" />
                <StatusChip status="SOLO" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">My Skills</label>
              <input
                id="input-skills"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                value={skills}
                onChange={e => setSkills(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">Role</label>
              <input
                id="input-role"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                value={role}
                onChange={e => setRole(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">Project Interests</label>
              <input
                id="input-interests"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                value={interests}
                onChange={e => setInterests(e.target.value)}
              />
            </div>
            <button
              id="btn-find-matches"
              onClick={runGeminiMatch}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm transition-all disabled:opacity-60"
            >
              {loading ? '⚡ Gemini is ranking matches…' : '⚡ Find Matches with Gemini AI'}
            </button>
          </div>
        </div>

        {/* Gemini match results */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            ⚡ Gemini AI Matches
          </h2>
          <div className="space-y-3">
            {matches.map((m, i) => (
              <div
                key={m.participantId}
                className={`card-gradient ${i === 0 ? 'gradient-border-emerald' : ''} transition-all animate-slide-up`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-sm font-bold text-emerald-400 shrink-0">
                      {m.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-white text-sm">{m.name}</span>
                        <span className="status-chip bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs">
                          ⚡ Gemini match
                        </span>
                        <span className="text-xs font-bold text-emerald-400">{m.fit}% fit</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {m.skills.map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 bg-slate-900/60 text-slate-400 rounded border border-slate-700">{s}</span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 italic">"{m.reason}"</p>
                    </div>
                  </div>

                  {i === 0 && (
                    <button
                      id={`btn-invite-${m.participantId}`}
                      onClick={() => handleInvite(m)}
                      disabled={!!invitedId || !!inviteLoading}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                        ${invitedId === m.participantId
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'
                        } disabled:opacity-70`}
                    >
                      {inviteLoading === m.participantId ? 'Sending…'
                        : invitedId === m.participantId ? '✓ TEAM_FORMING'
                        : 'Invite to team'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UNTEAMED recovery state */}
        <div className="card border border-orange-500/30 bg-orange-500/5">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">⚠️</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white text-sm">{UNTEAMED_EXAMPLE.name}</span>
                <StatusChip status="UNTEAMED" />
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {UNTEAMED_EXAMPLE.skills.map(s => (
                  <span key={s} className="text-xs px-1.5 py-0.5 bg-slate-900/60 text-slate-500 rounded border border-slate-700">{s}</span>
                ))}
              </div>
              <p className="text-xs text-orange-400">{UNTEAMED_EXAMPLE.note}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
