# PromptWars — Project Context
> Auto-generated after setup. Do not edit manually — re-run promptwars-generate-context.md to refresh.
> Paste the block below into AntiGravity Conversation 2 before every Template A, B, and C.

---

## CONTEXT BLOCK — copy everything inside this fence and paste into AntiGravity

```
PROJECT CONTEXT — paste at the start of every AntiGravity builder conversation:

Google Cloud Project ID: promptwars-aug29
Firebase Project ID:     promptwars-aug29
Cloud Run Service Name:  promptwars-aug29
Region:                  asia-south1
GitHub Repo URL:         https://github.com/pandyapankil/promptwars-aug29.git
Live Cloud Run URL:      https://promptwars-aug29-yujtd6zcea-el.a.run.app

Firebase Config:
const firebaseConfig = {
  apiKey: "AIzaSyAmmvliUGEwfELxNLRiLmtdh6u0XrvrbDE",
  authDomain: "promptwars-aug29.firebaseapp.com",
  projectId: "promptwars-aug29",
  storageBucket: "promptwars-aug29.firebasestorage.app",
  messagingSenderId: "913258105665",
  appId: "1:913258105665:web:a6d323eee3151089102fc0"
};

Demo Credentials (must appear visibly on landing page — do not change):
  Email:    demo@promptwars.com
  Password: Demo1234!

Repo structure (already exists — do not recreate):
  docs/prompts/  ← save every AntiGravity prompt here, numbered chronologically
  README.md      ← at root
  deploy.sh      ← at root — use this to deploy, NOT AI Studio Publish button

Firebase credentials (passed to Cloud Run as env vars — server reads at runtime):
  FIREBASE_API_KEY:            AIzaSyAmmvliUGEwfELxNLRiLmtdh6u0XrvrbDE
  FIREBASE_AUTH_DOMAIN:        promptwars-aug29.firebaseapp.com
  FIREBASE_PROJECT_ID:         promptwars-aug29
  FIREBASE_STORAGE_BUCKET:     promptwars-aug29.firebasestorage.app
  FIREBASE_MESSAGING_SENDER_ID:913258105665
  FIREBASE_APP_ID:             1:913258105665:web:a6d323eee3151089102fc0

Stack rules (non-negotiable — never deviate):
  Firebase Auth:  Email/Password + Google SSO (OAuth2)
                  App must be explorable without login — show demo credentials on landing page
  Firestore:      unauthenticated reads allowed, authenticated writes only
  Gemini API:     server-side Cloud Run endpoint only
                  key stored as Cloud Run env var: GEMINI_API_KEY — never in client code
  Firebase config: NEVER use import.meta.env.VITE_FIREBASE_* in client code
                  ALWAYS serve config from Express GET /api/config endpoint at runtime
                  Client fetches /api/config on load → initializeApp(config)
                  This is the only pattern that works on Cloud Run
  Deploy:         run ./deploy.sh — same service name every time, new revision only
                  never create a new service (cold start = 5–10 min wasted)
  Port:           server MUST use process.env.PORT — never hardcode 3000 or 8080
                  hardcoded port = silent 503 on Cloud Run

Dockerfile (required at repo root — copy exactly if AntiGravity skips it):
  FROM node:20-slim
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build
  EXPOSE 8080
  CMD ["node", "server.js"]
  NOTE: no VITE_FIREBASE_* build args needed — config served at runtime via /api/config

Express server entry point (required — add this to your server file):
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

Now paste Template A below:
```
