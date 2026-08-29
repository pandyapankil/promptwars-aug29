import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getFirebaseDb } from '../firebase';
import { StatusChip, formatTime, toJsDate } from '../lib/ui';

interface Announcement {
  id: string;
  title: string;
  body: string;
  severity: string;
  status: string;
  tldr: string;
  viewership: number;
  sentAt: unknown;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-track-b',
    title: 'Track B moved to Lab 2, floor 3',
    body: 'Effective immediately: all Track B presentations are relocated to Lab 2, 3rd floor.',
    severity: 'CRITICAL',
    status: 'LIVE',
    tldr: 'Track B is now in Lab 2, 3rd floor — effective immediately.',
    viewership: 214,
    sentAt: new Date(Date.now() - 95 * 60 * 1000),
  },
  {
    id: 'ann-round2',
    title: 'Round 2 Now Open',
    body: 'Round 2 judging has officially started. All submissions must be finalized by 4:00 PM.',
    severity: 'NORMAL',
    status: 'LIVE',
    tldr: 'Judging starts 3:30 PM, submit by 4:00 PM.',
    viewership: 187,
    sentAt: new Date(Date.now() - 120 * 60 * 1000),
  },
  {
    id: 'ann-finals',
    title: 'Final presentations in Seminar Hall B',
    body: 'All final presentations will take place in Seminar Hall B.',
    severity: 'NORMAL',
    status: 'LIVE',
    tldr: 'Finals moved to Seminar Hall B — doors open 5:45 PM.',
    viewership: 156,
    sentAt: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: 'ann-lunch',
    title: 'Lunch break extended by 20 min',
    body: 'Lunch break has been extended by 20 minutes.',
    severity: 'NORMAL',
    status: 'SUPERSEDED',
    tldr: 'Lunch now ends at 1:20 PM.',
    viewership: 198,
    sentAt: new Date(Date.now() - 180 * 60 * 1000),
  },
];

export default function AnnouncementCenter() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [severity, setSeverity] = useState<'NORMAL' | 'CRITICAL'>('NORMAL');
  const [broadcasting, setBroadcasting] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const db = getFirebaseDb();
      const unsub = onSnapshot(collection(db, 'announcements'), snap => {
        if (!snap.empty) {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
          items.sort((a, b) => toJsDate(b.sentAt).getTime() - toJsDate(a.sentAt).getTime());
          setAnnouncements(items);
        }
      }, err => console.warn('Announcements onSnapshot:', err));
      return unsub;
    } catch (e) {
      console.warn('Firebase not ready:', e);
    }
  }, []);

  async function handleBroadcast() {
    if (!title.trim() || !body.trim()) return;
    setBroadcasting(true);
    setSuccess('');
    setError('');
    try {
      // 1. Get Gemini TL;DR from server
      let tldr = '';
      const res = await fetch('/api/gemini-tldr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      if (res.ok) {
        tldr = data.tldr ?? '';
      } else {
        setError(data.error || '⚠ Gemini unavailable — retry');
        return; // Stop broadcast
      }

      // 2. Write to Firestore
      try {
        const db = getFirebaseDb();
        await addDoc(collection(db, 'announcements'), {
          title,
          body,
          severity,
          status: 'LIVE',
          tldr,
          viewership: 0,
          sentAt: Timestamp.now(),
          sentBy: 'organizer@demo.com',
        });
      } catch (dbErr) {
        console.warn('Firestore addDoc skipped:', dbErr);
      }

      // 3. FCM broadcast via server
      try {
        await fetch('/api/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, body, severity }),
        });
      } catch { /* FCM optional */ }

      setTitle('');
      setBody('');
      setSeverity('NORMAL');
      setSuccess('✓ Broadcast sent to all participants');
      setTimeout(() => setSuccess(''), 4000);
    } finally {
      setBroadcasting(false);
    }
  }

  async function handleSupersede(id: string) {
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, 'announcements', id), { status: 'SUPERSEDED' });
    } catch (e) { console.error(e); }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Nav */}
      <nav className="border-b border-slate-700/50 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/live-ops')} className="text-slate-400 hover:text-white text-sm transition-colors">
          ← Live Ops
        </button>
        <span className="text-amber-400 text-sm font-semibold">📢 Announcement Center</span>
        <StatusChip status="ROUND_ACTIVE" />
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Gemini banner */}
        <div className="rounded-xl px-4 py-3 bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
          <span>⚡</span>
          <p className="text-sm text-amber-300">
            <span className="font-semibold">Gemini AI</span> automatically generates a one-line TL;DR for every broadcast — displayed to participants in their announcement feed
          </p>
        </div>

        {/* Composer */}
        <div className="card-gradient">
          <h2 className="text-sm font-semibold text-white mb-4">Compose Broadcast</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">Title</label>
              <input
                id="input-ann-title"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                placeholder="Announcement title…"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">Body</label>
              <textarea
                id="input-ann-body"
                rows={3}
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                placeholder="Full announcement text…"
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">Severity</label>
              <div className="flex gap-2">
                {(['NORMAL', 'CRITICAL'] as const).map(s => (
                  <button
                    key={s}
                    id={`btn-severity-${s.toLowerCase()}`}
                    onClick={() => setSeverity(s)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all
                      ${severity === s
                        ? s === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {success && (
              <div className="rounded-lg px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                {success}
              </div>
            )}

            {error && (
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900/40 rounded-xl border border-red-500/30">
              <span className="text-red-400 mb-4 font-semibold">{error}</span>
              <button
                onClick={handleBroadcast}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-300 text-sm font-semibold rounded-lg transition-colors"
              >
                Retry Broadcast
              </button>
            </div>
          )}

          {!error && (
            <button
              id="btn-broadcast"
              onClick={handleBroadcast}
              disabled={broadcasting || !title.trim() || !body.trim()}
              className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-60
                ${severity === 'CRITICAL'
                  ? 'bg-red-500 hover:bg-red-400 text-slate-900'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'
                }`}
            >
              {broadcasting ? '⚡ Gemini generating TL;DR…' : '🚀 Broadcast to all devices'}
            </button>
          )}
          </div>
        </div>

        {/* Broadcast history */}
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Broadcast History
          </h2>
          <div className="space-y-3">
            {announcements.map(ann => (
              <div
                key={ann.id}
                className={`card-gradient ${ann.severity === 'CRITICAL' ? 'border-red-500/40' : ''} ${ann.status === 'SUPERSEDED' ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-sm font-semibold text-white ${ann.status === 'SUPERSEDED' ? 'line-through opacity-60' : ''}`}>
                        {ann.title}
                      </span>
                      {ann.severity === 'CRITICAL' && <StatusChip status="CRITICAL" />}
                      {ann.status === 'SUPERSEDED' && <StatusChip status="SUPERSEDED" />}
                      {ann.status === 'LIVE' && ann.severity !== 'CRITICAL' && <StatusChip status="LIVE" />}
                    </div>
                    {ann.tldr && (
                      <p className="text-xs text-slate-400 mb-2">
                        <span className="text-amber-400">⚡ Gemini TL;DR:</span> {ann.tldr}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span>👁 seen by <span className="text-slate-400">{ann.viewership}</span> participants</span>
                      <span>·</span>
                      <span>{formatTime(ann.sentAt)}</span>
                    </div>
                  </div>
                  {ann.status === 'LIVE' && (
                    <button
                      onClick={() => handleSupersede(ann.id)}
                      className="shrink-0 text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-400 transition-colors"
                    >
                      Supersede
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
