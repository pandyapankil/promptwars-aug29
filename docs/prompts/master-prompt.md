# PromptWars x AbhiyantriX — Master Hackathon Prompt
> August 29, 2026 | Paste this entire document into AntiGravity (Claude Sonnet 4.6 Thinking) at 2:00 PM sharp.
> AntiGravity IS the thinking layer AND the builder. One tool. One tab. No switching.

---

## HARD CONSTRAINTS (non-negotiable)

- **Tool:** Google AntiGravity only. No manual code.
- **Time:** 2:00 PM – 5:00 PM (3 hours total)
- **Rounds:** Warm-up + Main Challenge. Each has 2 submissions. Scored separately.
- **Solo** participation.
- **Submission requires:** working prototype URL + source code repo + documentation.
- **Round 2 pitch:** 6:30 PM — live pitch to non-technical jury.
- **Judging criteria:**
  - Functionality — HIGH impact
  - Prompt Engineering Leverage — HIGH impact
  - Innovation — MEDIUM impact
  - Practical Problem-Solving — MEDIUM impact
  - Presentation — HIGH impact
- **MANDATORY TECHNICAL REQUIREMENT:** Must use as many Google services as possible.
  Must deploy to Google Cloud Run serverless. Without this, submission is invalid.

---

## GOOGLE SERVICES STACK (mandatory — bake into every AntiGravity prompt)

### Tier 1 — Always use. Zero setup. Built into AntiGravity + AI Studio.

| Service | Role in every submission |
|---|---|
| **Google Cloud Run** | Serverless deployment — MANDATORY. One-click deploy from AI Studio. |
| **Firebase Auth** | User authentication — covers Security judging criterion |
| **Firestore** | Database — covers Functionality judging criterion |
| **Gemini API** | AI features inside the app — covers Prompt Engineering Leverage criterion |

These four are non-negotiable. Every submission must use all four.
They deploy together in one click from AI Studio — no manual setup.

### Tier 2 — Use ONLY if the problem genuinely fits. Each adds Innovation points.

⚠️ ESCAPE CLAUSE: If no Tier 2 service genuinely fits this problem, skip it entirely.
Do NOT create stub integrations to satisfy this list. Stub code is visible in the
repo and directly violates the "no placeholder" rule. Fake breadth costs more than
it gains. One genuine Tier 2 integration beats three cosmetic ones.

| Service | Use when |
|---|---|
| **Firebase Cloud Messaging** | Problem involves reminders, alerts, or notifications |
| **Cloud Storage** | Problem involves file uploads, documents, or images |
| **Google Maps API** | Problem involves location, logistics, or routing |
| **Cloud SQL** | Problem involves structured/relational data |
| **Vertex AI** | Problem needs advanced ML beyond Gemini chat |
| **Google Workspace APIs** | Problem involves Sheets, Calendar, or Gmail integration |

### Tier 3 — Mention in README even if lightly used. Shows breadth of Google stack.

| Service | What to say in README |
|---|---|
| **Cloud Logging** | "All actions are logged via Cloud Logging for audit trail" |
| **Cloud Build** | "CI/CD pipeline configured via Cloud Build" |
| **Firebase Analytics** | "User interactions tracked via Firebase Analytics" |

### How to instruct AntiGravity to use these services

All project config (Firebase credentials, GCP project, repo URL, Dockerfile,
port rules, stack constraints) lives in @promptwars-project-context.md.
Every generated AntiGravity prompt must begin with a reference to that file.
You never paste config manually — AntiGravity reads it directly.

### Cloud Run Pre-Flight Checklist (run before every submission deploy)

```
□ App listens on $PORT environment variable — not hardcoded 3000 or 8080
  (hardcoded port = silent 503 on Cloud Run)
□ Cloud Run service allows unauthenticated invocations
  (default IAM blocks all traffic — scorer gets 403, your browser doesn't)
□ Deploying to SAME service name, new revision — not a new service
  (new service = full cold start = 5–10 min you don't have)
□ Firestore rules allow unauthenticated reads
  (default deny = app appears empty to scorer)
□ Demo credentials visible on landing screen if auth is present
□ Gemini API key is a Cloud Run env var, not in source code
□ Deployed URL loads in under 5 seconds on a fresh browser tab
```

### Deployment Cadence — 4 submissions = 4 deploys, not 1

⚠️ You have up to 4 scored submissions. Each submission is scored against
the LIVE URL at the time of submission. One deploy at 4:45 PM means your
Round 1 submissions are never scored on your best work.

| Submission | Deploy when |
|---|---|
| Warm-up Submission 1 | Deploy immediately before submitting (~2:43 PM) |
| Warm-up Submission 2 | Deploy immediately before submitting (~3:03 PM) |
| Main Challenge Submission 1 | Deploy immediately before submitting (~3:48 PM) |
| Main Challenge Submission 2 | Deploy immediately before submitting (~4:48 PM) |

Each deploy takes 2–3 minutes on subsequent revisions (same service).
First deploy of the day may take 5–10 minutes — do a test deploy before 2 PM.

### README — Prompt Engineering Approach section must name every Google service used

Example:
> "Built using Google AntiGravity with Gemini 3 Pro. Stack: Firebase Auth,
> Firestore, Gemini API, Cloud Run. Used [Tier 2 service] for [specific feature].
> Deployed serverlessly to Cloud Run via one-click AI Studio publish."

This directly scores both Prompt Engineering Leverage AND Problem Statement Alignment.

## ANTIGRAVITY SETUP (do this before 2 PM)

