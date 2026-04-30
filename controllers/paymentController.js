const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const paymentService = require("../services/paymentService");

exports.initiatePayment = catchAsync(async (req, res, next) => {
  const { paymentMethod, couponApplied } = req.body;

  const user = await User.findById(req.user.id);
  const cart = await Cart.findOne({ orderedBy: user._id }).populate(
    "products.product",
    "name",
  );

  if (!cart || cart.products.length === 0) {
    return next(new AppError("Your cart is empty.", 400));
  }

  let responseData;

  switch (paymentMethod) {
    case "stripe":
      const stripeData = await paymentService.initiateStripePayment(
        cart,
        couponApplied,
      );
      responseData = {
        provider: "stripe",
        clientSecret: stripeData.clientSecret,
        payable: stripeData.payable,
      };
      break;

    case "paymob":
      const paymobUrl = await paymentService.initiatePaymobPayment(
        cart,
        user,
        couponApplied,
      );
      responseData = {
        provider: "paymob",
        redirectUrl: paymobUrl,
      };
      break;

    case "fawry":
      const fawryUrl = await paymentService.initiateFawryPayment(
        cart,
        user,
        couponApplied,
      );
      responseData = {
        provider: "fawry",
        redirectUrl: fawryUrl,
      };
      break;

    default:
      return next(new AppError("Invalid payment method selected.", 400));
  }

  res.status(200).json({
    success: true,
    data: responseData,
  });
});
