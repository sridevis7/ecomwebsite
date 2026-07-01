const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema(
  {
    orderId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
    reason:       { type: String, required: true },
    description:  { type: String },
    images:       [{ type: String }],
    status:       { type: String, enum: ['requested', 'approved', 'rejected', 'refunded'], default: 'requested' },
    refundAmount: { type: Number },
    adminNote:    { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Return', returnSchema);
