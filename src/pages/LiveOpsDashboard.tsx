import { useEffect, useState, useRef } from 'react';
import { onSnapshot, doc, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getFirebaseDb } from '../firebase';
import { StatusChip, formatTime, toJsDate } from '../lib/ui';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface Stats {
  totalRegistered: number;
  checkedIn: number;
  teamsFormed: number;
  submissions: number;
  judgingComplete: number;
  judgingTotal: number;
}

interface Checkin {
  time: unknown;
}

interface Alert {
  id: string;
  type: 'UNTEAMED' | 'SCORING_AT_RISK' | 'NO_SHOW';
  title: string;
  desc: string;
  color: string;
}

const SEEDED_ALERTS: Alert[] = [
  { id: 'a1', type: 'UNTEAMED', title: 'Ishita Rao', desc: 'Teamless past 11:00 AM deadline — AI suggests 3 matches', color: 'border-red-500/40 bg-red-500/5' },
  { id: 'a2', type: 'UNTEAMED', title: 'Dev Patel', desc: 'UNTEAMED past deadline — refer to walk-in matching desk, Hall B', color: 'border-red-500/40 bg-red-500/5' },
  { id: 'a3', type: 'SCORING_AT_RISK', title: 'Judging Pace Alert', desc: 'Judging pace: 14/22 scored, cutoff 3:30 PM — behind pace by ~3 teams', color: 'border-red-600/60 bg-red-600/10' },
  { id: 'a4', type: 'NO_SHOW', title: 'No-Show Summary', desc: '46 registered not checked in — check-in window closes in 23 min', color: 'border-orange-500/40 bg-orange-500/5' },
];

const JUDGE_QUEUE = [
  { team: 'Team Orion', judge: 'Prof. Meera Pillai', status: 'SCORING_AT_RISK' },
  { team: 'Team Nexus', judge: 'Ms. Kavita Singh', status: 'SCORED' },
  { team: 'Team Pulse', judge: 'Dr. Arjun Rao', status: 'SCORED' },
  { team: 'Team Vertex', judge: 'Dr. Arjun Rao', status: 'SCORED' },
  { team: 'Team Delta', judge: 'Prof. Meera Pillai', status: 'AWAITING_JUDGE' },
];

const DEFAULT_SPARKLINE = [
  { time: '180m ago', checkins: 12 },
  { time: '150m ago', checkins: 45 },
  { time: '120m ago', checkins: 68 },
  { time: '90m ago', checkins: 38 },
  { time: '60m ago', checkins: 28 },
  { time: '30m ago', checkins: 18 },
  { time: '0m ago', checkins: 5 },
];

function buildSparklineData(checkins: Checkin[]) {
  if (!checkins.length) return DEFAULT_SPARKLINE;
  const now = Date.now();
  const buckets: Record<number, number> = {};
  for (let i = 0; i < 36; i++) {
    buckets[i] = 0;
  }
  checkins.forEach(ci => {
    const dt = toJsDate(ci.time);
    const age = (now - dt.getTime()) / 1000 / 60; // minutes ago
    if (age >= 0 && age <= 180) {
      const bucket = 35 - Math.floor(age / 5);
      if (bucket >= 0) buckets[bucket] = (buckets[bucket] || 0) + 1;
    }
  });
  return Object.entries(buckets).map(([i, count]) => ({
    time: `${Math.round((35 - Number(i)) * 5)}m ago`,
    checkins: count,
  })).reverse();
}