**Model selection — CASCADE STRATEGY (quota-aware):**

⚠️ QUOTA REALITY:
- Claude Sonnet 4.6 Thinking: exhausts in ~1 hour (all Claude models share quota)
- Gemini 3.1 Pro High: exhausts in ~1.5 hours
- Gemini 3.7 Flash High: no observed quota limit
- Hackathon: 3 hours
- Context survives model switches — switch mid-conversation without losing anything

**USE MODELS IN THIS EXACT CASCADE ORDER:**

| Phase | Model | Why |
|---|---|---|
| Step 0 + Steps 1–6 + Template A (planning + execution) | **Claude Sonnet 4.6 (Thinking)** | Hardest work. Highest failure cost. Use best model here. |
| Template B + Step 8B diagnosis + fixes | **Gemini 3.1 Pro High** | Strong enough for coordination layer. Pro quota lasts. |
| Template C + final polish + README + pitch script | **Gemini 3.7 Flash High** | Explicit numbered items — Flash handles this reliably. |

**HOW TO SWITCH MODELS:**
When Claude quota exhausts → open AntiGravity model selector → switch to Gemini 3.1 Pro High.
The conversation context is fully preserved. The new model sees everything built so far.
Say nothing to the new model — it picks up exactly where Claude stopped.
When Gemini Pro exhausts → switch to Gemini 3.7 Flash High. Same process.

**NEVER USE:**
- Claude Opus 4.6 (Thinking) — burns quota in minutes, no time benefit
- Gemini 3.1 Pro Low — too shallow for these templates
- Gemini 3 Pro — superseded, do not use
- Gemini 3.6 Flash — 3.7 Flash is newer, use that instead

**Known failure modes defended in templates:**
1. Template B regression (Gemini rewrites existing screens) → explicit file list + hard prohibition
2. VITE_FIREBASE_* reversion → forbidden pattern rule with consequence
3. Demo mode fallback → NO DEMO MODE rule in Template A
4. Flash shallow on nested instructions → Template C uses numbered binary items only

- **Terminal Policy:** Auto (no permission interruptions for routine commands)
- **Review Policy:** Agent-assisted (you stay in control, agent handles safe automations)

**Mode strategy — one rule, no conflicts:**

**PLANNING mode** = any first prompt on a NEW problem domain (Warm-up Template A,
and Main Challenge Template A IF the problem changed after warm-up).
**FAST mode** = everything else (Templates B, C, all diagnosis fixes, and Main
Challenge Templates A/B/C if the problem is the SAME as warm-up).

| Prompt | Mode | Condition |
|---|---|---|
| Warm-up Template A | **PLANNING** | Always — first prompt on new domain |
| Warm-up Template B | **FAST** | Skeleton confirmed, direction set |
| Warm-up Template C | **FAST** | Polish pass only |
| Step 8B diagnosis fix | **FAST** | Surgical fix — always |
| Main Challenge Template A | **PLANNING** | ONLY if problem changed after warm-up |
| Main Challenge Template A | **FAST** | If problem is SAME as warm-up |
| Main Challenge Templates B+C | **FAST** | Always |

**How to use Planning mode correctly:**
When the agent produces its plan, do not just approve it blindly.
Add one or two targeted corrections as comments before approving:
- *"Prioritise [primary actor]'s home screen first"*
- *"Add real-looking fake data on every screen from the start — no empty states"*
- *"The core interaction must be completable in under 30 seconds"*
Then approve. This is where Prompt Engineering Leverage is earned.

## SUBMISSION STRATEGY (read before 2 PM)

### VERIFY BEFORE EVENT DAY — email teamabhiyantrix@gmail.com and confirm:
1. Are per-criterion scores visible on the leaderboard or only aggregate totals?
   (If aggregate only, Step 8B diagnosis changes — see below)
2. Do both submissions per round count independently, or is it best-of-two?
   (If both count independently, a bad second submission could LOWER your standing
   — never submit a second time unless you are confident it is better than the first)
3. Will warm-up and main challenge share the same problem statement?

### The 4-Submission Meta-Game

**What each submission contains:**
- Warm-up Submission 1 = Template A built and deployed
- Warm-up Submission 2 = Templates A+B+C polished and deployed
- Main Challenge Submission 1 = Template A built (fresh domain if changed, layered if same)
- Main Challenge Submission 2 = Templates A+B+C polished with surgical fix applied

**What each submission requires:** prototype URL + repo + README.
Write a README before EVERY submission — not just the final one.
For Submissions 1 and 3 (first of each round): 3-minute README only.
For Submissions 2 and 4 (second of each round): full README per Step 9.

The warm-up is not practice. It serves two purposes:
1. **Self-diagnosis** — your aggregate score + incognito check tells you what to fix
2. **Grader inference** — compare your score against the public leaderboard
   to infer which qualities the scorer rewards most. Make exactly ONE surgical
   change between Submission 1 and 2. Attribute the aggregate delta to that change.
   This turns your second submission into instrumentation for the main challenge.
   The leaderboard winner at warm-up dropped to #2 in main challenge —
   likely because they over-fit to warm-up patterns without re-inferring.

**Also: measure leaderboard lag before 2 PM.**
During the pre-event test deploy window, observe when other participants'
warm-up scores appear on the leaderboard after they submit. If lag is
5–15 minutes, your 2:50 PM diagnosis may read stale scores. Calibrate
your diagnosis loop to observed lag before trusting Step 8B.

