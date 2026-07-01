const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        sellerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
        name:      String,
        image:     String,
        quantity:  Number,
        size:      String,
        color:     String,
        price:     Number,
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone:    { type: String, required: true },
      street:   { type: String, required: true },
      city:     { type: String, required: true },
      province: { type: String, required: true },
      zipCode:  { type: String, required: true },
      country:  { type: String, default: 'Pakistan' },
    },
    totalAmount:       { type: Number, required: true },
    discountAmount:    { type: Number, default: 0 },
    loyaltyPointsUsed: { type: Number, default: 0 },
    couponCode:        { type: String },
    paymentMethod:     { type: String, enum: ['COD', 'online'], required: true },
    paymentStatus:     { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    estimatedDelivery: { type: String },
    trackingNumber:    { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
