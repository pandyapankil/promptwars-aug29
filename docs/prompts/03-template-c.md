# Template C — Polish Pass
> Rationale: Binary, numbered, Flash-safe polish pass. FAST mode. Run on Gemini 3.7 Flash High.
> Adopted from parallel AI review — numbered binary format matches Flash's reliable execution style.

---

Read @promptwars-project-context.md for all project config. Same stack and compliance rules as
Template A. Do not modify Firebase Auth, Firestore rules, Dockerfile, or deployment configuration.

Execute exactly these 7 numbered items. Each is binary — done or not done. No interpretation.

1. DOMAIN LANGUAGE SWEEP
   Screen by screen, replace every generic word with the domain STATUS STATE MAP term:
   "Error" -> "Check-in failed — try manual code entry"
   "Pending" -> the exact STATUS STATE MAP label for that context (AWAITING_JUDGE / UNDER_REVIEW / TEAM_FORMING)
   "Done" -> SCORED or TEAM_CONFIRMED (whichever applies)
   "Failed" -> LATE_SUBMISSION or JUDGE_OVERDUE (whichever applies)
   List every replacement made.

2. MISSING STATES — ADD WITH FAKE DATA
   Find every STATUS STATE MAP status with no visible example in the UI:
   (NO_SHOW, DRAFT, SUPERSEDED, UNTEAMED, LATE_SUBMISSION, AWAITING_JUDGE, SCORING_AT_RISK)
   Add one pre-seeded example per missing status with a real name and a real date.
   Zero statuses without a visible example in the UI.

3. MOBILE PASS
   Every screen must render at 375px without horizontal scroll.
   Sidebar collapses to hamburger. Cards stack to single column. Buttons full width.
   Status chips never truncate. All touch targets minimum 44px height.

4. GEMINI AI LABEL
   Add this banner to LiveOpsDashboard.tsx AND ParticipantHome.tsx:
   "Powered by Gemini AI — matches teammates and summarizes every announcement in real time"
   Must be visible without scrolling. Non-technical jury must see it in 3 seconds.

5. DATA CONSISTENCY PASS
   All dates must be consistent relative to event day (2026-08-29).
   All names must match the seeded participant roster exactly — no invented names.
   All status chips must use exact STATUS STATE MAP labels — zero invented variants.

6. BROKEN INTERACTION SWEEP
   Click every button in the app. If it does nothing: remove it or wire it to show
   a realistic state. Zero dead buttons in the final build.

7. FINAL APP VERIFICATION
   Run the app. Open in incognito. Confirm all of:
   - Landing screen loads with real data (not blank)
   - Wow moment works: type registrationCode in CheckinScanner, Live Ops counter ticks
   - Core interaction completes in under 30 seconds
   - All 3 Gemini features visibly active (matchmaking, TL;DR, score variance)
   - No login wall — demo credentials visible on landing