**If warm-up and main challenge share the SAME problem:**
→ Layer on top. Incrementally add — do not regenerate existing screens.
→ Apply the fix from warm-up diagnosis as an additive layer, not a rebuild.
→ Run Step 0 briefly to confirm no reframing needed.

**If the problem CHANGES after warm-up:**
→ Step 0 is a REPEATABLE RITUAL — run it fresh. Full 10 minutes.
→ Do NOT carry warm-up domain vocabulary, screen inventory, or status states forward.
→ Those artifacts belong to the warm-up domain. The main challenge needs its own.
→ Use the same prompt structure. The framework transfers. The content does not.
→ Run Template A in PLANNING mode — new domain, new plan needed.

---

## TIME MAP

> **PARALLEL AGENT RULE:** AntiGravity 2.0 supports multiple agents simultaneously.
> Agents are fully isolated — they do NOT share file state.
> Safe to run in parallel: master prompt conversation + builder conversation (already your setup).
> Safe to overlap: README writing + Template B building (both independent at that moment).
> Never run Template B before Template A is verified working — B depends on A's file state.

| Time | Action |
|---|---|
| **Before 2 PM** | Test deploy to Cloud Run — pay cold start cost now, not during competition |
| **Before 2 PM** | Observe leaderboard — measure lag from submit to score appearing. Note the delay. |
| **Before 2 PM** | Create docs/prompts/ folder in repo. First commit. |
| **2:00 PM** | Problem drops. Paste below. Run Step 0 Parts A+B+C (10 min). |
| **2:05 PM** | ⚡ Write HOOK sentence now (Step 0 Part C). Lock it. Do not revisit. |
| **2:10 PM** | Run Steps 1–6. Template A in builder conversation — PLANNING mode. |
| **2:10 PM** | Save Template A prompt to docs/prompts/01-template-a.md. Commit. |
| **2:40 PM** | ⚡ PARALLEL WINDOW: In master prompt conversation → write SHORT README (3 min). |
|             | Simultaneously in builder conversation → fire Template B — FAST mode. |
|             | README write + Template B build run at the same time. Saves ~5 min. |
|             | Wait for Template B to finish before running pre-flight checklist. |
| **2:48 PM** | Run pre-flight checklist. Deploy (same service, new revision). |
| **2:51 PM** | Incognito check — 3 MINUTES MAX. Two clicks only: landing + core interaction. Stop. |
| **2:54 PM** | Warm-up Submission 1. Note score + leaderboard top 3 (accounting for lag). |
| **2:58 PM** | Run Step 8B. IF app is broken → fix broken thing first (broken beats instrumented). |
|             | IF app works → make exactly ONE surgical change for grader instrumentation. |
| **2:58 PM** | Save fix prompt to docs/prompts/02-warmup-fix.md. Commit. |
| **3:00 PM** | Run Template C in builder conversation — FAST mode. |
| **3:02 PM** | Run pre-flight checklist. Deploy. Incognito check (3 min max, two clicks). |
| **3:05 PM** | Warm-up Submission 2. Attribute score delta to the ONE change (treat as signal, not proof). |
| **3:08 PM** | Note grader inference. Re-run Step 0 Part A+B briefly if problem changed. |
| **3:10 PM** | Main Challenge — Template A in builder conversation. PLANNING if changed. FAST if same. |
| **3:10 PM** | Save Main Challenge Template A to docs/prompts/04-mc-template-a.md. Commit. |
| **3:45 PM** | ⚡ PARALLEL WINDOW: In master prompt conversation → write SHORT README (3 min). |
|             | Simultaneously in builder conversation → fire Template B — FAST mode. |
|             | Wait for Template B to finish before running pre-flight checklist. |
| **3:53 PM** | Run pre-flight checklist. Deploy. Incognito (3 min max). |
| **3:56 PM** | Main Challenge Submission 1. Note score + leaderboard. |
| **4:00 PM** | Run Step 8B. Broken → fix broken. Working → ONE surgical change. Save + commit. |
| **4:10 PM** | Template C — FAST mode in builder conversation. |
| **4:20 PM** | Run pre-flight checklist. Final deploy. Incognito check (3 min max). |
| **4:25 PM** | Write FULL README (Step 9) in master prompt conversation. |
| **4:47 PM** | Run pre-flight checklist. Verify final deploy is stable. Incognito check. |
| **4:48 PM** | Record 60-second walkthrough video NOW — after final deploy, not before. |
|             | (Prevents video documenting a state that the final deploy changed.) |
| **4:50 PM** | Link video in README. Main Challenge Submission 2. |
| **4:55 PM** | Buffer. Verify submission confirmed. |
| **5:00 PM** | Hard deadline. |
| **5:00–6:30 PM** | Watch your walkthrough recording. Rehearse full pitch script against it. |

---

## PASTE PROBLEM STATEMENT BELOW THIS LINE
Organizing large-scale events like hackathons, tech fests, and conferences currently requires juggling multiple disjointed platforms for registration, attendee verification, team formation, announcements, judging, and live tracking. This fragmented workflow creates administrative overhead, delays, and poor experience for both organizers and participants.



The Challenge

Design and build a unified, real-time Smart Event Management Platform that consolidates the end-to-end event lifecycle into a single interactive dashboard.



Key Features & Requirements

Registration & Attendee Check-in: Streamlined registration system that generates unique QR codes for fast on-site or virtual attendance scanning and verification.

Smart Team Formation: Dynamic matchmaking or discovery portal allowing individual participants to find teammates based on skills, roles, and project interests.

