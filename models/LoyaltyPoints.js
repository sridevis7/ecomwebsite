const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalPoints: { type: Number, default: 0 },
    transactions: [
      {
        type:        { type: String, enum: ['earned', 'redeemed'] },
        points:      Number,
        orderId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        description: String,
        date:        { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoyaltyPoints', loyaltySchema);
