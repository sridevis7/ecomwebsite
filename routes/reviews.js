const router  = require('express').Router();
const Review  = require('../models/Review');
const Product = require('../models/Product');
const auth    = require('../middleware/auth');

// ─── Add Review ───────────────────────────────────────────────
router.post('/:productId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.create({
      userId:    req.user.id,
      productId: req.params.productId,
      rating,
      comment,
    });

    // Update product avg rating
    const reviews   = await Review.find({ productId: req.params.productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(req.params.productId, {
      avgRating:   avgRating.toFixed(1),
      reviewCount: reviews.length,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get Reviews for Product ──────────────────────────────────
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
