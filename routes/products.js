const router       = require('express').Router();
const Product      = require('../models/Product');
const Category     = require('../models/Category');
const UserActivity = require('../models/UserActivity');
const jwt          = require('jsonwebtoken');

// ─── Get All Products (with filters) ─────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, size, color, minPrice, maxPrice, sort, search, page = 1, limit = 12 } = req.query;
    let query = { isActive: true };

    if (category)            query.category  = category;
    if (size)                query.sizes      = size;
    if (color)               query.colors     = color;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low')  sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'rating')     sortOption = { avgRating: -1 };

    const total    = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('sellerId', 'shopName')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ products, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get All Categories ───────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get Single Product ───────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('sellerId', 'shopName shopLogo rating');

    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Log user activity if logged in
    if (req.headers.authorization) {
      try {
        const token   = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await UserActivity.create({
          userId:       decoded.id,
          productId:    product._id,
          activityType: 'view',
          category:     product.category?.name,
        });
      } catch (_) {}
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get Recommendations ──────────────────────────────────────
router.get('/:id/recommendations', async (req, res) => {
  try {
    const product      = await Product.findById(req.params.id);
    const recommended  = await Product.find({
      category: product.category,
      _id:      { $ne: product._id },
      isActive: true,
    }).limit(8);
    res.json(recommended);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
