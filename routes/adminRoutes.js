const express = require("express");
const adminController = require("../controllers/adminController");
const authController = require("../controllers/authController");

const router = express.Router();

// All routes below are protected and for admins only
router.use(authController.protect, authController.restrictTo("admin"));

router.get("/stats", adminController.getDashboardStats);
router.get("/users", adminController.getAllUsers);
router.get("/orders", adminController.getAllOrders);

// Note: Product management routes are already in productRoutes.js

module.exports = router;