Broadcast & Announcement Center: Real-time push notifications or live updates feed for schedule changes, venue alerts, and critical announcements.

Interactive Judging Portal: Dedicated view for judges to evaluate submissions against defined rubrics, leave structured feedback, and submit scores securely.

Live Leaderboard & Analytics: Dynamic leaderboard displaying real-time rankings and aggregate scores, alongside an organizer analytics view for attendance and engagement tracking.



Target Deliverables

System Architecture / UX Wireframes: Clear visualization of the multi-role flow (Participant, Judge, Organizer).

Interactive Prototype / App Interface: A functional dashboard showcasing live data updates across check-ins, scoring, and leaderboard updates.

---

## WHEN I PASTE THE PROBLEM STATEMENT, RUN THIS IMMEDIATELY.
## DO NOT ASK CLARIFYING QUESTIONS. EXECUTE EVERY STEP IN ORDER.

---

### STEP 0 — VAGUENESS EXPANSION + STACK LEVERAGE DECISION

PromptWars problem statements are intentionally vague — often just 2–3 sentences.
The winning submission is not the one that took the problem at face value.
It is the one that expanded it furthest AND chose the interpretation that
maximised their own stack's leverage. Vagueness is not just a test of depth —
it is an invitation to choose the angle you can win on.

**PART A — EXPAND (5 minutes)**

Read the problem statement and ask internally:
- What real-world system is this describing?
- Who are ALL the humans who suffer in this system today?
- What are ALL the moments where things break, get lost, or cause anxiety?
- What would a world-class product in this domain look like?
- What has been tried before and why does it fail?

Then expand into a full brief:

EXPANDED PROBLEM BRIEF:
- The real domain this operates in (name it precisely)
- The 3–5 specific human frustrations this domain produces today
- The 2–3 actors who suffer most and what they specifically need
- The 3–5 invisible gaps that exist between interactions in this domain
- The 2–3 time-sensitive moments that change user behaviour in this domain
- The single most important screen that would prove this product works
- The one thing a generic app in this domain always gets wrong

**PART B — PICK YOUR BATTLE (3 minutes)**

This is where taste decides the ceiling. Do not skip it.

The vague problem statement contains multiple valid interpretations.
Your job is not to expand evenly into all of them.
Your job is to identify the 2–3 angles where your stack creates
disproportionate leverage — and build toward those deliberately.

Ask internally:
- Which interpretation makes Firebase/Firestore/Gemini feel ESSENTIAL,
  not bolted on? (real-time state sync, AI summarisation across actors,
  multi-view coordination, urgency detection)
- Which angle has natural actors, natural handoffs, natural time pressure
  that make Gemini features write themselves into the product?
- Which interpretation lets me show something in 60 seconds that a
  non-AI product physically cannot replicate?

Then make a deliberate choice: name the ONE interpretation you are building.
Write it as a single sentence: "I am building the [X angle] of this problem
because it maximises [Gemini feature / real-time state / multi-actor coordination]."

Everything in Steps 1–6 and Templates A/B/C flows from this choice.
Winners interpret. Losers describe.

**PART C — WRITE THE HOOK NOW (2 minutes)**

Before touching AntiGravity, write the pitch HOOK sentence now.
The human pain is fully known before a line of code exists.
It cannot drift as the build evolves.

Format: *"Every [actor] has experienced [specific painful moment]."*

**VIVIDNESS STANDARD — this is what separates a winning hook from an adequate one:**
A weak hook describes a feeling: *"Every student has experienced not knowing if they're on track."*
A strong hook puts the judge IN a scene with dialogue, a location, and a moment of recognition:
*"Every final-year student has sat in a mentor meeting, heard 'so… what have you been up to?'
— and realised they've been quietly stuck for three weeks and nobody noticed."*

To reach scene-level vividness, ask:
- Where is this person physically when the pain happens?
- What specific words do they hear or say?
- What do they realise in that moment that they cannot undo?

Write the hook at scene level. Not feeling level. Not state level. Scene level.
A non-technical judge at 6:30 PM must feel a flicker of recognition — "I've been in that room."

Write it here. Lock it in. It is the first sentence of your pitch at 6:30 PM
regardless of how the product evolves between now and then.

Do NOT begin Step 1 until Parts A, B, and C are complete.
The expansion IS the competitive advantage. Most participants skip it.
Vagueness is the test. Expansion + interpretation + hook lock is the answer.

---

### STEP 1 — EMOTIONAL CONTRACT (2 minutes)

Define what this product must make users feel.
Be specific to THIS problem domain. Not generic. Not reused from another domain.

**Less of:**
Name 6–8 specific negative emotional or operational states the current situation creates.

**More of:**
Name 6–8 specific positive states this product delivers.

This is the product's soul. Every screen must serve it.
Do not move forward until these feel true to the specific problem — not generic.

---

### STEP 2 — ACTOR MAP (3 minutes)

Name every person who touches this system.
For each actor define ALL of the following:

- Their single biggest frustration in one sentence
- What they need to see FIRST when they open the product
- What they must NEVER be confused about
- What they do NOT need to see (as important as what they do)
- What action they need to take most urgently

Also define:
- The dependency relationship between actors
  (who is waiting on whom, who is blocked by whom, who owns what)
- What Actor A needs to see immediately that Actor B does not care about

---

### STEP 3 — THE INVISIBLE GAPS (2 minutes)

Name what happens BETWEEN the main interactions.
What gets dropped, delayed, forgotten, or left unclear between steps?
What does the system do while users are waiting?
These gaps are what this product is ACTUALLY solving.

