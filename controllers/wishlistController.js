const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getWishlist = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("wishlist");

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      wishlist: user.wishlist,
    },
  });
});

exports.addToWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return next(new AppError("Please provide a productId.", 400));
  }

  // Use $addToSet to prevent duplicate entries
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { wishlist: productId } },
    { new: true, runValidators: true },
  ).populate("wishlist");

  res.status(200).json({
    success: true,
    message: "Product added to wishlist.",
    data: {
      wishlist: user.wishlist,
    },
  });
});

exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  if (!productId) {
    return next(new AppError("Please provide a productId in the URL.", 400));
  }

  // Use $pull to remove the item from the array
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { wishlist: productId } },
    { new: true },
  ).populate("wishlist");

  res.status(200).json({
    success: true,
    message: "Product removed from wishlist.",
    data: {
      wishlist: user.wishlist,
    },
  });
});
