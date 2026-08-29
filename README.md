# EventPulse — Smart Event Operations Platform

## PROBLEM
At 9 AM on event day, hackathon organizers face overwhelming chaos: long check-in lines with fragile spreadsheets, lost solo participants wandering without teams, and missed announcements across scattered WhatsApp chats. Critical event operations break down across disjointed tools, leaving participants anxious and organizers flying blind.

## SOLUTION
EventPulse is a unified, real-time event operations platform that consolidates attendee check-in, skill-based AI team matchmaking, live announcement broadcasting, judge scoring queues, and real-time leaderboards into a single synchronized command center.

## HOW TO ACCESS
- **Live Prototype URL:** https://promptwars-aug29-yujtd6zcea-el.a.run.app
- **First Click:** Open the app to view the **Organizer Live Ops Dashboard** and watch check-ins and scoring tick live without refreshing, or switch roles to test **QR Check-in** and **Find My Team**.
- **Demo Credentials:**
  - **Email:** `demo@promptwars.com`
  - **Password:** `Demo1234!`

## PROMPT ENGINEERING APPROACH
Built with **Google AntiGravity (Gemini 3 Pro / Claude Sonnet 4.6 Thinking)** utilizing an actor-first scaffolding strategy, deterministic state machine design, and progressive multi-role layering across **Firebase Auth, Firestore real-time listeners, Gemini API (for matchmaking, TL;DR summaries & score variance analysis), Firebase Cloud Messaging, Cloud Storage, and Google Cloud Run**. Full prompt history and reasoning logs are documented in [`docs/prompts/`](docs/prompts/).