Name at least 5 specific gaps for this problem.
For each gap: name what the system does to close it.

---

### STEP 4 — TIME AS A DESIGN ELEMENT (2 minutes)

What in this problem is time-sensitive?
Name 5–8 specific moments where time visibility changes user behavior.

For each one define:
- What the timer or countdown shows
- What happens if time passes without action
- What state the system enters (overdue, missed, escalated, expired, blocked)

Use time surgically. Not everywhere. Only where it changes behavior or reduces anxiety.

---

### STEP 5 — DASHBOARD PRIORITY (2 minutes)

For each actor's home screen, define the priority-ordered list of what they see.

Format:
```
Actor: [Name]
1. [Most urgent — answers "what do I do RIGHT NOW?"]
2. [Second priority]
3. [Third priority]
... continue
```

Rules:
- No decorative elements. No vanity metrics.
- Every item must reduce anxiety or drive action.
- The first item must be immediately actionable or immediately reassuring.

---

### STEP 6 — EDGE CASES (1 minute)

Name the 5 most likely breakdown points for this specific problem:
- What if an actor drops off or goes silent?
- What if a deadline is missed?
- What if two actors give conflicting information?
- What if the system is waiting but no one acts?
- What if a user does not understand what to do next?

For each: define the graceful recovery path the system takes automatically.
These must be visible in the UI — not just backend logic.

---

### STEP 7 — ANTIGRAVITY PROMPT SEQUENCE

**THE DEPTH STANDARD:** The winning submission at the last PromptWars was a
healthcare coordination system called HealPing. It won because its prompts were
domain-saturated — every screen was named, every actor's needs were defined,
every edge case was handled, every status state was specified. The prompts you
generate here must reach that same depth for THIS problem's domain.
Generic prompts produce generic outputs. Specific prompts produce winning outputs.

**Before writing any AntiGravity prompt, define these for the specific domain:**

DOMAIN VOCABULARY LIST:
Name 8–12 domain-specific terms, states, or objects from this problem.
Example for healthcare: "care journey, medication adherence, referral pending,
discharge follow-up, prep instructions, symptom log, care gap, escalation."
Use these exact terms throughout every AntiGravity prompt.
This is what makes the output feel real, not generic.

SCREEN INVENTORY:
Name every important screen the product needs — at least 8–10.
For each screen name: its purpose in one sentence and the primary actor who uses it.
AntiGravity will not invent screens you do not name. Name them explicitly.

STATUS STATE MAP:
Name every status state the product needs — across tasks, items, actors, and events.
Example: pending / active / waiting on X / overdue / blocked / completed / escalated / canceled.
Use these exact states as labels in the UI. Do not let AntiGravity invent its own.

GOOGLE SERVICES ANCHOR — FULL VERSION (Template A only):
Begin the prompt with:
"Read @promptwars-project-context.md for all project config, credentials, stack rules,
Dockerfile, and port requirements. Do not ask for any of these values — they are in that file.
This application must use Firebase Auth (Email/Password + Google SSO), Firestore,
Gemini API for [specific AI feature relevant to this problem], and deploy to Cloud Run
via ./deploy.sh. [If Tier 2 service fits: Also use [service] because [specific reason].]
Do not use any non-Google backend services. Do NOT use Firebase Hosting."

GOOGLE SERVICES ANCHOR — SHORT VERSION (Templates B and C only):
Begin the prompt with:
"Read @promptwars-project-context.md for all project config. Same stack and compliance
rules as Template A. Do not modify Firebase Auth, Firestore rules, Dockerfile, or
deployment configuration. Adding product surfaces only — not touching infrastructure."

---

Rules for all three templates:
- Template A gets the FULL anchor. Templates B and C get the SHORT anchor only.
- Use domain vocabulary from the Domain Vocabulary List — never generic terms
- No placeholder UI anywhere
- "No empty states" means: pre-seed all waiting/silent/blocked states with
  realistic example data showing what that state looks like — do not leave them blank.
  Edge case states (actor goes silent, deadline missed) must be SHOWN with fake data,
  not left as empty panels.
- Real-looking fake data from Template A onwards (names, numbers, dates, statuses)
- Every screen must look like a real product, not a wireframe
- The "wow moment" must be visible within 60 seconds of opening the app
- Name screens explicitly — do not let AntiGravity decide what screens to build
- Use the Status State Map labels verbatim as UI chips and tags
- Save every AntiGravity prompt (and Planning mode corrections) to docs/prompts/
  in the repo, chronological, with one-line rationale. Link from README.
  This is direct evidence for Prompt Engineering Leverage scoring.

---

#### TEMPLATE A — Core Skeleton (First submission of any round, first 40 minutes)
**Target:** Prove the product exists. Primary actor's experience end to end.
**Mode:** PLANNING (new domain) or FAST (same domain as warm-up)

Must include:
- Google Services FULL Anchor at the top
- Primary actor's home screen with priority-ordered information (from Step 5)
- The ONE interaction that proves the solution works end to end
- Real-looking fake data on every screen — names, numbers, dates, statuses
- Status chips using exact labels from the Status State Map
- Time elements where relevant — countdowns, urgency states (from Step 4)
- At least one invisible gap made visible (from Step 3)
- At least 2 screens from the Screen Inventory named and built explicitly
- At least one domain-specific Gemini AI feature visibly active on screen
  (must do something a non-AI product cannot do — not just a chatbot)
