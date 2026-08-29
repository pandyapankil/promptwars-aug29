import { useEffect, useState, useRef } from 'react';
import { collection, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { StatusChip, formatCountdown, formatTime } from '../lib/ui';
import QRCode from 'qrcode';

interface Participant {
  name: string;
  status: string;
  teamId: string | null;
  skills: string[];
  registrationCode: string;
  checkedInAt: { toDate: () => Date } | null;
}

interface Announcement {
  id: string;
  title: string;
  tldr: string;
  severity: string;
  status: string;
  sentAt: { toDate: () => Date };
}

const SUBMISSION_DEADLINE = new Date(Date.now() + 102 * 60 * 1000); // ~1h42m from now

export default function ParticipantHome() {
  const navigate = useNavigate();
  const db = getFirebaseDb();

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [countdown, setCountdown] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [teamName] = useState('Neon Otters');
  const [teamMembers] = useState(['Aanya Sharma', 'Rahul Verma', 'Priya Nair']);

  // Live countdown — ticks every second (Correction 3)
  useEffect(() => {
    function tick() {
      setCountdown(formatCountdown(SUBMISSION_DEADLINE.getTime() - Date.now()));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Load participant data
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'participants', 'uid-aanya'), snap => {
      if (snap.exists()) setParticipant(snap.data() as Participant);
    });
    return unsub;
  }, [db]);

  // Generate QR from registrationCode — deterministic per code (Correction 3)
  useEffect(() => {
    if (!participant?.registrationCode) return;
    QRCode.toDataURL(participant.registrationCode, {
      width: 160,
      margin: 1,
      color: { dark: '#ffffff', light: '#1e293b' },
    }).then(setQrDataUrl);
  }, [participant?.registrationCode]);

  // Announcements feed
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'announcements'), snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
      items.sort((a, b) => b.sentAt.toDate().getTime() - a.sentAt.toDate().getTime());
      setAnnouncements(items);
    });
    return unsub;
  }, [db]);

  const checkedIn = participant?.status === 'CHECKED_IN';

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Nav */}
      <nav className="border-b border-slate-700/50 px-4 md:px-6 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <span className="text-emerald-400 font-bold text-sm">EP</span>
          <span className="text-sm text-slate-500">/ Participant</span>
        </button>
        <div className="flex items-center gap-2">
          <StatusChip status={participant?.status ?? 'REGISTERED'} />
          <span className="text-sm text-slate-400">{participant?.name ?? 'Aanya Sharma'}</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* (a) CHECK-IN CARD */}
        <div className={`card-gradient rounded-xl overflow-hidden ${checkedIn ? '' : 'glow-emerald'}`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold">{participant?.name ?? 'Aanya Sharma'}</span>
                  <StatusChip status={participant?.status ?? 'CHECKED_IN'} />
                </div>
                {checkedIn && participant?.checkedInAt && (
                  <p className="text-sm text-slate-400">
                    Checked in {formatTime(participant.checkedInAt.toDate())}
                  </p>
                )}
                {!checkedIn && (
                  <p className="text-sm text-amber-400 font-medium">⚠ Not yet checked in — show QR at entry</p>
                )}
              </div>
              <div className="text-3xl">🎫</div>
            </div>

            {/* QR — prominent when REGISTERED, collapsed when CHECKED_IN */}
            {!checkedIn && qrDataUrl && (
              <div className="flex flex-col items-center mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <img src={qrDataUrl} alt="Check-in QR code" className="w-40 h-40 rounded-lg" />
                <p className="text-xs text-slate-400 mt-2">Show this QR at entry</p>
                <p className="text-xs font-mono text-slate-500">{participant?.registrationCode}</p>
              </div>
            )}
            {checkedIn && (
              <details className="mt-2">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 transition-colors">
                  Show QR code · {participant?.registrationCode}
                </summary>
                {qrDataUrl && (
                  <div className="flex justify-center mt-2">
                    <img src={qrDataUrl} alt="QR" className="w-24 h-24 opacity-50 rounded" />
                  </div>
                )}
              </details>
            )}
          </div>
        </div>

        {/* (b) SUBMISSION COUNTDOWN */}
        <div className="card-gradient">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-slate-300 text-sm font-medium">Submission Window</span>
                <StatusChip status="SUBMITTED" />
              </div>
              <p className="text-slate-500 text-xs mb-2">PulseBoard — AI Event Orchestrator</p>
              <div className="text-3xl font-mono font-bold text-white tabular-nums">{countdown}</div>
              <p className="text-xs text-slate-500 mt-1">until deadline closes</p>
            </div>
            <div className="text-right">
              <div className="text-2xl mb-1">⏱</div>
              <a href="https://github.com/orion/hackproject" target="_blank" rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                View repo ↗
              </a>
            </div>
          </div>
        </div>

        {/* (c) TEAM CARD */}
        <div className="card-gradient">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">{teamName}</span>
              <StatusChip status="TEAM_CONFIRMED" />
            </div>
            <span className="text-xl">👥</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {teamMembers.map(m => (
              <div key={m} className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                  {m[0]}
                </div>
                <span className="text-xs text-slate-300">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* (d) ANNOUNCEMENT FEED */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
            Announcements
          </h2>
          <div className="space-y-2">
            {announcements.map(ann => (
              <div
                key={ann.id}
                className={`card-gradient ${ann.severity === 'CRITICAL' ? 'border-red-500/40' : ''} 
                            ${ann.status === 'SUPERSEDED' ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-sm font-medium text-white ${ann.status === 'SUPERSEDED' ? 'strikethrough' : ''}`}>
                        {ann.title}
                      </span>
                      {ann.severity === 'CRITICAL' && <StatusChip status="CRITICAL" />}
                      {ann.status === 'SUPERSEDED' && <StatusChip status="SUPERSEDED" />}
                      {ann.status === 'LIVE' && ann.severity !== 'CRITICAL' && <StatusChip status="LIVE" />}
                    </div>
                    {ann.tldr && (
                      <p className={`text-xs text-slate-400 ${ann.status === 'SUPERSEDED' ? 'strikethrough' : ''}`}>
                        <span className="text-amber-400">⚡ Gemini TL;DR:</span> {ann.tldr}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-slate-600 whitespace-nowrap shrink-0">
                    {formatTime(ann.sentAt.toDate())}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* (e) WHAT'S NEXT */}
        <div className="card border-l-4 border-amber-500">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">📌</span>
            <p className="text-sm text-slate-300">
              <span className="font-medium text-white">What's next:</span>{' '}
              Judging begins 3:30 PM — keep your demo running and be at your station.
            </p>
          </div>
        </div>

        {/* (f) FIND TEAMMATES — only if no team */}
        {!participant?.teamId && (
          <button
            id="btn-find-teammates"
            onClick={() => navigate('/find-team')}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            ⚡ Find Teammates — AI Matchmaking
          </button>
        )}
      </div>
    </div>
  );
}
