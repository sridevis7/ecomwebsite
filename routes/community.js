const router        = require('express').Router();
const CommunityPost = require('../models/CommunityPost');
const auth          = require('../middleware/auth');
const cloudinary    = require('cloudinary').v2;
const multer        = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

const uploadToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'stylehub/community' }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(fileBuffer);
  });

// ─── Get feed (newest first) ───────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .populate('userId', 'name avatar')
      .populate('taggedProducts', 'name price images')
      .populate('comments.userId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Create a post ──────────────────────────────────────────────
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'An image is required' });

    const result = await uploadToCloudinary(req.file.buffer);
    const { caption, taggedProducts } = req.body;

    const post = await CommunityPost.create({
      userId: req.user.id,
      image: result.secure_url,
      caption,
      taggedProducts: taggedProducts ? JSON.parse(taggedProducts) : [],
    });

    const populated = await CommunityPost.findById(post._id)
      .populate('userId', 'name avatar')
      .populate('taggedProducts', 'name price images');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Like / unlike a post ──────────────────────────────────────
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.some((id) => id.toString() === req.user.id);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();
    res.json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Add a comment ──────────────────────────────────────────────
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { userId: req.user.id, text } } },
      { new: true }
    ).populate('comments.userId', 'name');
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Delete own post ────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not your post' });

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
