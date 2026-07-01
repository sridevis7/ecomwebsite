const router        = require('express').Router();
const Order         = require('../models/Order');
const Cart          = require('../models/Cart');
const LoyaltyPoints = require('../models/LoyaltyPoints');
const Notification  = require('../models/Notification');
const auth          = require('../middleware/auth');

// ─── ETA Calculator ───────────────────────────────────────────
const getETA = (city = '') => {
  const sameCities = ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'peshawar', 'quetta'];
  return sameCities.includes(city.toLowerCase()) ? '1–2 business days' : '3–5 business days';
};

// ─── Place Order ──────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, couponCode, loyaltyPointsUsed = 0 } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: 'Cart is empty' });

    const totalAmount = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const eta         = getETA(shippingAddress.city);

    const order = await Order.create({
      userId: req.user.id,
      items:  cart.items.map((i) => ({
        productId: i.productId._id,
        sellerId:  i.productId.sellerId,
        name:      i.productId.name,
        image:     i.productId.images[0],
        quantity:  i.quantity,
        size:      i.size,
        color:     i.color,
        price:     i.price,
      })),
      shippingAddress,
      totalAmount,
      loyaltyPointsUsed,
      couponCode,
      paymentMethod,
      estimatedDelivery: eta,
    });

    // Earn loyalty points: 1 point per Rs.10 spent
    const pointsEarned = Math.floor(totalAmount / 10);
    await LoyaltyPoints.findOneAndUpdate(
      { userId: req.user.id },
      {
        $inc:  { totalPoints: pointsEarned },
        $push: { transactions: { type: 'earned', points: pointsEarned, orderId: order._id, description: 'Order placed' } },
      }
    );

    // Clear cart
    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });

    // Notify user
    await Notification.create({
      userId:  req.user.id,
      type:    'order',
      message: `Order placed! Estimated delivery: ${eta}. You earned ${pointsEarned} loyalty points 🎉`,
    });

    res.status(201).json({ order, pointsEarned, eta, message: `Order placed! ETA: ${eta}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── My Orders ────────────────────────────────────────────────
router.get('/mine', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Track Order ──────────────────────────────────────────────
router.get('/:id/track', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({
      orderStatus:       order.orderStatus,
      estimatedDelivery: order.estimatedDelivery,
      trackingNumber:    order.trackingNumber,
      paymentStatus:     order.paymentStatus,
      createdAt:         order.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Cancel Order ─────────────────────────────────────────────
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.orderStatus !== 'pending')
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });

    order.orderStatus = 'cancelled';
    await order.save();
    res.json({ message: 'Order cancelled', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
