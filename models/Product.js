const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sellerId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    name:                { type: String, required: true },
    description:         { type: String, required: true },
    price:               { type: Number, required: true },
    discountPrice:       { type: Number },
    category:            { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand:               { type: String },
    images:              [{ type: String }],
    sizes:               [{ type: String }],
    colors:              [{ type: String }],
    stock:               { type: Number, default: 0 },
    sold:                { type: Number, default: 0 },
    tags:                [{ type: String }],
    cloudinaryPublicIds: [{ type: String }],
    avgRating:           { type: Number, default: 0 },
    reviewCount:         { type: Number, default: 0 },
    isActive:            { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
