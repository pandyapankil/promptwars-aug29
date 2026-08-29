# Template A — Core Skeleton
> Rationale: First build prompt. PLANNING mode. Hero screen: Organizer Live Ops Dashboard.
> Gemini: AI teammate matchmaking + announcement TL;DR + score variance.
> QR code on Participant Home covers virtual check-in. CheckinScanner is the wow moment.
> Cloud Storage for project file uploads. Explicit file names protect Template B regression rule.
> Updated: adopted status state map, file names, Cloud Storage, CheckinScanner from parallel AI review.

---

Read @promptwars-project-context.md for all project config, credentials, stack rules,
Dockerfile, and port requirements. Do not ask for any of these values — they are in that file.

This application must use:
- Firebase Auth (Email/Password + Google SSO) for role-based access (participant / judge / organizer)
- Firestore for all real-time state: check-ins, teams, scores, announcements, leaderboard
- Gemini API for THREE features:
    1. AI teammate matchmaking — ranks candidate participants by skills fit, returns one-line reason per match
    2. Announcement TL;DR — Gemini writes a 1-line summary per broadcast, stored in tldr field
    3. Score variance detection — flags when two judges diverge >15 points on a team
- Cloud Run deployment via ./deploy.sh
- Firebase Cloud Messaging for push notifications on critical broadcasts (Tier 2 — broadcast is a literal requirement)
- Cloud Storage for project submission file uploads (Tier 2 — submissions require files)

Do not use any non-Google backend services. Do NOT use Firebase Hosting.

---

BUILD: Smart Event Management Platform — "EventPulse"

A real-time, multi-role event coordination platform for hackathons and tech fests.
Three distinct role-based dashboards. State changes propagate live via Firestore onSnapshot listeners.
Gemini AI surfaces coordination intelligence across all three actors.

DESIGN LANGUAGE: Dark operations-console aesthetic.
Background: #0f172a (slate-900). Card: #1e293b. Borders: #334155.
Accent colors per actor: organizer=amber (#f59e0b), participant=emerald (#10b981), judge=violet (#8b5cf6).
Typography: Inter (Google Fonts). Cards have subtle gradient borders.
Live data updates trigger a brief pulse animation when Firestore values change.
Every screen has real-looking data from first paint. Zero empty states.

FIREBASE CONFIG — RUNTIME DELIVERY (mandatory, do not skip):
Vite compiles VITE_FIREBASE_* at build time. Firebase credentials are NOT available at
Docker build time on Cloud Run. Every VITE_FIREBASE_* variable becomes undefined → blank page.

THE ONLY CORRECT PATTERN:
1. Express server reads Firebase env vars from process.env at startup
2. Expose GET /api/config — returns Firebase config as JSON
3. React app fetches /api/config on first load, calls initializeApp() with result
4. NEVER use import.meta.env.VITE_FIREBASE_* anywhere in the codebase

server.js endpoint:
app.get('/api/config', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  });
});

firebase.ts:
export async function initFirebase() {
  const config = await fetch('/api/config').then(r => r.json());
  const app = initializeApp(config);
  return { auth: getAuth(app), db: getFirestore(app) };
}

---

FIRESTORE SCHEMA — implement all collections exactly as specified:

/events/{eventId}
  name: string             // "AbhiyantriX TechFest 2026"
  date: timestamp
  currentRound: string     // "Round 2"
  submissionDeadline: timestamp
  checkinCloses: timestamp
  judgingCutoff: timestamp
  status: string           // ROUND_ACTIVE | SCORING_IN_PROGRESS | LEADERBOARD_LIVE

/participants/{userId}
  name: string             // "Aanya Sharma"
  email: string
  skills: string[]         // ["React", "ML", "UI Design"]
  role: string             // "Frontend Developer"
  teamId: string | null
  status: string           // REGISTERED | CHECKED_IN | NO_SHOW | LATE_ARRIVAL
  checkedInAt: timestamp | null
  registrationCode: string // unique code for CheckinScanner

