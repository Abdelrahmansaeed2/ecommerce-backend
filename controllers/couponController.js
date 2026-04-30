const Coupon = require("../models/couponModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createCoupon = catchAsync(async (req, res, next) => {
  const { name, expiry, discount } = req.body;
  const newCoupon = await Coupon.create({ name, expiry, discount });

  res.status(201).json({
    success: true,
    data: {
      coupon: newCoupon,
    },
  });
});

exports.getAllCoupons = catchAsync(async (req, res, next) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    results: coupons.length,
    data: {
      coupons,
    },
  });
});

exports.updateCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    return next(new AppError("No coupon found with that ID", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      coupon,
    },
  });
});

exports.deleteCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    return next(new AppError("No coupon found with that ID", 404));
  }

  res.status(204).json({
    success: true,
    data: null,
  });
});
