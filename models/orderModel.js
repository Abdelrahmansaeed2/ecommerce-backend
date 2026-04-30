const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        count: Number,
      },
    ],
    paymentResult: {
      provider: String,
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "paymob", "fawry", "cod"],
      required: true,
    },
    totalOrderPrice: Number,
    orderStatus: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Processing", "Dispatched", "Cancelled", "Delivered"],
    },
    orderedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
