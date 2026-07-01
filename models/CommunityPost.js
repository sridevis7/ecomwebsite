const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image:     { type: String, required: true },
    caption:   { type: String },
    taggedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    likes:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text:    String,
        date:    { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommunityPost', communityPostSchema);
