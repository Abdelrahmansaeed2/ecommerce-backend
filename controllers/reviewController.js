const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.productId) filter = { product: req.params.productId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    success: true,
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      review,
    },
  });
});

exports.setProductUserIds = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: {
      review: newReview,
    },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const doc = await Review.findById(req.params.id);

  if (!doc) {
    return next(new AppError("No review found with that ID", 404));
  }

  if (doc.user._id.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new AppError("You do not have permission to perform this action", 403),
    );
  }

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    { review: req.body.review, rating: req.body.rating },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    success: true,
    data: {
      review: updatedReview,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const doc = await Review.findById(req.params.id);

  if (!doc) {
    return next(new AppError("No review found with that ID", 404));
  }

  if (doc.user._id.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new AppError("You do not have permission to perform this action", 403),
    );
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    success: true,
    data: null,
  });
});
