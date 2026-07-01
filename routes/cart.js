const router = require('express').Router();
const Cart   = require('../models/Cart');
const auth   = require('../middleware/auth');

// ─── Get Cart ─────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate('items.productId', 'name images price stock');
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Add to Cart ──────────────────────────────────────────────
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity = 1, size, color, price } = req.body;
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });

    const existing = cart.items.find(
      (i) => i.productId.toString() === productId && i.size === size && i.color === color
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, size, color, price });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Update Quantity ──────────────────────────────────────────
router.put('/update/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    const item = cart.items.id(req.params.itemId);
    if (item) item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Remove Item ──────────────────────────────────────────────
router.delete('/remove/:itemId', auth, async (req, res) => {
  try {
    const cart  = await Cart.findOne({ userId: req.user.id });
    cart.items  = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Clear Cart ───────────────────────────────────────────────
router.delete('/clear', auth, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
