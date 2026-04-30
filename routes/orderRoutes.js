const express = require("express");
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");

const router = express.Router();

// All routes are protected
router.use(authController.protect);

router.post(
  "/cod",
  authController.restrictTo("user"),
  orderController.createCashOrder,
);

router.get(
  "/",
  authController.restrictTo("user"),
  orderController.getUserOrders,
);

router.patch(
  "/:orderId/status",
  authController.restrictTo("admin"),
  orderController.updateOrderStatus,
);

module.exports = router;
