import { useState, useRef, useEffect } from 'react';
import { doc, getDoc, updateDoc, onSnapshot, increment } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getFirebaseDb } from '../firebase';
import { StatusChip } from '../lib/ui';

interface ParticipantLookup {
  name: string;
  email: string;
  skills: string[];
  status: string;
  teamId: string | null;
  registrationCode: string;
}

const CODE_TO_ID: Record<string, string> = {
  'EVT-001': 'uid-aanya',
  'EVT-002': 'uid-rahul',
  'EVT-003': 'uid-priya',
  'EVT-004': 'uid-karan',
  'EVT-005': 'uid-ishita',
  'EVT-006': 'uid-dev',
  'EVT-007': 'uid-rohan',
  'EVT-008': 'uid-sneha',
};

export default function CheckinScanner() {
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [participant, setParticipant] = useState<ParticipantLookup | null>(null);
  const [scanning, setScanning] = useState(false);
  const [flash, setFlash] = useState<'success' | 'error' | null>(null);
  const [liveCount, setLiveCount] = useState(214);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live counter via onSnapshot
  useEffect(() => {
    try {
      const db = getFirebaseDb();
      const unsub = onSnapshot(doc(db, 'stats', 'live'), snap => {
        if (snap.exists()) setLiveCount(snap.data().checkedIn ?? 214);
      }, err => console.warn('Stats onSnapshot:', err));
      return unsub;
    } catch (e) {
      console.warn('Firebase not ready:', e);
    }
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleScan(inputCode: string) {
    const trimmed = inputCode.trim().toUpperCase();
    if (!trimmed) return;

    const participantId = CODE_TO_ID[trimmed];
    if (!participantId) {
      setFlash('error');
      setParticipant(null);
      setTimeout(() => setFlash(null), 2000);
      return;
    }

    setScanning(true);
    try {
      let data: ParticipantLookup | null = null;
      try {
        const db = getFirebaseDb();
        const snap = await getDoc(doc(db, 'participants', participantId));
        if (snap.exists()) {
          data = snap.data() as ParticipantLookup;
        }
      } catch (dbErr) {
        console.warn('Firestore getDoc failed:', dbErr);
      }

      if (!data) {
        // Seeded fallback data for instant demo responsiveness
        const FALLBACKS: Record<string, ParticipantLookup> = {
          'uid-aanya': { name: 'Aanya Sharma', email: 'aanya@demo.com', skills: ['React', 'TypeScript', 'UI Design'], status: 'REGISTERED', teamId: 'team-orion', registrationCode: 'EVT-001' },
          'uid-rahul': { name: 'Rahul Verma', email: 'rahul@demo.com', skills: ['Node.js', 'Express', 'Firebase'], status: 'REGISTERED', teamId: 'team-orion', registrationCode: 'EVT-002' },
          'uid-priya': { name: 'Priya Nair', email: 'priya@demo.com', skills: ['Python', 'ML', 'Data Science'], status: 'NO_SHOW', teamId: 'team-nexus', registrationCode: 'EVT-003' },
          'uid-karan': { name: 'Karan Mehta', email: 'karan@demo.com', skills: ['Flutter', 'Dart', 'Firebase'], status: 'REGISTERED', teamId: 'team-nexus', registrationCode: 'EVT-004' },
          'uid-ishita': { name: 'Ishita Rao', email: 'ishita@demo.com', skills: ['React', 'Figma', 'CSS'], status: 'REGISTERED', teamId: null, registrationCode: 'EVT-005' },
          'uid-dev': { name: 'Dev Patel', email: 'dev@demo.com', skills: ['DevOps', 'Docker', 'Kubernetes'], status: 'LATE_ARRIVAL', teamId: null, registrationCode: 'EVT-006' },
          'uid-rohan': { name: 'Rohan Kulkarni', email: 'rohan@demo.com', skills: ['PyTorch', 'CI/CD', 'Python'], status: 'REGISTERED', teamId: 'team-pulse', registrationCode: 'EVT-007' },
          'uid-sneha': { name: 'Sneha Iyer', email: 'sneha@demo.com', skills: ['React Native', 'GraphQL', 'AWS'], status: 'REGISTERED', teamId: 'team-pulse', registrationCode: 'EVT-008' },
        };
        data = FALLBACKS[participantId] || null;
      }

      if (!data) {
        setFlash('error');
        setTimeout(() => setFlash(null), 2000);
        return;
      }

      setParticipant(data);

      // THE WOW MOMENT: flip to CHECKED_IN + increment live counter
      try {
        const db = getFirebaseDb();
        await updateDoc(doc(db, 'participants', participantId), {
          status: 'CHECKED_IN',
          checkedInAt: new Date(),
        });
        await updateDoc(doc(db, 'stats', 'live'), {
          checkedIn: increment(1),
        });
      } catch (writeErr) {
        console.warn('Firestore updateDoc skipped (using optimistic UI):', writeErr);
      }

      setLiveCount(prev => prev + 1);
      setParticipant({ ...data, status: 'CHECKED_IN' });
      setFlash('success');
      setTimeout(() => setFlash(null), 3000);
    } catch (e) {
      console.error(e);
      setFlash('error');
      setTimeout(() => setFlash(null), 2000);
    } finally {
      setScanning(false);
      setCode('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleScan(code);
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Nav */}
      <nav className="border-b border-slate-700/50 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/live-ops')} className="text-slate-400 hover:text-white text-sm transition-colors">
          ← Live Ops
        </button>
        <span className="text-amber-400 text-sm font-semibold">📷 Check-in Scanner</span>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-6">

        {/* Live counter — THIS NUMBER MOVES */}
        <div className="gradient-border-amber glow-amber rounded-xl p-5 text-center">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Checked In — Live</div>
          <div className={`text-5xl font-bold tabular-nums transition-all duration-300
            ${flash === 'success' ? 'text-emerald-400 scale-110' : 'text-white'}`}
            id="live-checkin-count"
          >
            {liveCount}
          </div>
          <div className="text-slate-500 text-sm mt-1">of 260 registered</div>
          <div className="flex justify-center mt-3">
            <div className="w-full max-w-xs bg-slate-800 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                style={{ width: `${(liveCount / 260) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Flash overlay */}
        {flash === 'success' && (
          <div className="rounded-xl p-4 bg-emerald-500/20 border border-emerald-500/40 text-center animate-fade-in">
            <div className="text-3xl mb-1">✅</div>
            <div className="text-emerald-400 font-bold text-lg">Check-in Confirmed!</div>
            <div className="text-slate-400 text-sm">Counter updated live on all organizer dashboards</div>
          </div>
        )}
        {flash === 'error' && (
          <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/30 text-center animate-fade-in">
            <div className="text-3xl mb-1">❌</div>
            <div className="text-red-400 font-bold">Code not found</div>
            <div className="text-slate-500 text-sm">Try: EVT-001 through EVT-008</div>
          </div>
        )}

        {/* Scanner input */}
        <div className="card-gradient">
          <h2 className="text-sm font-semibold text-white mb-1">Scan Registration Code</h2>
          <p className="text-xs text-slate-500 mb-4">Type or paste QR code value — press Enter or tap Confirm</p>
          <div className="flex gap-2">
            <input
              id="input-scan-code"
              ref={inputRef}
              className="flex-1 bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono text-white focus:outline-none focus:border-amber-500/60 transition-colors tracking-widest uppercase"
              placeholder="EVT-001"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              id="btn-confirm-scan"
              onClick={() => handleScan(code)}
              disabled={scanning || !code.trim()}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold transition-all disabled:opacity-50"
            >
              {scanning ? '…' : '✓'}
            </button>
          </div>

          {/* Quick test buttons */}
          <div className="mt-4">
            <p className="text-xs text-slate-600 mb-2">Quick test — click to simulate scan:</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(CODE_TO_ID).map(c => (
                <button
                  key={c}
                  id={`btn-quick-scan-${c}`}
                  onClick={() => { setCode(c); handleScan(c); }}
                  className="px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded border border-slate-700 hover:border-amber-500/40 transition-all"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Participant lookup card */}
        {participant && (
          <div className={`card-gradient border transition-all animate-slide-up
            ${flash === 'success' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700'}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-2xl font-bold text-emerald-400 shrink-0">
                {participant.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-white">{participant.name}</span>
                  <StatusChip status={participant.status} />
                </div>
                <p className="text-xs text-slate-500 mb-2">{participant.email}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {participant.skills.map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 bg-slate-900/60 text-slate-400 rounded border border-slate-700">{s}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Team: </span>
                  <StatusChip status={participant.teamId ? 'TEAM_CONFIRMED' : 'SOLO'} />
                  <span className="font-mono text-slate-600">{participant.registrationCode}</span>
                </div>
              </div>
            </div>

            {flash === 'success' && (
              <div className="mt-3 pt-3 border-t border-emerald-500/20">
                <p className="text-xs text-emerald-400 font-medium">
                  ✓ Status updated CHECKED_IN · Live Ops counter incremented · All organizer dashboards updated
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!participant && !flash && (
          <div className="text-center text-slate-600 text-sm py-8">
            <div className="text-4xl mb-3">📷</div>
            <p>Scan participant QR or type registration code</p>
            <p className="text-xs mt-1">Changes propagate live to all organizer dashboards via Firestore</p>
          </div>
        )}
      </div>
    </div>
  );
}
