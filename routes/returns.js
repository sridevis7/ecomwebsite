const router = require('express').Router();
const Return = require('../models/Return');
const auth   = require('../middleware/auth');

// ─── Request Return ───────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { orderId, reason, description } = req.body;
    const returnReq = await Return.create({
      orderId,
      userId: req.user.id,
      reason,
      description,
    });
    res.status(201).json(returnReq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── My Return Requests ───────────────────────────────────────
router.get('/mine', auth, async (req, res) => {
  try {
    const returns = await Return.find({ userId: req.user.id })
      .populate('orderId')
      .sort({ createdAt: -1 });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
