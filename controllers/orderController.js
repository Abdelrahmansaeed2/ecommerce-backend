const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getUserModel = async () => {
  const userModule = await import("../models/userModel.js");
  return userModule.default;
};

const validateShippingAddress = (shippingAddress) => {
  const requiredFields = ["fullName", "phone", "addressLine", "city", "country"];
  for (const field of requiredFields) {
    if (!shippingAddress[field] || String(shippingAddress[field]).trim() === "") {
      throw createError(`shippingAddress.${field} is required`, 400);
    }
  }
};

const buildOrderItems = async (items) => {
  const normalizedItems = [];
  let totalPrice = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw createError(`Product not found: ${item.product}`, 400);
    }

    const quantity = Number(item.quantity || 1);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw createError("Quantity must be a positive integer", 400);
    }

    const price = Number(product.price);
    normalizedItems.push({
      product: product._id,
      name: product.name,
      quantity,
      price,
    });
    totalPrice += price * quantity;
  }

  return { normalizedItems, totalPrice };
};

const getAllOrders = async (req, res, next) => {
  try {
    const { status, userEmail } = req.query;
    const filters = {};

    if (status) {
      filters.status = status;
    }

    if (userEmail) {
      filters.userEmail = userEmail;
    }

    const orders = await Order.find(filters)
      .populate("user", "username email role")
      .populate("items.product", "name price status category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userEmail: req.user.email })
      .populate("user", "username email role")
      .populate("items.product", "name price status category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "username email role")
      .populate("items.product", "name price status category");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (req.user.role !== "Admin" && order.userEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw createError("items array is required", 400);
    }

    if (!shippingAddress) {
      throw createError("shippingAddress is required", 400);
    }

    validateShippingAddress(shippingAddress);

    const { normalizedItems, totalPrice } = await buildOrderItems(items);
    const User = await getUserModel();
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      throw createError("Authenticated user not found", 401);
    }

    const order = await Order.create({
      user: user._id,
      userEmail: req.user.email,
      items: normalizedItems,
      shippingAddress,
      paymentMethod,
      notes,
      totalPrice,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "username email role")
      .populate("items.product", "name price status category");

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (req.user.role !== "Admin" && order.userEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (req.user.role !== "Admin" && req.body.status !== undefined) {
      return res.status(403).json({
        success: false,
        message: "Only admin can update order status",
      });
    }

    const updates = {};

    if (req.body.status) {
      updates.status = req.body.status;
    }

    if (req.body.notes !== undefined) {
      updates.notes = req.body.notes;
    }

    if (req.body.shippingAddress) {
      validateShippingAddress(req.body.shippingAddress);
      updates.shippingAddress = req.body.shippingAddress;
    }

    if (req.body.paymentMethod) {
      updates.paymentMethod = req.body.paymentMethod;
    }

    if (req.body.items) {
      const { normalizedItems, totalPrice } = await buildOrderItems(req.body.items);
      updates.items = normalizedItems;
      updates.totalPrice = totalPrice;
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("user", "username email role")
      .populate("items.product", "name price status category");

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (req.user.role !== "Admin" && order.userEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  getMyOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
};
