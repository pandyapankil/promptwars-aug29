const express = require('express');
const router = express.Router();

router.post('/api/judge-summary', async (req, res) => {
  const { feedback } = req.body;
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) throw new Error('GEMINI_API_KEY not set');

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Summarize this judge's feedback in exactly 2 sentences for organizer review:
${feedback}

Respond ONLY with the summary.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim().replace(/^["']|["']$/g, '');
    res.json({ summary });
  } catch (err) {
    console.error('Gemini judge summary error:', err.message);
    res.status(500).json({ error: '⚠ Gemini unavailable — retry' });
  }
});

module.exports = router;
