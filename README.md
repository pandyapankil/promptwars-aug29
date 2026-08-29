# EventPulse — Smart Event Operations Platform

## PROBLEM
At 9 AM on event day, hackathon organizers face overwhelming chaos: long check-in lines with fragile spreadsheets, lost solo participants wandering without teams, and missed announcements across scattered WhatsApp chats. Critical event operations break down across disjointed tools, leaving participants anxious and organizers flying blind.

## SOLUTION
EventPulse is a unified, real-time event operations platform that consolidates attendee check-in, skill-based AI team matchmaking, live announcement broadcasting, judge scoring queues, and real-time leaderboards into a single synchronized command center.

## HOW TO ACCESS
- **Live Prototype URL:** https://promptwars-aug29-yujtd6zcea-el.a.run.app
- **First Click:** Open the app to view the **Organizer Live Ops Dashboard** and watch check-ins and scoring tick live without refreshing, or switch roles to test **QR Check-in** and **Find My Team**.
- **Demo Credentials:** Use the one-click demo sign-in buttons on the login page for instantaneous role-based access.

## ARCHITECTURE
Built for scale and real-time synchronization utilizing: **Cloud Run + Firestore onSnapshot + 3 Gemini endpoints**. 

## PROMPT ENGINEERING EVIDENCE
Our Gemini integrations are designed for zero-hallucination deterministic state machines. Below are the exact prompts used in production. Full prompt history and reasoning logs are documented in [`docs/prompts/`](docs/prompts/).

### 1. AI Teammate Matchmaker (Participant Dashboard)
Evaluates a solo participant's skills against a live pool to suggest balanced teams with a one-line fit rationale.
```javascript
const prompt = `You are a hackathon teammate matchmaker.

Seeker profile:
- Skills: ${skills}
- Role: ${role}  
- Interests: ${interests}

Candidate pool:
${CANDIDATE_POOL.map((c, i) => `${i + 1}. ${c.name} — Skills: ${c.skills.join(', ')}`).join('\n')}

Rank all 3 candidates for compatibility with the seeker. For each, write a single-line match reason (max 15 words) explaining the fit. Estimate fit percentage.

Respond ONLY with valid JSON...`;
```

### 2. Live Broadcast TL;DR Generator (Organizer Dashboard)
Condenses long organizer announcements into punchy, actionable push notifications for participants.
```javascript
const prompt = `Summarize this event announcement in exactly ONE concise sentence (max 15 words). Be specific and actionable. Return ONLY the summary sentence, nothing else.

Title: ${title}
Body: ${body}`;
```

### 3. Judge Consensus Engine (Judge Queue)
Generates an immediate, synthesized 2-sentence consensus from raw judge feedback to populate the organizer's review panel.
```javascript
const prompt = `Summarize this judge's feedback in exactly 2 sentences for organizer review:
${feedback}

Respond ONLY with the summary.`;
```

**Real Before/After Example:**
- **Raw Judge Feedback Input:** *"The technical stack was robust, utilizing React and Firebase effectively. However, the user flow for the checkout process felt a bit clunky and took too many clicks. They also didn't clearly explain their monetization strategy during the Q&A, which is a major red flag for viability."*
- **Gemini Consensus Output:** *"The team demonstrated strong technical execution with React and Firebase, but struggled with a clunky checkout flow. To improve, they must streamline the user experience and clearly define their monetization strategy."*

## DEMO FLOW
| Role | Action | Expected Real-Time Result |
|---|---|---|
| **Organizer** | View Live Ops Dashboard | Real-time counters wait for incoming data. |
| **Participant** | Scan QR Code | Check-in counter on Live Ops immediately ticks up. |
| **Participant** | Find My Team | Gemini analyzes skills and returns 3 AI-matched candidates. |
| **Organizer** | Send Broadcast | Gemini generates a 15-word TL;DR; notification appears on all clients. |
| **Judge** | Submit Score | Gemini synthesizes feedback into a 2-sentence consensus; Live Ops scoring counter ticks up; Leaderboard re-ranks instantly. |
