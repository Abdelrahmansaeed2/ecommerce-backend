const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const orderController = require("./orderController");
const logger = require("../config/logger");
const Cart = require("../models/cartModel");

// Stripe Webhook
exports.stripeWebhook = catchAsync(async (req, res, next) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    logger.error(`Stripe webhook signature error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const { userId, cartId } = paymentIntent.metadata;

    const paymentResult = {
      provider: "stripe",
      id: paymentIntent.id,
      status: paymentIntent.status,
      update_time: new Date(paymentIntent.created * 1000).toISOString(),
      email_address: paymentIntent.receipt_email,
    };

    await orderController.createOrderAfterPayment(
      userId,
      cartId,
      paymentResult,
      "stripe",
    );
    logger.info(`Stripe payment succeeded for cart ${cartId}. Order created.`);
  }

  res.status(200).json({ received: true });
});

// Paymob Webhook
exports.paymobWebhook = catchAsync(async (req, res, next) => {
  const { obj } = req.body;
  const hmac = req.query.hmac;

  // 1. Concatenate the required fields from the response object
  const concatenatedString = `${obj.amount_cents}${obj.created_at}${obj.currency}${obj.error_occured}${obj.has_parent_transaction}${obj.id}${obj.integration_id}${obj.is_3d_secure}${obj.is_auth}${obj.is_capture}${obj.is_refunded}${obj.is_standalone_payment}${obj.is_voided}${obj.order.id}${obj.owner}${obj.pending}${obj.source_data.pan}${obj.source_data.sub_type}${obj.source_data.type}${obj.success}`;

  // 2. Hash the concatenated string with your HMAC secret
  const calculatedHmac = crypto
    .createHmac("sha512", process.env.PAYMOB_HMAC_SECRET)
    .update(concatenatedString)
    .digest("hex");

  // 3. Compare the calculated HMAC with the one from the query string
  if (calculatedHmac !== hmac) {
    logger.error("Paymob webhook HMAC verification failed.");
    return next(new AppError("Invalid HMAC signature.", 400));
  }

  if (obj.success === true && obj.pending === false) {
    const cartId = obj.order.merchant_order_id;
    const cart = await Cart.findById(cartId);
    if (!cart) {
      logger.error(`Paymob webhook: Cart not found for ID ${cartId}`);
      return res.status(404).send("Cart not found");
    }
    const userId = cart.orderedBy;

    const paymentResult = {
      provider: "paymob",
      id: obj.id,
      status: "succeeded",
      update_time: obj.created_at,
    };

    await orderController.createOrderAfterPayment(
      userId,
      cartId,
      paymentResult,
      "paymob",
    );
    logger.info(`Paymob payment succeeded for cart ${cartId}. Order created.`);
  }

  res.status(200).json({ received: true });
});

/// Fawry Webhook
exports.fawryWebhook = catchAsync(async (req, res, next) => {
  const { merchantRefNumber, transactionStatus, signature } = req.body;
  const securityKey = process.env.FAWRY_SECURITY_KEY;

  // Verify signature
  const signatureBody = `${merchantRefNumber}${transactionStatus}${securityKey}`;
  const calculatedSignature = crypto
    .createHash("sha256")
    .update(signatureBody)
    .digest("hex");

  if (calculatedSignature !== signature) {
    logger.error("Fawry webhook signature verification failed.");
    return next(new AppError("Invalid signature.", 400));
  }

  if (transactionStatus === "PAID") {
    const cartId = merchantRefNumber;
    const cart = await Cart.findById(cartId);
    if (!cart) {
      logger.error(`Fawry webhook: Cart not found for ID ${cartId}`);
      return res.status(404).send("Cart not found");
    }
    const userId = cart.orderedBy;

    const paymentResult = {
      provider: "fawry",
      id: req.body.fawryRefNumber,
      status: transactionStatus,
      update_time: new Date().toISOString(),
    };

    await orderController.createOrderAfterPayment(
      userId,
      cartId,
      paymentResult,
      "fawry",
    );
    logger.info(`Fawry payment succeeded for cart ${cartId}. Order created.`);
  }

  res.status(200).json({ received: true });
});
