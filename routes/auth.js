const router        = require('express').Router();
const bcrypt        = require('bcryptjs');
const jwt           = require('jsonwebtoken');
const User          = require('../models/User');
const Seller        = require('../models/Seller');
const LoyaltyPoints = require('../models/LoyaltyPoints');

// ─── Register Customer ────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed, phone });
    await LoyaltyPoints.create({ userId: user._id });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Register Seller ──────────────────────────────────────────
router.post('/register-seller', async (req, res) => {
  try {
    const { name, email, password, phone, shopName, shopDescription, cnicNumber } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed, phone, role: 'seller' });
    await Seller.create({ userId: user._id, shopName, shopDescription, cnicNumber });

    res.status(201).json({ message: 'Seller application submitted. Waiting for admin approval.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    // Block unapproved sellers
    if (user.role === 'seller') {
      const seller = await Seller.findOne({ userId: user._id });
      if (seller?.approvalStatus !== 'approved') {
        return res.status(403).json({ message: 'Your seller account is pending admin approval.' });
      }
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get Logged-in User ───────────────────────────────────────
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
