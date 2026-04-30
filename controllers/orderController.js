const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const { sendNotificationToUser } = require('../socket');
const Notification = require('../models/notificationModel');
const AppError = require('../utils/appError');

 // Creates an order for Cash on Delivery.
exports.createCashOrder = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const userCart = await Cart.findOne({ orderedBy: user._id });

  if (!userCart) {
    return next(new AppError("No active cart found for this user.", 404));
  }

  const finalAmount = userCart.totalAfterDiscount || userCart.cartTotal;

  const newOrder = await new Order({
    products: userCart.products,
    paymentMethod: 'cod',
    orderedBy: user._id,
    totalOrderPrice: finalAmount,
    orderStatus: 'Processing', // Or a dedicated 'Cash on Delivery' status
  }).save();

  const bulkOption = userCart.products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { stock: -item.count, sold: +item.count } },
      },
    };
  });
  await Product.bulkWrite(bulkOption, {});

  await Cart.findOneAndRemove({ orderedBy: user._id });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully.',
    data: { order: newOrder },
  });
});

/**
 * Creates an order after a successful online payment (used by webhooks).
 * @param {string} userId - The ID of the user who placed the order.
 * @param {string} cartId - The ID of the cart to be converted into an order.
 * @param {object} paymentResult - The payment result object from the provider.
 * @param {string} paymentMethod - The payment method used.
 */
exports.createOrderAfterPayment = async (userId, cartId, paymentResult, paymentMethod) => {
  const cart = await Cart.findById(cartId);
  if (!cart) return; // Or throw an error

  const finalAmount = cart.totalAfterDiscount || cart.cartTotal;

  await new Order({
    products: cart.products,
    paymentResult,
    paymentMethod,
    totalOrderPrice: finalAmount,
    orderedBy: userId,
  }).save();

  const bulkOption = cart.products.map(item => ({
    updateOne: {
      filter: { _id: item.product._id },
      update: { $inc: { stock: -item.count, sold: +item.count } },
    },
  }));
  await Product.bulkWrite(bulkOption, {});

  await Cart.findByIdAndRemove(cartId);
};

exports.getUserOrders = catchAsync(async (req, res, next) => {
  const userOrders = await Order.find({ orderedBy: req.user._id })
    .populate('products.product')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: {
      orders: userOrders,
    },
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { orderStatus } = req.body;
  const updated = await Order.findByIdAndUpdate(
    req.params.orderId,
    { orderStatus },
    { new: true }
  );

  if (updated) {
    const message = `Your order status has been updated to: ${orderStatus}`;
    const notification = await Notification.create({
      user: updated.orderedBy,
      message,
      link: `/orders/${updated._id}`,
    });

    // Send real-time notification via Socket.IO
    sendNotificationToUser(updated.orderedBy, notification);
  }

  res.status(200).json({ success: true, data: { order: updated } });
});
