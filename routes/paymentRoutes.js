const express = require("express");
const paymentController = require("../controllers/paymentController");
const authController = require("../controllers/authController");

const router = express.Router();

// All routes are protected
router.use(authController.protect, authController.restrictTo("user"));

router.post("/initiate", paymentController.initiatePayment);

module.exports = router;
