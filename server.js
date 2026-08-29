const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080; // NEVER hardcode — Cloud Run sets $PORT

app.use(cors());
app.use(express.json());
app.use(require(require('fs').existsSync('./geminiRoutes.js') ? './geminiRoutes' : './dist/geminiRoutes.js'));

// Serve Vite build output
app.use(express.static(path.join(__dirname, 'dist')));

// ─────────────────────────────────────────────────────────────
// CRITICAL: Firebase Runtime Config
// Credentials are NOT available at Docker build time.
// Express reads them from process.env at runtime — this is the
// only pattern that prevents a blank page on Cloud Run.
// ─────────────────────────────────────────────────────────────
app.get('/api/config', (req, res) => {
  res.json({
    apiKey:            process.env.FIREBASE_API_KEY            || "AIzaSyAmmvliUGEwfELxNLRiLmtdh6u0XrvrbDE",
    authDomain:        process.env.FIREBASE_AUTH_DOMAIN        || "promptwars-aug29.firebaseapp.com",
    projectId:         process.env.FIREBASE_PROJECT_ID         || "promptwars-aug29",
    storageBucket:     process.env.FIREBASE_STORAGE_BUCKET     || "promptwars-aug29.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "913258105665",
    appId:             process.env.FIREBASE_APP_ID             || "1:913258105665:web:a6d323eee3151089102fc0",
  });
});

// ─────────────────────────────────────────────────────────────
// Gemini Feature 1 — Teammate Matchmaking
// POST /api/gemini-match
// Body: { skills, role, interests }
// Returns: { matches: [{ name, skills, reason, fit, participantId }] }
// ─────────────────────────────────────────────────────────────
app.post('/api/gemini-match', async (req, res) => {
  const { skills, role, interests } = req.body;

  const CANDIDATE_POOL = [
    { participantId: 'uid-rohan', name: 'Rohan Kulkarni', skills: ['PyTorch', 'CI/CD', 'Python'] },
    { participantId: 'uid-rahul', name: 'Rahul Verma',    skills: ['Node.js', 'Express', 'Firebase'] },
    { participantId: 'uid-sneha', name: 'Sneha Iyer',     skills: ['React Native', 'GraphQL', 'AWS'] },
  ];

  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) throw new Error('GEMINI_API_KEY not set');

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `You are a hackathon teammate matchmaker.

Seeker profile:
- Skills: ${skills}
- Role: ${role}  
- Interests: ${interests}

Candidate pool:
${CANDIDATE_POOL.map((c, i) => `${i + 1}. ${c.name} — Skills: ${c.skills.join(', ')}`).join('\n')}

Rank all 3 candidates for compatibility with the seeker. For each, write a single-line match reason (max 15 words) explaining the fit. Estimate fit percentage.

Respond ONLY with valid JSON in this exact format:
{
  "matches": [
    { "participantId": "uid-rohan", "name": "Rohan Kulkarni", "skills": ["PyTorch", "CI/CD", "Python"], "reason": "<one-line reason>", "fit": 92 },
    { "participantId": "uid-rahul", "name": "Rahul Verma", "skills": ["Node.js", "Express", "Firebase"], "reason": "<one-line reason>", "fit": 88 },
    { "participantId": "uid-sneha", "name": "Sneha Iyer", "skills": ["React Native", "GraphQL", "AWS"], "reason": "<one-line reason>", "fit": 81 }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err) {
    console.error('Gemini match error:', err.message);
    res.status(500).json({ error: '⚠ Gemini unavailable — retry' });
  }
});

// ─────────────────────────────────────────────────────────────
// Gemini Feature 2 — Announcement TL;DR
// POST /api/gemini-tldr
// Body: { title, body }
// Returns: { tldr: string }
// ─────────────────────────────────────────────────────────────
app.post('/api/gemini-tldr', async (req, res) => {
  const { title, body } = req.body;
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) throw new Error('GEMINI_API_KEY not set');

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Summarize this event announcement in exactly ONE concise sentence (max 15 words). Be specific and actionable. Return ONLY the summary sentence, nothing else.

Title: ${title}
Body: ${body}`;

    const result = await model.generateContent(prompt);
    const tldr = result.response.text().trim().replace(/^["']|["']$/g, '');
    res.json({ tldr });
  } catch (err) {
    console.error('Gemini TL;DR error:', err.message);
    res.status(500).json({ error: '⚠ Gemini unavailable — retry' });
  }
});

// ─────────────────────────────────────────────────────────────
// Gemini Feature 3 — Score Variance Analysis
// POST /api/gemini-analysis
// Body: { teamName, scores: [{ judgeId, criteria, total }] }
// Returns: { variance, criterion, recommendation, alert }
// ─────────────────────────────────────────────────────────────
app.post('/api/gemini-analysis', async (req, res) => {
  const { teamName, scores } = req.body;
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) throw new Error('GEMINI_API_KEY not set');

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Analyze these judge scores for ${teamName}:
${JSON.stringify(scores, null, 2)}

If the variance between any two judges exceeds 15 points, flag it.
Identify the criterion with the largest divergence.
Respond ONLY with JSON:
{
  "variance": <number>,
  "criterion": "<criterion name>",
  "recommendation": "<one-line action for organizer>",
  "shouldFlag": <true|false>
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');
    res.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error('Gemini analysis error:', err.message);
    res.status(500).json({ error: '⚠ Gemini unavailable — retry' });
  }
});

// ─────────────────────────────────────────────────────────────
// FCM Broadcast (Firebase Cloud Messaging)
// POST /api/broadcast
// Body: { title, body, severity }
// ─────────────────────────────────────────────────────────────
app.post('/api/broadcast', async (req, res) => {
  const { title, body, severity } = req.body;
  try {
    // FCM requires firebase-admin — gracefully skip if not configured
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
    }
    await admin.messaging().sendToTopic('all-participants', {
      notification: { title, body },
      data: { severity: severity || 'NORMAL' },
    });
    res.json({ sent: true });
  } catch (err) {
    console.warn('FCM broadcast skipped (firebase-admin not configured):', err.message);
    res.json({ sent: false, reason: 'FCM optional — Firestore write is the source of truth' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback — all non-API routes → index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 EventPulse server listening on port ${PORT}`);
});
