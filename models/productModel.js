import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trimmed: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: {
      type: String,
      maxlength: [100, "the description must be below 100 characters"],
    },
    status: {
      type: String,
      enum: ["active", "discount", "sold out"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Product", productSchema);
