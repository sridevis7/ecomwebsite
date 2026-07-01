const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
  {
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shopName:        { type: String, required: true },
    shopDescription: { type: String },
    shopLogo:        { type: String },
    shopAddress:     { type: String },
    cnicNumber:      { type: String },
    bankAccount:     { type: String },
    approvalStatus:  { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    totalEarnings:   { type: Number, default: 0 },
    totalOrders:     { type: Number, default: 0 },
    rating:          { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Seller', sellerSchema);
