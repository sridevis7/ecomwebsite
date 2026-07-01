const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sessionId:    { type: String },
    productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    activityType: { type: String, enum: ['view', 'search', 'cart', 'wishlist', 'purchase'] },
    searchQuery:  { type: String },
    category:     { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserActivity', userActivitySchema);
