const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Coupon name is required."],
      unique: true,
      uppercase: true,
    },
    expiry: {
      type: Date,
      required: [true, "Coupon expiry date is required."],
    },
    discount: {
      type: Number,
      required: [true, "Coupon discount value is required."],
    },
  },
  { timestamps: true },
);

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
