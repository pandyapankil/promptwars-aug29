import { useNavigate } from 'react-router-dom';
import { getFirebaseAuth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';

const DEMO_ROLES = [
  {
    role: 'Participant',
    email: 'participant@demo.com',
    password: 'demo1234',
    color: 'emerald',
    path: '/participant',
    icon: '🎯',
    desc: 'Check in, find teammates, track your submission',
    accent: 'gradient-border-emerald glow-emerald',
    btnCls: 'bg-emerald-500 hover:bg-emerald-400',
    tagCls: 'bg-emerald-500/20 text-emerald-400',
  },
  {
    role: 'Judge',
    email: 'judge@demo.com',
    password: 'demo1234',
    color: 'violet',
    path: '/live-ops',
    icon: '⚖️',
    desc: 'Score submissions, leave feedback, track progress',
    accent: 'gradient-border-violet glow-violet',
    btnCls: 'bg-violet-500 hover:bg-violet-400',
    tagCls: 'bg-violet-500/20 text-violet-400',
  },
  {
    role: 'Organizer',
    email: 'organizer@demo.com',
    password: 'demo1234',
    color: 'amber',
    path: '/live-ops',
    icon: '🎛️',
    desc: 'Live ops, announcements, check-in scanning',
    accent: 'gradient-border-amber glow-amber',
    btnCls: 'bg-amber-500 hover:bg-amber-400',
    tagCls: 'bg-amber-500/20 text-amber-400',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleDemo(cred: typeof DEMO_ROLES[0]) {
    setLoading(cred.role);
    setError('');
    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, cred.email, cred.password);
    } catch {
      // In demo mode / unauthenticated, just navigate directly to destination
    } finally {
      setLoading(null);
      navigate(cred.path);
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col">
      {/* Nav */}
      <nav className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-900 text-sm">EP</div>
          <span className="font-bold text-white text-lg tracking-tight">EventPulse</span>
          <span className="status-chip bg-amber-500/20 text-amber-400 border border-amber-500/40 ml-2">ROUND_ACTIVE</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="live-dot"></span>
          <span>AbhiyantriX TechFest 2026</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium mb-6 animate-fade-in">
          <span>⚡</span>
          <span>Powered by Gemini AI — real-time event intelligence</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight animate-slide-up">
          Event
          <span className="text-gradient-amber">Pulse</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mb-3 animate-slide-up">
          One platform. Three roles. Zero chaos.
        </p>
        <p className="text-slate-500 max-w-xl mb-12 text-sm animate-slide-up">
          Real-time smart event coordination for hackathons and tech fests —
          check-in, team formation, judging, and live ops in a single unified dashboard.
        </p>

        {/* Live stats strip */}
        <div className="flex items-center gap-6 mb-12 px-6 py-3 rounded-2xl bg-slate-800/60 border border-slate-700">
          {[
            { label: 'Checked In', value: '214/260' },
            { label: 'Teams', value: '48' },
            { label: 'Submissions', value: '22' },
            { label: 'Scores', value: '14/22' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Demo credential cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-4">
          {DEMO_ROLES.map(cred => (
            <div
              key={cred.role}
              className={`rounded-xl p-5 ${cred.accent} text-left transition-all duration-200 hover:scale-[1.02] cursor-pointer`}
              onClick={() => handleDemo(cred)}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{cred.icon}</span>
                <span className={`status-chip ${cred.tagCls} border border-current/30`}>{cred.role}</span>
              </div>
              <h3 className="font-bold text-white mb-1">{cred.role} View</h3>
              <p className="text-xs text-slate-400 mb-3">{cred.desc}</p>
              <div className="text-xs text-slate-500 font-mono bg-slate-900/50 rounded p-2 mb-3">
                <div>{cred.email}</div>
                <div>demo1234</div>
              </div>
              <button
                id={`btn-demo-${cred.role.toLowerCase()}`}
                className={`w-full py-2 rounded-lg text-sm font-semibold text-slate-900 transition-all ${cred.btnCls} ${loading === cred.role ? 'opacity-70' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleDemo(cred); }}
              >
                {loading === cred.role ? 'Signing in…' : `Enter as ${cred.role}`}
              </button>
            </div>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        {/* Quick nav for demo — no auth required */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-sm">
          <span className="text-slate-600">Quick demo:</span>
          {[
            { label: '🎯 Participant Home', to: '/participant' },
            { label: '⚡ Find Teammates', to: '/find-team' },
            { label: '🎛️ Live Ops Dashboard', to: '/live-ops' },
            { label: '📢 Announcements', to: '/announcements' },
            { label: '📷 Check-in Scanner', to: '/checkin' },
          ].map(l => (
            <button
              key={l.to}
              onClick={() => navigate(l.to)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-all"
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-600">
        EventPulse · Built with Firebase Auth, Firestore, Gemini AI, Cloud Run · AbhiyantriX TechFest 2026
      </footer>
    </main>
  );
}
