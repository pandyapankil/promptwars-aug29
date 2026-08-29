import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  limit,
  Timestamp,
} from 'firebase/firestore';

// Safe write — silently skips on permission errors (Firestore rules require auth for writes)
async function safeSet(ref: ReturnType<typeof doc>, data: object) {
  try {
    await setDoc(ref, data, { merge: true });
  } catch (e: unknown) {
    // Permission denied is expected if user is not signed in yet — seed will retry on next visit
    const msg = e instanceof Error ? e.message : String(e);
    if (!msg.includes('permission') && !msg.includes('PERMISSION_DENIED')) throw e;
  }
}
import { getFirebaseDb } from '../firebase';

const EVENT_ID = 'abhiyantrix-2026';

function ts(minutesAgo: number): Timestamp {
  return Timestamp.fromDate(new Date(Date.now() - minutesAgo * 60 * 1000));
}
function tsFuture(minutesFromNow: number): Timestamp {
  return Timestamp.fromDate(new Date(Date.now() + minutesFromNow * 60 * 1000));
}

export async function seedDatabase(): Promise<void> {
  const db = getFirebaseDb();

  // Check if already seeded
  const snap = await getDocs(query(collection(db, 'participants'), limit(1)));
  if (!snap.empty) return;

  console.log('🌱 Seeding database...');

  // ── EVENT ──────────────────────────────────────────────────
  await safeSet(doc(db, 'events', EVENT_ID), {
    name: 'AbhiyantriX TechFest 2026',
    date: ts(-180),
    currentRound: 'Round 2',
    submissionDeadline: tsFuture(102), // ~1h42m from now
    checkinCloses: tsFuture(23),
    judgingCutoff: tsFuture(197), // 3:30 PM approx
    status: 'ROUND_ACTIVE',
  });

  // ── PARTICIPANTS (8) — covers every check-in status ────────
  const participants = [
    {
      id: 'uid-aanya',
      name: 'Aanya Sharma',
      email: 'aanya@demo.com',
      skills: ['React', 'TypeScript', 'UI Design'],
      role: 'Frontend Developer',
      teamId: 'team-orion',
      status: 'CHECKED_IN',
      checkedInAt: ts(167), // 9:14 AM style offset
      registrationCode: 'EVT-001',
    },
    {
      id: 'uid-rahul',
      name: 'Rahul Verma',
      email: 'rahul@demo.com',
      skills: ['Node.js', 'Express', 'Firebase'],
      role: 'Backend Developer',
      teamId: 'team-orion',
      status: 'CHECKED_IN',
      checkedInAt: ts(165),
      registrationCode: 'EVT-002',
    },
    {
      id: 'uid-priya',
      name: 'Priya Nair',
      email: 'priya@demo.com',
      skills: ['Python', 'ML', 'Data Science'],
      role: 'ML Engineer',
      teamId: 'team-nexus',
      status: 'NO_SHOW',           // STATUS: NO_SHOW
      checkedInAt: null,
      registrationCode: 'EVT-003',
    },
    {
      id: 'uid-karan',
      name: 'Karan Mehta',
      email: 'karan@demo.com',
      skills: ['Flutter', 'Dart', 'Firebase'],
      role: 'Mobile Developer',
      teamId: 'team-nexus',
      status: 'CHECKED_IN',
      checkedInAt: ts(158),
      registrationCode: 'EVT-004',
    },
    {
      id: 'uid-ishita',
      name: 'Ishita Rao',
      email: 'ishita@demo.com',
      skills: ['React', 'Figma', 'CSS'],
      role: 'UI/UX Designer',
      teamId: null,
      status: 'CHECKED_IN',       // SOLO / looking for team
      checkedInAt: ts(155),
      registrationCode: 'EVT-005',
    },
    {
      id: 'uid-dev',
      name: 'Dev Patel',
      email: 'dev@demo.com',
      skills: ['DevOps', 'Docker', 'Kubernetes'],
      role: 'DevOps Engineer',
      teamId: null,
      status: 'LATE_ARRIVAL',     // STATUS: LATE_ARRIVAL
      checkedInAt: ts(10),
      registrationCode: 'EVT-006',
    },
    {
      id: 'uid-rohan',
      name: 'Rohan Kulkarni',
      email: 'rohan@demo.com',
      skills: ['PyTorch', 'CI/CD', 'Python'],
      role: 'ML Engineer',
      teamId: 'team-pulse',
      status: 'CHECKED_IN',
      checkedInAt: ts(148),
      registrationCode: 'EVT-007',
    },
    {
      id: 'uid-sneha',
      name: 'Sneha Iyer',
      email: 'sneha@demo.com',
      skills: ['React Native', 'GraphQL', 'AWS'],
      role: 'Full Stack Developer',
      teamId: 'team-pulse',
      status: 'CHECKED_IN',
      checkedInAt: ts(142),
      registrationCode: 'EVT-008',
    },
  ];

  for (const p of participants) {
    const { id, ...data } = p;
    await safeSet(doc(db, 'participants', id), data);
  }

  // Also create demo user records for auth roles
  await safeSet(doc(db, 'users', 'demo-participant'), { role: 'participant', email: 'participant@demo.com', name: 'Demo Participant' });
  await safeSet(doc(db, 'users', 'demo-judge'), { role: 'judge', email: 'judge@demo.com', name: 'Demo Judge' });
  await safeSet(doc(db, 'users', 'demo-organizer'), { role: 'organizer', email: 'organizer@demo.com', name: 'Demo Organizer' });

  // ── TEAMS (4) — covers DRAFT, SUBMITTED, UNDER_REVIEW, SCORED, LATE_SUBMISSION ──
  const teams = [
    {
      id: 'team-orion',
      name: 'Team Orion',
      memberIds: ['uid-aanya', 'uid-rahul'],
      status: 'TEAM_CONFIRMED',
      projectLink: 'github.com/orion/hackproject',
      submissionStatus: 'SUBMITTED',
    },
    {
      id: 'team-nexus',
      name: 'Team Nexus',
      memberIds: ['uid-priya', 'uid-karan'],
      status: 'TEAM_FORMING',       // STATUS: TEAM_FORMING (Priya NO_SHOW)
      projectLink: null,
      submissionStatus: 'DRAFT',    // STATUS: DRAFT
    },
    {
      id: 'team-pulse',
      name: 'Team Pulse',
      memberIds: ['uid-rohan', 'uid-sneha'],
      status: 'TEAM_CONFIRMED',
      projectLink: 'github.com/pulse/eventpulse-ai',
      submissionStatus: 'UNDER_REVIEW', // STATUS: UNDER_REVIEW
    },
    {
      id: 'team-vertex',
      name: 'Team Vertex',
      memberIds: ['uid-karan'],
      status: 'TEAM_CONFIRMED',
      projectLink: 'github.com/vertex/smarthealth',
      submissionStatus: 'SCORED',   // STATUS: SCORED
    },
    {
      id: 'team-delta',
      name: 'Team Delta',
      memberIds: [],
      status: 'UNTEAMED',           // STATUS: UNTEAMED
      projectLink: null,
      submissionStatus: 'LATE_SUBMISSION', // STATUS: LATE_SUBMISSION
    },
  ];

  for (const t of teams) {
    const { id, ...data } = t;
    await safeSet(doc(db, 'teams', id), data);
  }

  // ── JUDGES (3) — covers EVALUATION_COMPLETE, JUDGE_OVERDUE ─
  const judges = [
    {
      id: 'judge-meera',
      name: 'Prof. Meera Pillai',
      assignedTeams: ['team-orion', 'team-nexus', 'team-pulse'],
      scoredTeams: ['team-nexus'],
      status: 'JUDGE_OVERDUE',      // STATUS: JUDGE_OVERDUE
    },
    {
      id: 'judge-arjun',
      name: 'Dr. Arjun Rao',
      assignedTeams: ['team-pulse', 'team-vertex'],
      scoredTeams: ['team-pulse', 'team-vertex'],
      status: 'EVALUATION_COMPLETE', // STATUS: EVALUATION_COMPLETE
    },
    {
      id: 'judge-kavita',
      name: 'Ms. Kavita Singh',
      assignedTeams: ['team-orion'],
      scoredTeams: ['team-orion'],
      status: 'EVALUATION_COMPLETE',
    },
  ];

  for (const j of judges) {
    const { id, ...data } = j;
    await safeSet(doc(db, 'judges', id), data);
  }

  // ── SCORES (4) — Orion has variance trigger (87 vs 65) ─────
  const scores = [
    {
      id: 'score-orion-meera',
      teamId: 'team-orion',
      judgeId: 'judge-meera',
      criteria: { functionality: 22, innovation: 20, presentation: 21, implementation: 24 },
      total: 87,
      feedback: 'Excellent real-time architecture. Innovation in Gemini integration stands out.',
      submittedAt: ts(45),
    },
    {
      id: 'score-orion-arjun',
      teamId: 'team-orion',
      judgeId: 'judge-arjun',
      criteria: { functionality: 18, innovation: 15, presentation: 16, implementation: 16 },
      total: 65,
      feedback: 'Presentation needs polish. Core concept is sound but innovation feels incremental.',
      submittedAt: ts(30),
    },
    {
      id: 'score-nexus-kavita',
      teamId: 'team-nexus',
      judgeId: 'judge-kavita',
      criteria: { functionality: 21, innovation: 22, presentation: 20, implementation: 23 },
      total: 86,
      feedback: 'Strong ML pipeline. Missing team member hurt demo quality.',
      submittedAt: ts(60),
    },
    {
      id: 'score-pulse-arjun',
      teamId: 'team-pulse',
      judgeId: 'judge-arjun',
      criteria: { functionality: 19, innovation: 21, presentation: 20, implementation: 24 },
      total: 84,
      feedback: 'Clean implementation. The real-time sync demo was impressive.',
      submittedAt: ts(20),
    },
  ];

  for (const s of scores) {
    const { id, ...data } = s;
    await safeSet(doc(db, 'scores', id), data);
  }

  // ── ANNOUNCEMENTS (4) — covers LIVE, SUPERSEDED, CRITICAL ──
  const announcements = [
    {
      id: 'ann-round2',
      title: 'Round 2 Now Open',
      body: 'Round 2 judging has officially started. All submissions must be finalized by 4:00 PM. Judging begins at 3:30 PM sharp.',
      severity: 'NORMAL',
      status: 'LIVE',              // STATUS: LIVE
      tldr: 'Judging starts 3:30 PM, submit by 4:00 PM.',
      viewership: 187,
      sentAt: ts(120),
      sentBy: 'organizer@demo.com',
    },
    {
      id: 'ann-track-b',
      title: 'Track B moved to Lab 2, floor 3',
      body: 'Effective immediately: all Track B presentations are relocated to Lab 2, 3rd floor. Elevator access available. This change is permanent for the rest of the event.',
      severity: 'CRITICAL',
      status: 'LIVE',              // STATUS: CRITICAL + LIVE
      tldr: 'Track B is now in Lab 2, 3rd floor — effective immediately.',
      viewership: 214,
      sentAt: ts(95),
      sentBy: 'organizer@demo.com',
    },
    {
      id: 'ann-lunch',
      title: 'Lunch break extended by 20 min',
      body: 'Lunch break has been extended by 20 minutes due to high attendance. Please return by 1:20 PM.',
      severity: 'NORMAL',
      status: 'SUPERSEDED',        // STATUS: SUPERSEDED
      tldr: 'Lunch now ends at 1:20 PM.',
      viewership: 198,
      sentAt: ts(180),
      sentBy: 'organizer@demo.com',
    },
    {
      id: 'ann-finals',
      title: 'Final presentations in Seminar Hall B',
      body: 'All final presentations will take place in Seminar Hall B. Doors open at 5:45 PM. Jury panel confirmed.',
      severity: 'NORMAL',
      status: 'LIVE',
      tldr: 'Finals moved to Seminar Hall B — doors open 5:45 PM.',
      viewership: 156,
      sentAt: ts(60),
      sentBy: 'organizer@demo.com',
    },
  ];

  for (const a of announcements) {
    const { id, ...data } = a;
    await safeSet(doc(db, 'announcements', id), data);
  }

  // ── LEADERBOARD ─────────────────────────────────────────────
  const leaderboard = [
    { id: 'team-nexus', rank: 1, teamName: 'Team Nexus', totalScore: 86, published: true },
    { id: 'team-pulse', rank: 2, teamName: 'Team Pulse', totalScore: 84, published: true },
    { id: 'team-orion', rank: 3, teamName: 'Team Orion', totalScore: 76, published: false },
    { id: 'team-vertex', rank: 4, teamName: 'Team Vertex', totalScore: 71, published: true },
  ];

  for (const l of leaderboard) {
    const { id, ...data } = l;
    await safeSet(doc(db, 'leaderboard', id), data);
  }

  // ── CHECK-IN TIMESTAMPS — spread over last 3h for sparkline ─
  // 20 check-ins with realistic distribution (morning rush, then taper)
  const checkins = [
    { participantId: 'uid-aanya', time: ts(167) },
    { participantId: 'uid-rahul', time: ts(165) },
    { participantId: 'uid-karan', time: ts(158) },
    { participantId: 'uid-ishita', time: ts(155) },
    { participantId: 'uid-rohan', time: ts(148) },
    { participantId: 'uid-sneha', time: ts(142) },
    { participantId: 'p-extra-1', time: ts(138) },
    { participantId: 'p-extra-2', time: ts(135) },
    { participantId: 'p-extra-3', time: ts(130) },
    { participantId: 'p-extra-4', time: ts(128) },
    { participantId: 'p-extra-5', time: ts(125) },
    { participantId: 'p-extra-6', time: ts(120) },
    { participantId: 'p-extra-7', time: ts(115) },
    { participantId: 'p-extra-8', time: ts(108) },
    { participantId: 'p-extra-9', time: ts(100) },
    { participantId: 'p-extra-10', time: ts(90) },
    { participantId: 'p-extra-11', time: ts(75) },
    { participantId: 'p-extra-12', time: ts(58) },
    { participantId: 'p-extra-13', time: ts(32) },
    { participantId: 'uid-dev', time: ts(10) },  // LATE_ARRIVAL last
  ];

  for (let i = 0; i < checkins.length; i++) {
    await safeSet(doc(db, 'checkins', `ci-${i}`), checkins[i]);
  }

  // ── STATS DOCUMENT for LiveOps counters ─────────────────────
  await safeSet(doc(db, 'stats', 'live'), {
    totalRegistered: 260,
    checkedIn: 214,
    teamsFormed: 48,
    submissions: 22,
    judgingComplete: 14,
    judgingTotal: 22,
    updatedAt: ts(0),
  });

  console.log('✅ Database seeded successfully');
}