/teams/{teamId}
  name: string             // "Team Orion"
  memberIds: string[]
  status: string           // SOLO | TEAM_FORMING | TEAM_CONFIRMED | UNTEAMED
  projectLink: string | null
  submissionStatus: string // DRAFT | SUBMITTED | UNDER_REVIEW | SCORED | LATE_SUBMISSION

/judges/{userId}
  name: string
  assignedTeams: string[]
  scoredTeams: string[]
  status: string           // EVALUATION_COMPLETE | JUDGE_OVERDUE

/scores/{scoreId}
  teamId: string
  judgeId: string
  criteria: {
    functionality: number  // 0-25
    innovation: number     // 0-25
    presentation: number   // 0-25
    implementation: number // 0-25
  }
  total: number
  feedback: string
  submittedAt: timestamp

/announcements/{announcementId}
  title: string
  body: string
  severity: string         // NORMAL | CRITICAL
  status: string           // LIVE | SUPERSEDED
  tldr: string             // Gemini-generated one-line summary
  viewership: number       // count of participants who opened it
  sentAt: timestamp
  sentBy: string

/leaderboard/{teamId}
  rank: number
  teamName: string
  totalScore: number
  published: boolean

---

STATUS STATE MAP (use these exact labels as UI chips — no invented variants):
  Check-in: REGISTERED | CHECKED_IN | NO_SHOW | LATE_ARRIVAL
  Team:      SOLO | TEAM_FORMING | TEAM_CONFIRMED | UNTEAMED
  Submission: DRAFT | SUBMITTED | UNDER_REVIEW | SCORED | LATE_SUBMISSION
  Judging:   EVALUATION_COMPLETE | JUDGE_OVERDUE | AWAITING_JUDGE | SCORING_AT_RISK
  Broadcast: LIVE | SUPERSEDED | CRITICAL
  Event:     ROUND_ACTIVE | SCORING_IN_PROGRESS | LEADERBOARD_LIVE

---

SCREENS TO BUILD — all 6 in Template A, with these exact file names:

1. LandingPage.tsx
   Product name "EventPulse", one-line value prop, three demo credential cards visible on load.
   No login wall before landing content. Loads in under 3 seconds.
   Demo credentials visible: participant@demo.com / judge@demo.com / organizer@demo.com (all: demo1234)

2. ParticipantHome.tsx
   Visual priority order (top to bottom):
   (a) Check-in card: participant "Aanya Sharma", status chip CHECKED_IN (emerald),
       "Checked in 9:14 AM". QR code rendered inline from registrationCode using
       the qrcode npm package (SVG output). Label: "Show this QR at entry".
       QR is prominent when REGISTERED/NOT CHECKED IN, collapsed when CHECKED_IN.
   (b) Submission countdown: "Submission window closes in 01:42:07" ticking live.
       Project "PulseBoard — AI Event Orchestrator", status chip SUBMITTED.
   (c) Team card: Team "Neon Otters", members Aanya Sharma + Rahul Verma + Priya Nair,
       status TEAM_CONFIRMED.
   (d) Announcement feed: 4 seeded broadcasts each with Gemini TL;DR line beneath title.
       One CRITICAL (LIVE pulse chip): "Track B moved to Lab 2, floor 3 — effective now."
       One SUPERSEDED with strikethrough text.
   (e) "What's next?" action line: "Next: Judging begins 3:30 PM — keep your demo running."
   (f) "Find Teammates" button — visible only if teamId is null.

