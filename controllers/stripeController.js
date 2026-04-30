const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = catchAsync(async (req, res, next) => {
  const { couponApplied } = req.body;

  // 1) Get user and their cart
  const user = await User.findById(req.user.id);
  const cart = await Cart.findOne({ orderedBy: user._id });

  if (!cart) {
    return next(new AppError("No active cart found for this user.", 404));
  }

  // 2) Calculate the final amount
  let finalAmount = 0;
  if (couponApplied && cart.totalAfterDiscount) {
    finalAmount = Math.round(cart.totalAfterDiscount * 100); // Stripe expects amount in cents
  } else {
    finalAmount = Math.round(cart.cartTotal * 100);
  }

  // 3) Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: finalAmount,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.status(200).json({
    success: true,
    data: {
      clientSecret: paymentIntent.client_secret,
      cartTotal: cart.cartTotal,
      totalAfterDiscount: cart.totalAfterDiscount,
      payable: finalAmount / 100,
    },
  });
});
