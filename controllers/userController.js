const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.saveAddress = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { address: req.body.address },
    { new: true },
  );

  res.status(200).json({
    success: true,
    message: "Address saved successfully.",
    data: {
      address: user.address,
    },
  });
});

exports.createUserCart = catchAsync(async (req, res, next) => {
  const { cart } = req.body;
  const user = await User.findById(req.user.id);

  // Check if user already has a cart and remove it
  const existingCart = await Cart.findOne({ orderedBy: user._id });
  if (existingCart) {
    await existingCart.deleteOne();
  }

  let products = [];
  let cartTotal = 0;

  for (let i = 0; i < cart.length; i++) {
    let productObject = {};
    productObject.product = cart[i]._id;
    productObject.count = cart[i].count;

    // Get price from DB to ensure accuracy
    let productFromDb = await Product.findById(cart[i]._id)
      .select("price")
      .exec();
    productObject.price = productFromDb.price;

    products.push(productObject);
    cartTotal += productObject.price * productObject.count;
  }

  let newCart = await new Cart({
    products,
    cartTotal,
    orderedBy: user._id,
  }).save();

  res.status(201).json({
    success: true,
    message: "Cart created successfully.",
    data: {
      cart: newCart,
    },
  });
});

exports.getUserCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ orderedBy: req.user.id }).populate(
    "products.product",
    "_id name price",
  );

  if (!cart) {
    return next(new AppError("No cart found for this user.", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      cart,
    },
  });
});

exports.emptyCart = catchAsync(async (req, res, next) => {
  await Cart.findOneAndRemove({ orderedBy: req.user.id });
  res.status(204).json({
    success: true,
    data: null,
  });
});

exports.applyCouponToCart = catchAsync(async (req, res, next) => {
  const { coupon } = req.body;
  const validCoupon = await Coupon.findOne({ name: coupon });

  if (!validCoupon || validCoupon.expiry < Date.now()) {
    return next(new AppError("Invalid or expired coupon", 400));
  }

  const cart = await Cart.findOne({ orderedBy: req.user.id });

  const totalAfterDiscount = (
    cart.cartTotal -
    (cart.cartTotal * validCoupon.discount) / 100
  ).toFixed(2);

  await Cart.findOneAndUpdate(
    { orderedBy: req.user.id },
    { totalAfterDiscount },
    { new: true },
  );

  res.status(200).json({
    success: true,
    message: "Coupon applied successfully.",
    data: { totalAfterDiscount },
  });
});
