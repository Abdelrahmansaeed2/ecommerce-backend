const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  const orderStats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$totalOrderPrice" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales: orderStats.length > 0 ? orderStats[0].totalSales : 0,
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select("-password");

  res.status(200).json({
    success: true,
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find()
    .populate("products.product", "name")
    .populate("orderedBy", "name email")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    results: orders.length,
    data: {
      orders,
    },
  });
});
