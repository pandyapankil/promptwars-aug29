const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Firebase Runtime Config Endpoint
app.get('/api/config', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAmmvliUGEwfELxNLRiLmtdh6u0XrvrbDE",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "promptwars-aug29.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "promptwars-aug29",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "promptwars-aug29.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "913258105665",
    appId: process.env.FIREBASE_APP_ID || "1:913258105665:web:a6d323eee3151089102fc0"
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PromptWars server listening on port ${PORT}`);
});
