const router    = require('express').Router();
const User      = require('../models/User');
const Seller    = require('../models/Seller');
const Order     = require('../models/Order');
const Product   = require('../models/Product');
const Category  = require('../models/Category');
const Coupon    = require('../models/Coupon');
const Return    = require('../models/Return');
const auth      = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// ─── Platform Dashboard Stats ─────────────────────────────────
router.get('/dashboard', auth, adminOnly, async (req, res) => {
  try {
    const totalOrders    = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalSellers   = await Seller.countDocuments({ approvalStatus: 'approved' });
    const pendingSellers = await Seller.countDocuments({ approvalStatus: 'pending' });
    const totalProducts  = await Product.countDocuments({ isActive: true });

    const revenueData = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    const monthlySales = await Order.aggregate([
      {
        $group: {
          _id:     { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ totalOrders, totalCustomers, totalSellers, pendingSellers, totalProducts, totalRevenue, monthlySales });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Sellers Management ───────────────────────────────────────
router.get('/sellers', auth, adminOnly, async (req, res) => {
  try {
    const sellers = await Seller.find().populate('userId', 'name email phone createdAt');
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/sellers/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const seller = await Seller.findByIdAndUpdate(req.params.id, { approvalStatus: status }, { new: true });
    res.json({ message: `Seller ${status} successfully`, seller });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Customers Management ─────────────────────────────────────
router.get('/customers', auth, adminOnly, async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/customers/:id/ban', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    res.json({ message: 'Customer banned', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Orders Management ────────────────────────────────────────
router.get('/orders', auth, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/orders/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Categories Management ────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/categories', auth, adminOnly, async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/categories/:id', auth, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/categories/:id', auth, adminOnly, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Coupons Management ───────────────────────────────────────
router.get('/coupons', auth, adminOnly, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/coupons', auth, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/coupons/:id', auth, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/coupons/:id', auth, adminOnly, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Returns Management ───────────────────────────────────────
router.get('/returns', auth, adminOnly, async (req, res) => {
  try {
    const returns = await Return.find()
      .populate('userId', 'name email')
      .populate('orderId')
      .sort({ createdAt: -1 });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/returns/:id', auth, adminOnly, async (req, res) => {
  try {
    const returnReq = await Return.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(returnReq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Inventory Overview ───────────────────────────────────────
router.get('/inventory', auth, adminOnly, async (req, res) => {
  try {
    const lowStock  = await Product.find({ stock: { $lt: 5 },  isActive: true }).populate('sellerId', 'shopName');
    const outStock  = await Product.find({ stock: 0,           isActive: true }).populate('sellerId', 'shopName');
    const allProducts = await Product.find({ isActive: true }).populate('sellerId', 'shopName').select('name stock sold price');
    res.json({ lowStock, outStock, allProducts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
