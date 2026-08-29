# Template A — Core Skeleton
> Rationale: First build prompt. PLANNING mode. Establishes all 4 screens, Firestore schema,
> Gemini score-variance feature, seed data, runtime Firebase config pattern, and Dockerfile.
> QR code view added to Participant Home to cover virtual check-in requirement.

---

Read @promptwars-project-context.md for all project config, credentials, stack rules,
Dockerfile, and port requirements. Do not ask for any of these values — they are in that file.

This application must use:
- Firebase Auth (Email/Password + Google SSO) for role-based access (participant / judge / organizer)
- Firestore for all real-time state: check-ins, teams, scores, announcements, leaderboard
- Gemini API for score variance detection: Gemini reads all judge scores for a team and flags
  when two judges diverge by more than 15 points — surfacing this as an actionable alert
  in the Organizer Command Center
- Cloud Run deployment via ./deploy.sh
- Firebase Cloud Messaging for push notifications on announcements (Tier 2 — fits because
  the problem explicitly requires broadcast alerts and real-time announcements)

Do not use any non-Google backend services. Do NOT use Firebase Hosting.

---

BUILD: Smart Event Management Platform — "EventPulse"

A real-time, multi-role event coordination platform for hackathons and tech fests.
Three distinct role-based dashboards. State changes propagate live via Firestore listeners.
Gemini AI surfaces coordination intelligence that humans cannot track manually.

FIREBASE CONFIG — RUNTIME DELIVERY (mandatory, do not skip):
Vite compiles VITE_FIREBASE_* at build time. Firebase credentials are NOT available at
Docker build time on Cloud Run. Every VITE_FIREBASE_* variable becomes undefined → blank page.

THE ONLY CORRECT PATTERN:
1. Express server reads Firebase env vars from process.env at startup
2. Expose GET /api/config → returns Firebase config as JSON
3. React app fetches /api/config on first load, calls initializeApp() with result
4. NEVER use import.meta.env.VITE_FIREBASE_* anywhere in the codebase

Example server.js endpoint:
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

Example firebase.ts:
export async function initFirebase() {
  const config = await fetch('/api/config').then(r => r.json());
  const app = initializeApp(config);
  return { auth: getAuth(app), db: getFirestore(app) };
}

---

FIRESTORE SCHEMA — implement all collections exactly as specified:

/events/{eventId}
  name: string           // "AbhiyantriX TechFest 2026"
  date: timestamp        // 2026-08-29
  currentRound: string   // "Round 2"
  roundDeadline: timestamp
  status: string         // ROUND ACTIVE | SCORING IN PROGRESS | LEADERBOARD LIVE

/participants/{userId}
  name: string           // "Aanya Sharma"
  email: string
  skills: string[]       // ["React", "ML", "UI Design"]
  role: string           // "Frontend Developer"
  teamId: string | null
  checkInStatus: string  // CHECKED IN | NOT CHECKED IN | LATE ARRIVAL
  checkInTime: timestamp | null

/teams/{teamId}
  name: string           // "Team Orion"
  members: string[]      // [userId, userId, ...]
  status: string         // TEAM COMPLETE | PENDING MEMBER | TEAM LOCKED
  projectLink: string | null
  submissionStatus: string  // SUBMISSION OPEN | MISSED SUBMISSION | DISQUALIFIED

/judges/{userId}
  name: string           // "Prof. Meera Pillai"
  assignedTeams: string[]  // [teamId, ...]
  scoredTeams: string[]
  status: string         // EVALUATION COMPLETE | JUDGE OVERDUE

/scores/{scoreId}
  teamId: string
  judgeId: string
  criteria: {
    functionality: number   // 0-25
    innovation: number      // 0-25
    presentation: number    // 0-25
    implementation: number  // 0-25
  }
  total: number
  feedback: string
  submittedAt: timestamp

/announcements/{announcementId}
  title: string
  body: string
  sentAt: timestamp
  sentBy: string   // organizer userId
  readBy: string[] // [userId, ...]

/leaderboard/{teamId}
  rank: number
  teamName: string
  totalScore: number     // average across all judges
  scores: number[]       // one per judge
  published: boolean

---

SCREENS TO BUILD (build all 4 in Template A):

