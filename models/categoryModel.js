const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A category must have a name"],
      unique: true,
      trim: true,
      minlength: [
        3,
        "A category name must have more or equal then 3 characters",
      ],
      maxlength: [
        32,
        "A category name must have less or equal then 32 characters",
      ],
    },
    slug: {
      type: String,
      lowercase: true,
    },
  },
  { timestamps: true },
);

categorySchema.pre("save", function (next) {
  this.slug = this.name.split(" ").join("-");
  next();
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
