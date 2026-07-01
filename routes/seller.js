const router       = require('express').Router();
const Product      = require('../models/Product');
const Order        = require('../models/Order');
const Seller       = require('../models/Seller');
const Notification = require('../models/Notification');
const auth         = require('../middleware/auth');
const sellerOnly   = require('../middleware/sellerOnly');
const cloudinary   = require('cloudinary').v2;
const multer       = require('multer');
const nodemailer   = require('nodemailer');

// ─── Cloudinary Config ────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

// ─── Helper: upload image to Cloudinary ──────────────────────
const uploadToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'stylehub/products' }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(fileBuffer);
  });

// ─── Get Seller Profile ───────────────────────────────────────
router.get('/profile', auth, sellerOnly, async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user.id });
    res.json(seller);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Update Seller Profile ────────────────────────────────────
router.put('/profile', auth, sellerOnly, async (req, res) => {
  try {
    const seller = await Seller.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    res.json(seller);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Add Product ──────────────────────────────────────────────
router.post('/products', auth, sellerOnly, upload.array('images', 5), async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user.id });
    const { name, description, price, discountPrice, category, brand, sizes, colors, stock, tags } = req.body;

    let imageUrls = [];
    let publicIds = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        imageUrls.push(result.secure_url);
        publicIds.push(result.public_id);
      }
    }

    const product = await Product.create({
      sellerId:            seller._id,
      name,
      description,
      price:               Number(price),
      discountPrice:       discountPrice ? Number(discountPrice) : undefined,
      category,
      brand,
      images:              imageUrls,
      cloudinaryPublicIds: publicIds,
      sizes:               sizes  ? sizes.split(',').map((s) => s.trim())  : [],
      colors:              colors ? colors.split(',').map((c) => c.trim()) : [],
      stock:               Number(stock) || 0,
      tags:                tags   ? tags.split(',').map((t) => t.trim())   : [],
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get My Products ──────────────────────────────────────────
router.get('/products', auth, sellerOnly, async (req, res) => {
  try {
    const seller   = await Seller.findOne({ userId: req.user.id });
    const products = await Product.find({ sellerId: seller._id }).populate('category', 'name');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Update Product ───────────────────────────────────────────
router.put('/products/:id', auth, sellerOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Delete Product ───────────────────────────────────────────
router.delete('/products/:id', auth, sellerOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Restock Product + Send Email Notifications ───────────────
router.put('/products/:id/restock', auth, sellerOnly, async (req, res) => {
  try {
    const { stock } = req.body;
    const product   = await Product.findByIdAndUpdate(req.params.id, { stock: Number(stock) }, { new: true });

    // Find users waiting for restock
    const waiting = await Notification.find({ productId: product._id, type: 'restock', isRead: false });

    if (waiting.length > 0) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:    { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      for (const notif of waiting) {
        if (notif.email) {
          await transporter.sendMail({
            from:    process.env.EMAIL_USER,
            to:      notif.email,
            subject: `${product.name} is back in stock! 🎉`,
            html:    `<h2>Great news!</h2><p><b>${product.name}</b> is now available on StyleHub.</p><a href="#">Shop Now</a>`,
          });
          await Notification.findByIdAndUpdate(notif._id, { isRead: true });
        }
      }
    }

    res.json({ product, notifiedCount: waiting.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get My Orders ────────────────────────────────────────────
router.get('/orders', auth, sellerOnly, async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user.id });
    const orders = await Order.find({ 'items.sellerId': seller._id })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Update Order Status ──────────────────────────────────────
router.put('/orders/:id/status', auth, sellerOnly, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus }, { new: true });

    await Notification.create({
      userId:  order.userId,
      type:    'order',
      message: `Your order status has been updated to: ${orderStatus}`,
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get Address Label for Printing ──────────────────────────
router.get('/orders/:id/address-label', auth, sellerOnly, async (req, res) => {
  try {
    const order  = await Order.findById(req.params.id).populate('userId', 'name');
    const seller = await Seller.findOne({ userId: req.user.id });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const label = {
      orderId:       order._id,
      orderDate:     order.createdAt,
      to: {
        fullName:  order.shippingAddress.fullName,
        phone:     order.shippingAddress.phone,
        street:    order.shippingAddress.street,
        city:      order.shippingAddress.city,
        province:  order.shippingAddress.province,
        zipCode:   order.shippingAddress.zipCode,
        country:   order.shippingAddress.country,
      },
      from: {
        shopName:    seller.shopName,
        shopAddress: seller.shopAddress,
      },
      itemCount:     order.items.length,
      totalAmount:   order.totalAmount,
      paymentMethod: order.paymentMethod,
    };

    res.json(label);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Seller Dashboard Stats ───────────────────────────────────
router.get('/dashboard', auth, sellerOnly, async (req, res) => {
  try {
    const seller       = await Seller.findOne({ userId: req.user.id });
    const totalProducts = await Product.countDocuments({ sellerId: seller._id });
    const orders       = await Order.find({ 'items.sellerId': seller._id });
    const totalOrders  = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const lowStock     = await Product.find({ sellerId: seller._id, stock: { $lt: 5 } });

    res.json({ totalProducts, totalOrders, totalRevenue, lowStockCount: lowStock.length, lowStockProducts: lowStock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
