# Template B — Coordination Layer
> Rationale: Add Judge actor + cross-actor handoffs. FAST mode. Wait for Template A verified first.
> Adopted from parallel AI review — explicit file names for regression protection.

---

Read @promptwars-project-context.md for all project config. Same stack and compliance rules as
Template A. Do not modify Firebase Auth, Firestore rules, Dockerfile, or deployment configuration.
Adding product surfaces only — not touching infrastructure.

ADD THE JUDGE ACTOR AND THE HANDOFFS:

1. JudgeQueue.tsx — Judge "Prof. Meera Pillai" home:
   (a) Header: "Your Queue — 8 submissions to score | Judging cutoff: 3:30 PM | Time remaining: 31 min"
   (b) One submission at a time: "PulseBoard — AI Event Orchestrator" by Team Orion.
       Project description, file link (Cloud Storage), team members.
   (c) Rubric UI: 4 criteria sliders (Functionality 0-25, Innovation 0-25,
       Presentation 0-25, Implementation 0-25). Live weighted total shown.
       Structured feedback textarea.
   (d) "Submit Score" button: Firestore write on tap, submission flips to SCORED,
       next submission loads. Live Ops judging counter increments in real time.
       Show this is happening if both screens are open simultaneously.
   (e) Scored history list: team name + total score + timestamp, collapsed.
   (f) JUDGE_OVERDUE state shown for one seeded judge: red badge, "3 submissions
       unscored — organizer has been notified".

2. SubmissionUpload.tsx (Participant)
   Team DRAFT submission form: title, description, file upload to Cloud Storage.
   "Submit" button gated by submission countdown — disabled when SUBMISSION_CLOSED.
   Show LATE_SUBMISSION state: "Volt Vikings — submitted 00:07:12 after close —
   accepted at organizer discretion" as a seeded example with amber chip.

3. LeaderboardView.tsx (All actors)
   Real-time ranked list from Firestore onSnapshot.
   Top 10 teams, scores from judged submissions, ties broken by earliest SCORED timestamp.
   Rank movement visible without refresh — pulse animation on number change.
   SCORING_AT_RISK banner at top while judging is behind pace.
   LEADERBOARD_LIVE banner when published.
   Rank | Team Name | Score | Status chip
   Seeded: Team Orion #1 (88.5), Team Nexus #2 (86.0), Team Pulse #3 (84.5), Team Vertex #4 (81.0)

4. JudgeAssignment.tsx (Organizer — new file)
   Assignment cards for the organizer to see scoring pace.
   Show AWAITING_JUDGE state: "Team Nexus — unassigned for 12 min — auto-reassigned to Dr. Arjun Rao"
   This is the silent-judge edge case shown with realistic fake data.
   "Reassign" button visible on any AWAITING_JUDGE card.

GEMINI CROSS-ACTOR FEATURE:
After a judge submits a score, server calls Gemini:
"Summarize this judge's feedback in 2 sentences for organizer review: [feedback text]"
Store result as judgeSummary on the score document.
Display in JudgeAssignment.tsx as a Gemini-generated consensus note per submission.
This is Gemini working ACROSS actors — judge writes feedback, organizer sees AI summary.
Label: "⚡ Gemini consensus — synthesized from judge feedback"

HARD RULE: The following files must not be modified under any circumstances:
LandingPage.tsx, ParticipantHome.tsx, FindMyTeam.tsx, LiveOpsDashboard.tsx,
AnnouncementCenter.tsx, CheckinScanner.tsx, server.js, firebase.ts,
firestore.rules, Dockerfile, seedDatabase logic.
If you find yourself editing any of these files: stop, revert, and add new files instead.
Adding only. Never rewriting. Violation of this rule breaks the submission.

Before finishing, verify:
[] Open each Template A file — confirm content is identical to when Template A finished
[] All new screens are in NEW files — zero edits to existing Template A files
[] Judge's view is complete and distinct from Participant and Organizer views
[] Gemini consensus note visible in JudgeAssignment.tsx (organizer sees AI summary of judge feedback)
[] LATE_SUBMISSION state shows realistic example data, not an empty panel
[] AWAITING_JUDGE reassignment state shows realistic example with action button
[] SCORING_AT_RISK banner appears on LeaderboardView when judging is behind pace
