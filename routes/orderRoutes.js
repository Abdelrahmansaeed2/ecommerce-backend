const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const {
  getAllOrders,
  getMyOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

router.get("/mine", protect, getMyOrders);
router.get("/", protect, authorize("Admin"), getAllOrders);
router.get("/:id", protect, getOrder);
router.post("/", protect, createOrder);
router.put("/:id", protect, updateOrder);
router.patch("/:id", protect, updateOrder);
router.delete("/:id", protect, deleteOrder);

module.exports = router;