- Full Firestore schema with all collections, fields, and field types
- FIREBASE CONFIG — RUNTIME DELIVERY (critical — do not skip):
  Vite compiles `import.meta.env.VITE_FIREBASE_*` at build time inside Docker.
  Firebase credentials are NOT available at Docker build time on Cloud Run.
  Result: every VITE_FIREBASE_* variable is undefined → Firebase throws
  `auth/invalid-api-key` at module load → React never mounts → blank page.

  THE CORRECT PATTERN — serve Firebase config from the Express server at runtime:
  1. Express server reads Firebase credentials from process.env at startup
  2. Expose a GET /api/config endpoint that returns the config as JSON
  3. React app fetches /api/config on load, then calls initializeApp() with the result
  4. Never use import.meta.env.VITE_FIREBASE_* anywhere in the codebase

  Example server endpoint:
  ```js
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
  ```

  Example React firebase.ts:
  ```ts
  export async function initFirebase() {
    const config = await fetch('/api/config').then(r => r.json());
    const app = initializeApp(config);
    return { auth: getAuth(app), db: getFirestore(app) };
  }
  ```

  This is the ONLY pattern that works on Cloud Run. Any other approach produces a blank page.

- A working Dockerfile at the repo root that:
  1. Builds the frontend (Vite or equivalent) — no VITE_FIREBASE_* args needed
  2. Copies the build into the Express server's static folder
  3. Exposes process.env.PORT (never hardcodes 3000 or 8080)
  4. Runs CMD ["node", "server.js"] or equivalent
  (Missing Dockerfile = Cloud Run cannot build = silent deploy failure)
- Express server must listen on process.env.PORT — state this explicitly in the prompt
- FIRESTORE SECURITY RULES: Write the actual rules file content explicitly:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
  }
  ```
  AntiGravity must write this to `firestore.rules` and deploy it.
  Default Firestore rules deny all reads → blank page for every unauthenticated visitor.
- SEED DATA FUNCTION: Implement an explicit `seedDatabase()` function that:
  1. Checks if the primary collection is empty on app startup
  2. If empty, writes ALL named actors, ALL status states, and ALL example data
  3. Is called automatically when the app first loads — not manually triggered
  4. Uses the exact names, dates, and statuses specified in the Domain Vocabulary
  A missing or non-automatic seed = blank page for every scorer who visits a fresh URL.
- After generating all files, run the app locally and confirm the landing screen
  renders real data before considering Template A complete.
  If the landing screen is blank: fix Firestore rules and seed data before stopping.
- **NO DEMO MODE RULE:** If Firebase config fails or credentials are missing,
  DO NOT fall back to hardcoded demo data, static mockups, or bypassed auth.
  Demo mode looks like it works but uses no real Google services — scores zero on
  Functionality and Prompt Engineering Leverage. The fix is always: implement the
  /api/config runtime pattern correctly. Never work around it.

Write this as a complete, self-contained AntiGravity prompt.
Be specific. Include example data. Describe the visual hierarchy explicitly.
Write it at HealPing depth — not a paragraph, a full specification.

End Template A with this acceptance checklist:
"Before finishing, verify:
□ Run the app locally — confirm landing screen shows real data, not a blank page
□ If blank: check Firestore rules allow unauthenticated reads AND seedDatabase() ran
□ No login wall on load — app opens directly to main screen
□ Core interaction completes in under 30 seconds
□ Gemini feature is visibly active on [name the specific screen]
□ Real data on every screen — no placeholder text anywhere
□ Status chips match the Status State Map exactly
□ Dockerfile present, server uses process.env.PORT, firestore.rules file exists"

---

#### TEMPLATE B — Coordination Layer (Second prompt, next 35 minutes)
**Target:** Show the system is alive. Second actor. Handoffs. Dependencies.
**Mode:** FAST always

Must include:
- Google Services SHORT Anchor at the top
- Second actor's view or the handoff screen between actors
- Dependency states using exact labels from the Status State Map
- The invisible gap made visible — what happens between steps
- A domain-specific notification or reminder (from Step 4 time elements)
- At least one edge case from Step 6 shown with realistic fake data
  (do not leave it blank — show what the state looks like with example content)
- At least 2 more screens from the Screen Inventory built explicitly
- The Gemini API doing something that a non-AI product cannot do

Write this as a complete AntiGravity prompt.

**⚠️ GEMINI REGRESSION RULE — this model tends to rewrite existing screens.**
End Template B prompt with this exact block — do not paraphrase it:
"HARD RULE: The following files must not be modified under any circumstances:
[list every file name from Template A — e.g. LandingPage.tsx, MentorDashboard.tsx,
StudentHome.tsx, ProgressUpdate.tsx, server.js, firebase.ts, firestore.rules]
If you find yourself editing any of these files: stop, revert, and add new files instead.
Adding only. Never rewriting. Violation of this rule breaks the submission."

End Template B with this acceptance checklist:
"Before finishing, verify:
□ Open each Template A file — confirm its content is identical to when Template A finished
□ All new screens are in NEW files — zero edits to existing Template A files
□ Second actor's view is complete and distinct from first actor's view
□ Gemini feature works across the handoff — not isolated to one screen
□ All edge case states show realistic example data, not empty panels"

---

#### TEMPLATE C — Polish (Final 20 minutes)
**Target:** Submission-ready. Demo-ready. Jury-ready.
**Mode:** FAST always
**Likely running on:** Gemini 3.7 Flash High — write this prompt accordingly.

⚠️ FLASH MODEL INSTRUCTION: This template will likely run on Gemini 3.7 Flash.
Flash is fast but interprets loosely. Every item below must be binary (done/not done),
numbered, and stated as a specific visible action — not a general principle.
No room for interpretation. No vague instructions.

Must include — stated as numbered explicit actions:

**1. DOMAIN LANGUAGE SWEEP**
Find every generic error/status word in the UI ("Error", "Failed", "Pending", "Done",
"Not started") and replace with the domain-specific word from the Status State Map.
Do this screen by screen. List each replacement made.

**2. MISSING STATES — ADD WITH FAKE DATA**
Find every state from the Status State Map that has no visible example in the UI.
Add one pre-seeded example for each missing state. Use real names and dates.
Do not leave any status state without a visible example.

**3. MOBILE PASS**
Every screen must render at 375px without horizontal scroll.
Sidebar collapses to hamburger. Cards stack to single column. Buttons full width.
Chips never truncate. All touch targets minimum 44px height.

**4. GEMINI AI LABEL**
Add this banner to the primary screen: "⚡ Powered by Gemini AI — [one sentence describing what it does]"
This must be visible without scrolling. Non-technical jury must see it in 3 seconds.

**5. DATA CONSISTENCY PASS**
All dates must be consistent relative to event date.
All names must match the Domain Vocabulary exactly — no invented names.
All status chips must use exact Status State Map labels — zero invented variants.

**6. BROKEN INTERACTION SWEEP**
Click every button. If it does nothing: remove it or wire it to show a realistic state.
Zero dead buttons in the final build.

**7. FINAL APP VERIFICATION**
Run the app. Open in incognito. Confirm:
- Landing screen loads with real data (not blank)
- Core interaction completes in under 30 seconds
- Gemini feature is visibly active
- No login wall

Write this as a complete, self-contained AntiGravity prompt using the numbered structure above.

---

### STEP 8 — DECISION POINT: SAME OR DIFFERENT PROBLEM?

**IF warm-up and main challenge share the SAME problem:**
→ Do not rebuild from scratch.
→ Identify the weakest criterion from the warm-up score (use Step 8B).
→ Write one targeted AntiGravity prompt to strengthen it specifically.
→ Apply the fix from the start of the main challenge build, not as a patch.

**IF the problem has CHANGED:**
→ Re-run Steps 1–6. Hard cap: 10 minutes total.
→ Actor map and emotional contract thinking transfers ~70%. Use it.
→ Use the same Prompt 1 + 2 + 3 structure.
→ You have ~100 minutes. Treat it as a compressed full run.
→ Do not panic. The thinking framework is the same. The structure holds.

---

### STEP 8B — SCORE DIAGNOSIS (run after EVERY submission)

**CONFIRMED: Only aggregate score is visible. No per-criterion breakdown.**
This means diagnosis must be inferred, not read. Follow this protocol exactly.

**THE DIAGNOSIS PROTOCOL:**

1. Note your aggregate score
2. Open the public leaderboard immediately
3. Find the #1 score and calculate your gap: [#1 score] - [your score] = gap
4. Open your deployed URL in a fresh incognito browser window
   (incognito = no cached auth, no Google account — exactly what the scorer sees)
5. Answer these questions by looking at what the scorer actually sees:

```
□ Does it load without a login wall?
  NO → Firebase Auth is blocking the scorer. Fix immediately. Highest priority.