3. FindMyTeam.tsx
   Profile form (skills, role, interests) for solo participant "Ishita Rao".
   Gemini-ranked match list: 3 match cards, each showing name, skills, and a
   Gemini-written one-line reason ("Rohan Kulkarni — strong PyTorch + CI/CD,
   needs a data person — 92% fit"). Label each card "⚡ Gemini match".
   Top card has "Invite to team" button that transitions state to TEAM_FORMING.
   Seed one UNTEAMED example past deadline: "Dev Patel — teamless past 11:00 AM
   deadline — see walk-in matching desk, Hall B" as the recovery state.

4. LiveOpsDashboard.tsx (Organizer — THE hero screen)
   (a) Live counters strip updating via Firestore onSnapshot in real time:
       Checked in 214/260 | Teams formed 48 | Submissions 22 | Judging 14/22.
       Numbers pulse-animate visibly when Firestore data changes.
   (b) Alerts feed seeded with:
       - 2 UNTEAMED alerts ("Ishita Rao — teamless past 11:00 AM deadline")
       - 1 SCORING_AT_RISK card ("Judging pace: 14/22 scored, cutoff 3:30 PM — behind pace" in red)
       - 1 NO_SHOW summary ("46 registered not checked in — close window in 23 min")
       All alerts have "Send Reminder" action buttons.
   (c) Judge Assignment Queue: 5 rows showing team name, judge, status chip
       (SCORED / AWAITING_JUDGE / UNDER_REVIEW).
   (d) Gemini Score Variance alert card (visible without scrolling):
       "⚡ Gemini AI Score Review — Team Orion: Score variance 25pts between
       Judge A (65) and Judge B (90). Divergence in Innovation. Review before publish."
       [Review Scores] button.
   (e) Check-in sparkline: last 3 hours of check-in timestamps — real chart.
   Label (amber banner): "⚡ Powered by Gemini AI — detects scoring inconsistencies and flags unteamed participants"

5. AnnouncementCenter.tsx (Organizer)
   Composer: title, body, severity selector (NORMAL / CRITICAL), "Broadcast to All" button
   (sends via FCM topic + writes to Firestore with Gemini-generated tldr field).
   Broadcast history list with viewership: "seen by 187/224".
   One SUPERSEDED example with strikethrough.

6. CheckinScanner.tsx (Organizer / volunteer)
   Input field simulating QR code scan entry.
   Typing a seeded registrationCode instantly:
   - Flips that participant from REGISTERED to CHECKED_IN in Firestore
   - Live Ops counter increments in real time without refresh
   THIS IS THE WOW MOMENT: scan → dashboard number moves.
   Show a participant lookup card when code is entered: name, photo-placeholder,
   skills, team status. Green confirmation flash on success.

---

GEMINI FEATURES (all three visibly active — not chatbots):

Feature 1 — TEAMMATE MATCHMAKING (FindMyTeam.tsx):
Call GET /api/gemini-match with participant skills + candidate pool from Firestore.
Server calls Gemini: "Rank these candidates for a participant who wants [skills].
Return top 3 with a one-line reason each."
Display ranked cards with "⚡ Gemini match" label.

Feature 2 — ANNOUNCEMENT TL;DR (AnnouncementCenter.tsx + ParticipantHome.tsx):
When organizer broadcasts, server calls Gemini: "Summarize in one line: [announcement body]"
Store result in tldr field. ParticipantHome shows tldr beneath each announcement title.

Feature 3 — SCORE VARIANCE ALERT (LiveOpsDashboard.tsx):
When judge scores are submitted, server calls Gemini: "Judge scores for [team]: [scores].
Flag variance >15pts, identify likely criterion, recommend review."
Display as AI alert card in Organizer view.

---

SEED DATA FUNCTION (auto-runs on startup — mandatory):

seedDatabase() checks if /participants is empty. If empty, writes:

Participants (8):
  - Aanya Sharma | CHECKED_IN | Team Orion | registrationCode: "EVT-001"
  - Rahul Verma | CHECKED_IN | Team Orion | registrationCode: "EVT-002"
  - Priya Nair | NO_SHOW | Team Nexus | registrationCode: "EVT-003"
  - Karan Mehta | CHECKED_IN | Team Nexus | registrationCode: "EVT-004"
  - Ishita Rao | CHECKED_IN | no team (SOLO) | registrationCode: "EVT-005"
  - Dev Patel | LATE_ARRIVAL | no team (UNTEAMED — past deadline) | registrationCode: "EVT-006"
  - Rohan Kulkarni | CHECKED_IN | Team Pulse | registrationCode: "EVT-007"
  - Sneha Iyer | CHECKED_IN | Team Pulse | registrationCode: "EVT-008"

Teams (4):
  - Team Orion | TEAM_CONFIRMED | submissionStatus: SUBMITTED | projectLink: "github.com/orion/hackproject"
  - Team Nexus | TEAM_FORMING (Priya NO_SHOW) | submissionStatus: DRAFT
  - Team Pulse | TEAM_CONFIRMED | submissionStatus: UNDER_REVIEW
  - Team Vertex | TEAM_CONFIRMED | submissionStatus: SCORED

Judges (3):
  - Prof. Meera Pillai | JUDGE_OVERDUE | assignedTeams: [Orion, Nexus, Pulse] | scoredTeams: [Nexus]
  - Dr. Arjun Rao | EVALUATION_COMPLETE | assignedTeams: [Pulse, Vertex] | scoredTeams: [Pulse, Vertex]
  - Ms. Kavita Singh | EVALUATION_COMPLETE | assignedTeams: [Orion] | scoredTeams: [Orion]

Scores (4 submitted):
  - Team Orion / Prof. Meera: functionality:22, innovation:20, presentation:21, implementation:24 | total:87
  - Team Orion / Dr. Arjun: functionality:18, innovation:15, presentation:16, implementation:16 | total:65 (variance trigger)
  - Team Nexus / Ms. Kavita: functionality:21, innovation:22, presentation:20, implementation:23 | total:86
  - Team Pulse / Dr. Arjun: functionality:19, innovation:21, presentation:20, implementation:24 | total:84

Announcements (4):
  - "Round 2 Now Open" | NORMAL | LIVE | tldr: "Judging starts 3:30 PM, submit by 4:00 PM."
  - "Track B moved to Lab 2, floor 3" | CRITICAL | LIVE | tldr: "Track B is now in Lab 2, 3rd floor."
  - "Lunch break extended by 20 min" | NORMAL | SUPERSEDED | tldr: "Lunch now ends at 1:20 PM."
  - "Final presentations in Seminar Hall B" | NORMAL | LIVE | tldr: "Finals moved to Seminar Hall B."

Check-in timestamps: spread across last 3 hours so sparkline is real (not flat).
Every status in STATUS STATE MAP must have at least one visible example.

---

FIRESTORE SECURITY RULES — write this exact content to firestore.rules:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}

