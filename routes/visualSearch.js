const router      = require('express').Router();
const Product     = require('../models/Product');
const Category    = require('../models/Category');
const cloudinary  = require('cloudinary').v2;
const multer      = require('multer');
const Anthropic   = require('@anthropic-ai/sdk');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

const uploadToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'stylehub/visual-search' }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(fileBuffer);
  });

// ─── Visual Search: upload photo → describe it → match products ──
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'An image is required' });

    // 1. Upload to Cloudinary so we have a hosted URL (also useful for debugging/history later)
    const uploaded = await uploadToCloudinary(req.file.buffer);

    // 2. Ask Claude to describe the clothing item using vision
    const base64Image = req.file.buffer.toString('base64');
    const mediaType = req.file.mimetype || 'image/jpeg';

    const visionResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Image },
            },
            {
              type: 'text',
              text:
                'Look at this clothing item. Respond ONLY with valid JSON, no other text, in this exact format: ' +
                '{"category": "one word like dress/shirt/jeans/jacket/shoes", ' +
                '"colors": ["color1", "color2"], ' +
                '"keywords": ["keyword1", "keyword2", "keyword3"]}. ' +
                'Keywords should be style descriptors like "casual", "floral", "denim", "formal", "summer", etc.',
            },
          ],
        },
      ],
    });

    let parsed;
    try {
      const rawText = visionResponse.content[0].text.trim();
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch (e) {
      parsed = { category: '', colors: [], keywords: [] };
    }

    const searchTerms = [parsed.category, ...(parsed.colors || []), ...(parsed.keywords || [])]
      .filter(Boolean)
      .map((t) => t.toLowerCase());

    // 3. Try to match a category in our DB by name
    const matchedCategory = await Category.findOne({
      name: { $regex: parsed.category || '', $options: 'i' },
    });

    // 4. Build a flexible search query across tags, colors, and name
    const orConditions = searchTerms.map((term) => ({
      $or: [
        { tags: { $regex: term, $options: 'i' } },
        { colors: { $regex: term, $options: 'i' } },
        { name: { $regex: term, $options: 'i' } },
      ],
    }));

    let query = { isActive: true };
    if (orConditions.length > 0) query.$or = orConditions.flatMap((c) => c.$or);
    if (matchedCategory) query.category = matchedCategory._id;

    let products = await Product.find(query)
      .populate('category', 'name')
      .populate('sellerId', 'shopName')
      .limit(20);

    // 5. Fallback: if category match was too narrow and found nothing, drop it and retry by terms only
    if (products.length === 0 && matchedCategory) {
      products = await Product.find({ isActive: true, $or: orConditions.flatMap((c) => c.$or) })
        .populate('category', 'name')
        .populate('sellerId', 'shopName')
        .limit(20);
    }

    res.json({
      detected: parsed,
      uploadedImage: uploaded.secure_url,
      products,
      total: products.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
