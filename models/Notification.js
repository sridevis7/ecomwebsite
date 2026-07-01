const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    type:      { type: String, enum: ['restock', 'order', 'return', 'promotion', 'system'] },
    message:   { type: String, required: true },
    isRead:    { type: Boolean, default: false },
    email:     { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
