const router        = require('express').Router();
const LoyaltyPoints = require('../models/LoyaltyPoints');
const auth          = require('../middleware/auth');

// ─── Get My Points ────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const loyalty = await LoyaltyPoints.findOne({ userId: req.user.id });
    res.json(loyalty || { totalPoints: 0, transactions: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Redeem Points ────────────────────────────────────────────
router.post('/redeem', auth, async (req, res) => {
  try {
    const { points, orderId } = req.body;
    const loyalty = await LoyaltyPoints.findOne({ userId: req.user.id });

    if (!loyalty || loyalty.totalPoints < points)
      return res.status(400).json({ message: 'Not enough points' });

    loyalty.totalPoints -= points;
    loyalty.transactions.push({
      type:        'redeemed',
      points,
      orderId,
      description: 'Points redeemed at checkout',
    });
    await loyalty.save();

    res.json({ message: `${points} points redeemed successfully`, remainingPoints: loyalty.totalPoints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