---

DOCKERFILE (write at repo root):
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 8080
CMD ["node", "server.js"]

Express server listens on process.env.PORT — never hardcode 3000 or 8080.

---

TECH STACK:
- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS
- Backend: Express.js (serves React + /api/config + /api/gemini-match + /api/gemini-analysis)
- Database: Firestore with onSnapshot real-time listeners
- Auth: Firebase Auth, role stored in Firestore /users/{uid}.role
- AI: Gemini API (gemini-1.5-pro)
- Storage: Firebase Cloud Storage (project file uploads)
- Notifications: Firebase Cloud Messaging (broadcast announcements)

---

NO DEMO MODE RULE:
If Firebase config fails, fix /api/config runtime delivery — never fall back to
hardcoded mock data, static mockups, or bypassed auth. Demo mode scores zero.

---

Before finishing, verify:
[] Run app locally — landing screen shows real data, not a blank page
[] If blank: check Firestore rules allow unauthenticated reads AND seedDatabase() ran
[] No login wall on load — opens directly to LandingPage with demo credentials visible
[] Core wow moment works: type registrationCode in CheckinScanner → Live Ops counter ticks live
[] Gemini teammate matches visible on FindMyTeam with "⚡ Gemini match" label
[] Gemini TL;DR visible beneath each announcement on ParticipantHome
[] Gemini score variance alert card visible on LiveOpsDashboard without scrolling
[] QR code renders on ParticipantHome from registrationCode — not a placeholder
[] Every STATUS STATE MAP status has at least one visible seeded example
[] Status chips use exact STATUS STATE MAP labels — zero invented variants
[] Dockerfile present, server uses process.env.PORT, firestore.rules file exists
