const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, "Notification message cannot be empty."],
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String, // e.g., '/orders/some-order-id'
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
