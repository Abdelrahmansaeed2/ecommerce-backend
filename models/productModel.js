const mongoose = require("mongoose");
const slugify = require("slugify");
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A product must have a name"],
      trim: true,
      unique: true,
      maxlength: [
        100,
        "A product name must have less or equal then 100 characters",
      ],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "A product must have a description"],
      trim: true,
    },
    description_embedding: {
      type: [Number],
      select: false, // Don't send the large embedding vector to the client by default
    },
    price: {
      type: Number,
      required: [true, "A product must have a price"],
    },
    images: [String],
    category: {
      type: String,
      required: [true, "A product must have a category"],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, "A product must have a stock quantity"],
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10, // Rounds to one decimal place
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Create a text index on name and description for searching
productSchema.index({ name: "text", description: "text" });

// Pre-save hook to generate vector embedding for the product description
productSchema.pre("save", async function (next) {
  // Only generate embedding if the description was modified (or is new)
  if (this.isModified("description")) {
    try {
      const response = await openai.embeddings.create({
        model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
        input: this.description,
        encoding_format: "float",
      });
      this.description_embedding = response.data[0].embedding;
    } catch (error) {
      console.error("Failed to generate product embedding:", error);
      // Decide if you want to block saving or not. For now, we'll allow it.
    }
  }
  next();
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
productSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
