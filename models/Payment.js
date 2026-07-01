const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
    method:        { type: String, enum: ['COD', 'online'] },
    status:        { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    amount:        { type: Number, required: true },
    transactionId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