export default function LiveOpsDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats>({
    totalRegistered: 260, checkedIn: 214, teamsFormed: 48,
    submissions: 22, judgingComplete: 14, judgingTotal: 22,
  });
  const [sparkData, setSparkData] = useState<{ time: string; checkins: number }[]>(DEFAULT_SPARKLINE);
  const [pulsedFields, setPulsedFields] = useState<Set<string>>(new Set());
  const prevStats = useRef<Stats | null>(null);

  function triggerPulse(fields: string[]) {
    setPulsedFields(new Set(fields));
    setTimeout(() => setPulsedFields(new Set()), 700);
  }

  // Live stats via Firestore onSnapshot
  useEffect(() => {
    try {
      const db = getFirebaseDb();
      const unsub = onSnapshot(doc(db, 'stats', 'live'), snap => {
        if (!snap.exists()) return;
        const newStats = snap.data() as Stats;
        if (prevStats.current) {
          const changed: string[] = [];
          (Object.keys(newStats) as (keyof Stats)[]).forEach(k => {
            if (newStats[k] !== prevStats.current![k]) changed.push(k);
          });
          if (changed.length) triggerPulse(changed);
        }
        prevStats.current = newStats;
        setStats(newStats);
      }, err => console.warn('Stats onSnapshot:', err));
      return unsub;
    } catch (e) {
      console.warn('Firebase not ready:', e);
    }
  }, []);

  // Sparkline data from checkins collection
  useEffect(() => {
    try {
      const db = getFirebaseDb();
      const unsub = onSnapshot(collection(db, 'checkins'), snap => {
        if (!snap.empty) {
          const items = snap.docs.map(d => d.data() as Checkin);
          setSparkData(buildSparklineData(items));
        }
      }, err => console.warn('Checkins onSnapshot:', err));
      return unsub;
    } catch (e) {
      console.warn('Firebase not ready:', e);
    }
  }, []);

  function CounterCard({ label, value, sub, field }: { label: string; value: string; sub?: string; field: string }) {
    const isPulsing = pulsedFields.has(field);
    return (
      <div className={`card-gradient text-center py-4 px-3 transition-all ${isPulsing ? 'pulse-update' : ''}`}>
        <div className={`text-2xl md:text-3xl font-bold tabular-nums ${isPulsing ? 'text-amber-400' : 'text-white'}`}>
          {value}
        </div>
        <div className="text-xs text-slate-500 mt-1">{label}</div>
        {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Nav */}
      <nav className="border-b border-slate-700/50 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
          ← EventPulse
        </button>
        <div className="flex items-center gap-2">
          <span className="live-dot"></span>
          <span className="text-amber-400 text-sm font-semibold">Live Ops Dashboard</span>
          <StatusChip status="ROUND_ACTIVE" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/checkin')} className="text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg transition-all">
            📷 Scanner
          </button>
          <button onClick={() => navigate('/announcements')} className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all">
            📢 Broadcast
          </button>
        </div>
      </nav>

      {/* Gemini Banner */}
      <div className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-2.5 flex items-center gap-2">
        <span className="text-amber-400 text-sm">⚡</span>
        <p className="text-xs text-amber-300">
          <span className="font-semibold">Powered by Gemini AI</span> — detects scoring inconsistencies, flags unteamed participants, and generates broadcast TL;DRs in real time
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* (a) LIVE COUNTERS STRIP */}
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Live Event Counters</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <CounterCard field="checkedIn" label="Checked In" value={`${stats.checkedIn}/${stats.totalRegistered}`} sub="of registered" />
            <CounterCard field="teamsFormed" label="Teams Formed" value={String(stats.teamsFormed)} />
            <CounterCard field="submissions" label="Submissions" value={String(stats.submissions)} />
            <CounterCard field="judgingComplete" label="Judging" value={`${stats.judgingComplete}/${stats.judgingTotal}`} sub={`${stats.judgingComplete >= stats.judgingTotal ? 'complete' : 'in progress'}`} />
          </div>
        </div>

        {/* (d) GEMINI SCORE VARIANCE — visible without scrolling */}
        <div className="gradient-border-amber glow-amber rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl mt-0.5">⚡</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-400 font-bold text-sm">Gemini AI Score Review</span>
                <span className="status-chip bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">SCORING_AT_RISK</span>
              </div>
              <p className="text-white text-sm mb-2">
                <span className="font-semibold">Team Orion:</span> Score variance <span className="text-red-400 font-bold">25 pts</span> between Judge A (65) and Judge B (87). Divergence concentrated in <span className="text-amber-400">Innovation</span> criterion (5 vs 20). Review before publishing leaderboard.
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                <span>Prof. Meera: <span className="text-white font-semibold">87</span></span>
                <span>·</span>
                <span>Dr. Arjun: <span className="text-white font-semibold">65</span></span>
                <span>·</span>
                <span className="text-red-400">Δ 22 pts — flagged by Gemini</span>
              </div>
              <button
                id="btn-review-scores"
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold transition-all"
              >
                Review Scores →
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* (b) ALERTS FEED */}
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Operational Alerts
            </h2>
            <div className="space-y-2">
              {SEEDED_ALERTS.map(alert => (
                <div key={alert.id} className={`rounded-xl p-3 border ${alert.color}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{alert.title}</span>
                        <StatusChip status={alert.type} />
                      </div>
                      <p className="text-xs text-slate-400">{alert.desc}</p>
                    </div>
                    <button
                      className="shrink-0 text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                      onClick={() => navigate('/announcements')}
                    >
                      Send Reminder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* (c) JUDGE ASSIGNMENT QUEUE */}
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Judge Assignment Queue
            </h2>
            <div className="card-gradient overflow-hidden">
              <div className="space-y-0">
                {JUDGE_QUEUE.map((row, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-3 py-2.5 ${i < JUDGE_QUEUE.length - 1 ? 'border-b border-slate-700/50' : ''}`}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm text-white font-medium">{row.team}</span>
                      <span className="text-xs text-slate-500">{row.judge}</span>
                    </div>
                    <StatusChip status={row.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* (e) CHECK-IN SPARKLINE */}
        <div className="card-gradient">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Check-in Activity — Last 3 Hours
          </h2>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="checkinGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 9 }} tickLine={false} interval={5} />
                <YAxis tick={{ fill: '#475569', fontSize: 9 }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="checkins" stroke="#10b981" strokeWidth={2} fill="url(#checkinGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
