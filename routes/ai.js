const router         = require('express').Router();
const auth           = require('../middleware/auth');
const AIChatHistory  = require('../models/AIChatHistory');
const Anthropic      = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── AI Chatbot ───────────────────────────────────────────────
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 500,
      system:     'You are StyleHub\'s friendly fashion assistant. Help customers with product questions, sizing advice, order info, and style tips. Be short, friendly, and helpful.',
      messages:   [{ role: 'user', content: message }],
    });

    const reply = response.content[0].text;

    // Save chat history
    await AIChatHistory.findOneAndUpdate(
      { userId: req.user.id, sessionId },
      {
        $push: {
          messages: [
            { role: 'user',      content: message },
            { role: 'assistant', content: reply   },
          ],
        },
      },
      { upsert: true }
    );

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── AI Outfit Stylist ────────────────────────────────────────
router.post('/stylist', auth, async (req, res) => {
  try {
    const { productName, category, color } = req.body;

    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{
        role:    'user',
        content: `I have a ${color} ${productName} (${category}). Suggest 3 complete outfit combinations with specific clothing items that match well. Keep it short and stylish.`,
      }],
    });

    res.json({ suggestions: response.content[0].text });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Smart Size Predictor ─────────────────────────────────────
router.post('/size', auth, async (req, res) => {
  try {
    const { height, weight, chest, waist, hips, gender, category } = req.body;

    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{
        role:    'user',
        content: `Recommend clothing size for: Height ${height}cm, Weight ${weight}kg, Chest ${chest}cm, Waist ${waist}cm, Hips ${hips}cm. Gender: ${gender}. Category: ${category}. Give size (XS/S/M/L/XL/XXL) and brief reason.`,
      }],
    });

    res.json({ recommendation: response.content[0].text });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── AI Try-On (Replicate) ────────────────────────────────────
router.post('/tryon', auth, async (req, res) => {
  try {
    const { personImageUrl, clothingImageUrl } = req.body;

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method:  'POST',
      headers: {
        Authorization:  `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4',
        input:   { human_img: personImageUrl, garm_img: clothingImageUrl, garment_des: 'clothing item' },
      }),
    });

    const prediction = await response.json();
    res.json({ predictionId: prediction.id, status: prediction.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Check Try-On Result ──────────────────────────────────────
router.get('/tryon/:id', auth, async (req, res) => {
  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${req.params.id}`, {
      headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
    });
    const result = await response.json();
    res.json({ status: result.status, output: result.output });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get Chat History ─────────────────────────────────────────
router.get('/chat/history', auth, async (req, res) => {
  try {
    const history = await AIChatHistory.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(5);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