□ Does it load with real-looking data on every screen?
  NO → Firestore rules are blocking reads or empty states exist. Fix immediately.

□ Does the Gemini AI feature visibly work on screen?
  NO → Prompt Engineering Leverage is weak. Fix the Gemini feature.

□ Does the core interaction work end-to-end in under 30 seconds?
  NO → Functionality is incomplete. Fix the broken flow.

□ Does the solution feel like it specifically solves THIS problem
  or does it feel like a generic app with a new name?
  GENERIC → Practical Problem-Solving and Innovation are weak.
             Add one domain-specific feature that only makes sense
             for this exact problem — not a feature any app could have.

□ Is the README the first thing visible on the submission page?
  Does it lead with human pain in the first sentence?
  NO → Presentation is weak. Rewrite README opening paragraph.
```

**THE DECISION RULE — fix by ROI, not by weakness:**

Do NOT fix the weakest thing you can find.
Fix the thing with the highest points-gainable ÷ time-cost ratio.

| What you see in incognito | Fix | Time cost | ROI |
|---|---|---|---|
| Login wall or blank screen | Auth/Firestore fix | 5 min | Extreme |
| App loads but looks empty | Firestore rules + fake data | 10 min | Extreme |
| Gemini feature missing/broken | Add one specific AI feature | 10–15 min | High |
| Core interaction broken | Fix the one broken flow only | 15–25 min | High |
| App works but feels generic | Add one domain-specific feature | 10–15 min | Medium |
| README opens with tech description | Rewrite first paragraph | 5 min | High |

**GRADER INFERENCE — use the leaderboard, not guesswork:**

During warm-up, after your first submission:
- Look at the public leaderboard top 3 scores
- Your gap to #1 tells you how much room exists
- If gap > 5 points → functional issue. Fix functionality first.
- If gap is 2–5 points → presentation or Gemini feature issue.
- If gap < 2 points → innovation or domain-specificity. Add the
  one feature that only makes sense for this exact problem.

Re-anchor these observations before building the main challenge.
The warm-up winner dropped to #2 in main challenge by over-fitting
to warm-up patterns. Look at the leaderboard. Infer what changed.

**SCORE BANDS:**
- **90+** → HIGH criteria saturated. Target Innovation and Practical
  Problem-Solving for last points. Cheapest gains per point.
- **85–90** → One HIGH criterion broken. Check incognito view first.
  Fix Functionality → then Presentation. In that order.
- **80–85** → Two things broken. Fix the one visible in incognito first.
- **Below 80** → Core is not working. Rebuild Prompt 1 only. Keep structure.

**⚠️ SUBMISSION SAFETY RULE:**
Only submit a second time if the incognito check shows clear improvement.
If both submissions count independently (not best-of-two), a worse second
submission actively lowers your standing. Verify this with the organiser
before event day — email teamabhiyantrix@gmail.com to confirm.
Never submit blind. Always verify in incognito first.

---

### STEP 9 — DOCUMENTATION

There are two README versions. Know which one you are writing before you start.

**SHORT README (Submissions 1 and 3 — first of each round, 3 minutes max):**
- PROBLEM: Two sentences. Human pain only.
- SOLUTION: One sentence. What it does.
- HOW TO ACCESS: URL + one click instruction.
- PROMPT ENGINEERING: One sentence naming the stack and strategy.

**FULL README (Submissions 2 and 4 — second of each round, 10 minutes):**
Write like a product person. Not a developer. Not a technician.

**PROBLEM**
One paragraph. Written as human pain, not technical description.
Make a non-technical reader feel the frustration before you name the solution.
No jargon. No system names. Just the human experience of the problem.

**SOLUTION**
What the product does, in plain English. One paragraph maximum.
Start with what the user experiences, not what the system does.

**PROMPT ENGINEERING APPROACH**
Name every Google service used. Be specific.
Name the prompting strategy: actor-first scaffolding, progressive layering,
state-driven UI prompting, domain-saturated specification.
Link to docs/prompts/ folder in the repo — this is your methodology evidence.
This section directly scores Prompt Engineering Leverage.
Do not skip it. Do not be vague.

**HOW TO ACCESS**
Prototype URL.
One sentence on what to click first to see the core value immediately.
If auth exists: demo credentials here (email + password).

**WALKTHROUGH VIDEO (Submission 4 only — record at 4:25 PM)**
Record a 60-second screen recording narrating the Step 11 demo script live.
Host on YouTube (unlisted) or Loom. Link in README under "How to Access."
This serves three purposes simultaneously:
1. Scored documentation artifact — evidence of Presentation quality
2. Human shortlister skims repo fast — video is faster than reading
3. Forces you to rehearse the pitch before 6:30 PM in a structured way
The recording IS your pitch rehearsal. Do it once. It counts twice.

---

### STEP 10 — INTERNAL QUALITY CHECK

Run this check silently before producing ANY output.
If any answer is NO — fix it before showing me. Do not surface a broken output.

```
□ Is this actually coordinated, or just organized?
□ Does this reduce anxiety for the primary user?
□ Does every screen answer "what do I do RIGHT NOW?"
□ Are responsibilities clearly visible — who owns what?
□ Is time visible in a useful, surgical way?
□ Are there real-looking names, numbers, and dates on every screen?
□ Does it look like a real product, not a prototype?
□ Would a non-technical judge understand the core value in 60 seconds?
□ Is the "wow moment" visible without explanation?
□ Does the README lead with human pain, not a feature list?
□ Is the Prompt Engineering Approach section specific, honest, and linked to docs/prompts/?
□ Are at least 2 edge cases shown with realistic fake data — not empty panels?
□ Does the app open without a login wall in incognito?
□ Are all status chips using exact Status State Map labels — not invented ones?
□ Is the Gemini feature doing something a non-AI product cannot do?
```

---

### STEP 11 — PITCH SCRIPT (5:00–6:30 PM if shortlisted for Round 2)

Write my 90-second live pitch with this exact structure.
Write it in first person. Present tense. Spoken language, not written language.

**HOOK (10 seconds)**
⚡ THIS WAS WRITTEN AT 2:05 PM — DO NOT REWRITE IT NOW.
Copy the hook sentence you locked in Step 0 Part C.
The human pain was known before code existed. It cannot drift.

**PROBLEM (20 seconds)**
Why the current situation fails.
One concrete, specific example a non-technical person immediately recognizes.
No statistics. No percentages. One real scenario.

**DEMO NARRATION (40 seconds)**
Walk through the ONE critical screen in present tense.
*"I open the app and I see... I tap here and... This updates because..."*
Identify the single moment the judge will remember after the room clears.
Name it explicitly: "This is the moment that changes everything for [actor]."

**IMPACT (15 seconds)**
What gets measurably better.
Use numbers even if estimated.
*"This eliminates X, reduces Y by Z, saves [actor] N minutes per [event]."*

**CLOSE (5 seconds)**
*"[Product name] is the [category] that [unique value] for [actor] when [trigger]."*

---

### MASTER RULES (non-negotiable)

- Every AntiGravity prompt must produce something demoable. Not structural.
- Real-looking fake data from Prompt 1 onwards. No exceptions.
- The pitch leads with human pain, not a feature list.
- If a feature takes more than 20 minutes to build — cut it. Ship the core.
- Warm-up output is an asset. Never fully discard it.
- The "wow moment" must be visible within 60 seconds of opening the app.
- Documentation is part of the score. Write it like a product person.
- The Prompt Engineering Approach section in the README is not optional.
- Score diagnosis after every submission. Fix one thing. Resubmit.
- Stay calm if the problem changes. The thinking transfers. The structure holds.
- The winner is decided by one well-placed targeted fix. Use Step 8B.