1. PARTICIPANT HOME (primary screen — build this first)
Design: Dark background (#0f172a), card-based layout, accent color #6366f1 (indigo)
Visual priority order (top to bottom):
  a) Status bar: "CHECKED IN" green chip OR "NOT CHECKED IN" amber chip with "Show QR" button
  b) MY QR CODE section: display a QR code generated from the participant's userId.
     Use the qrcode npm package to render the QR inline as an SVG or canvas element.
     This QR code is scanned by the organizer/volunteer at entry for check-in verification.
     Show it prominently when check-in status is NOT CHECKED IN — collapsed/small when CHECKED IN.
     Label: "Show this QR at entry" with the participant's name and event name below it.
  c) Team card: team name "Team Orion", members list, "TEAM COMPLETE" badge, project link status
  d) Round card: "ROUND 2 ACTIVE — Submit by 4:00 PM" with live countdown (47:23 remaining)
  e) Rank card: "#3 of 18 teams — 2.4 pts behind #2" — only shows once leaderboard is published
  f) Announcements strip: unread count badge, latest announcement title
  g) "Find Teammates" button — only visible if teamId is null

Populate with pre-seeded participant: Aanya Sharma, CHECKED IN, Team Orion (TEAM COMPLETE),
Round 2 active, rank #3.

2. ORGANIZER COMMAND CENTER
Design: Same dark theme, two-column layout on desktop, single column mobile
Left column:
  - Live check-in counter: "143 / 200 checked in" with real-time progress bar
  - Alerts panel: JUDGE OVERDUE (Prof. Meera Pillai — 3 teams unscored, 18 min to deadline),
    LATE ARRIVAL (Ravi Kumar — has not checked in), MISSED SUBMISSION (Team Nexus)
  - All alerts are actionable: "Send Reminder" button on each
Right column:
  - Judge progress: 3/5 judges EVALUATION COMPLETE, 2 JUDGE OVERDUE with names
  - Announcement Composer: title + body fields + "Broadcast to All" button
  - Leaderboard control: "Publish Leaderboard" button (only active when all judges complete)

3. JUDGE DASHBOARD
Design: Same dark theme, focused single-column layout
Top: "Your Queue — 4 teams remaining | Deadline: 18 min"
Queue list: each team card shows team name, project name, "Score Now" button
EVALUATION COMPLETE items: team name + total score + timestamp, collapsed
Active score form (appears inline when "Score Now" is tapped):
  - Rubric sliders: Functionality (0-25), Innovation (0-25), Presentation (0-25), Implementation (0-25)
  - Running total shown live
  - Feedback text area
  - "Submit Score" button — Firestore write on tap, card moves to EVALUATION COMPLETE list

