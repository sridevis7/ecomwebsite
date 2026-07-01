const router       = require('express').Router();
const Notification = require('../models/Notification');
const auth         = require('../middleware/auth');

// ─── Get My Notifications ─────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Mark as Read ─────────────────────────────────────────────
router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Subscribe to Restock Notification ───────────────────────
router.post('/restock', auth, async (req, res) => {
  try {
    const { productId, email } = req.body;
    await Notification.create({
      userId:    req.user.id,
      productId,
      type:      'restock',
      message:   'Restock notification requested',
      email,
      isRead:    false,
    });
    res.json({ message: 'You will be notified when this item is back in stock!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
