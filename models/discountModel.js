const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 1 },
  usageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const Coupon = mongoose.model("coupon", couponSchema);

module.exports = Coupon;