4. LIVE LEADERBOARD
Design: Gradient header (#6366f1 to #8b5cf6), table/card list below
Rank | Team Name | Score | Status chip
Data: Team Orion #1 (88.5), Team Nexus #2 (86.0), Team Pulse #3 (84.5), Team Vertex #4 (81.0)
Score chips: green for top 3, amber for 4-10, default for rest
"SCORING IN PROGRESS" banner when leaderboard is not yet published
"LEADERBOARD LIVE" banner when published

---

GEMINI AI FEATURE — SCORE VARIANCE ALERT (visible in Organizer Command Center):

When all judges have scored a team, Gemini reads the scores and generates this analysis:
Prompt to Gemini: "Judge scores for Team Orion: [87, 65, 90]. Identify if variance is high
(>15 points between any two judges). If yes, explain which criteria likely caused the gap
and recommend whether the organizer should request a re-evaluation."

Display in organizer view as an AI alert card:
Gemini AI Score Review — Team Orion
"Score variance detected: 25 points between Judge B (65) and Judge C (90).
High divergence in Innovation criterion. Recommend: organizer reviews Judge B's rubric notes
before publishing leaderboard."
[Review Scores] button -> opens score detail

This feature is visible without scrolling on the Organizer Command Center.
Label: "Powered by Gemini AI — detects scoring inconsistencies across judge panels"

---

SEED DATA FUNCTION (auto-runs on first load — mandatory):

Implement seedDatabase() that:
1. Checks if /participants collection is empty
2. If empty, writes ALL of this data:

Participants (6):
  - Aanya Sharma | aanya@example.com | Skills: React, ML, UI Design | CHECKED IN | Team Orion
  - Rahul Verma | rahul@example.com | Skills: Node.js, Python | CHECKED IN | Team Orion
  - Priya Nair | priya@example.com | Skills: Flutter, Firebase | NOT CHECKED IN | Team Nexus
  - Karan Mehta | karan@example.com | Skills: DevOps, Cloud | CHECKED IN | Team Nexus
  - Sneha Joshi | sneha@example.com | Skills: ML, Data Science | CHECKED IN | null (no team)
  - Dev Patel | dev@example.com | Skills: UI/UX, Figma | LATE ARRIVAL | null (no team)

Teams (4):
  - Team Orion | members: [Aanya, Rahul] | TEAM COMPLETE | projectLink: "github.com/orion/hackproject"
  - Team Nexus | members: [Priya, Karan] | PENDING MEMBER (Priya not checked in)
  - Team Pulse | members: [3 members] | TEAM COMPLETE
  - Team Vertex | members: [2 members] | TEAM LOCKED

Judges (3):
  - Prof. Meera Pillai | assignedTeams: [Orion, Nexus, Pulse] | JUDGE OVERDUE (1 remaining)
  - Dr. Arjun Rao | assignedTeams: [Pulse, Vertex] | EVALUATION COMPLETE
  - Ms. Kavita Singh | assignedTeams: [Orion, Nexus] | EVALUATION COMPLETE

Scores (4 already submitted):
  - Team Orion / Prof. Meera: functionality:22, innovation:20, presentation:21, implementation:24 | total:87
  - Team Orion / Dr. Arjun: functionality:18, innovation:15, presentation:16, implementation:16 | total:65
  - Team Nexus / Ms. Kavita: functionality:21, innovation:22, presentation:20, implementation:23 | total:86
  - Team Pulse / Dr. Arjun: functionality:19, innovation:21, presentation:20, implementation:24 | total:84

Announcements (2):
  - "Round 2 Now Open" | "Judging begins at 3:30 PM. All teams must submit project links before 4:00 PM." | 14:05
  - "Venue Change: Final presentations in Seminar Hall B" | 13:50

3. seedDatabase() is called automatically on app startup — not triggered by a button

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

Express server must listen on process.env.PORT (not hardcoded 3000 or 8080).

---

TECH STACK:
- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS
- Backend: Express.js (serves React app + /api/config + /api/gemini-analysis)
- Database: Firestore (real-time listeners on all live data)
- Auth: Firebase Auth with role claim in Firestore /users/{uid}.role
- AI: Gemini API (gemini-1.5-pro) for score variance analysis

---

VISUAL DESIGN REQUIREMENTS:
- Dark theme: background #0f172a, card background #1e293b, borders #334155
- Accent: #6366f1 indigo — buttons, active states, progress bars
- Status chips: CHECKED IN -> green (#22c55e), NOT CHECKED IN -> amber (#f59e0b),
  LATE ARRIVAL -> red (#ef4444), TEAM COMPLETE -> green, PENDING MEMBER -> amber,
  JUDGE OVERDUE -> red, EVALUATION COMPLETE -> green
- Typography: Inter font (Google Fonts)
- All cards have subtle gradient borders
- Live data updates with a brief pulse animation (ring-pulse) when values change

---

NO DEMO MODE RULE:
If Firebase config fails or any credential is missing, DO NOT fall back to hardcoded
demo data, static mockups, or bypassed auth. The fix is always: implement the
/api/config runtime delivery pattern correctly. Never work around it.

---

Before finishing, verify:
[] Run the app locally — confirm landing screen shows real data, not a blank page
[] If blank: check Firestore rules allow unauthenticated reads AND seedDatabase() ran
[] No login wall on load — app opens directly to Participant Home (role switcher in top nav)
[] Core interaction completes in under 30 seconds (check-in -> team view -> round status)
[] Gemini score variance alert is visibly active on the Organizer Command Center
[] QR code renders on Participant Home from participant userId — not a placeholder image
[] Real data on every screen — no placeholder text anywhere
[] Status chips match the Status State Map exactly
[] Dockerfile present, server uses process.env.PORT, firestore.rules file exists
