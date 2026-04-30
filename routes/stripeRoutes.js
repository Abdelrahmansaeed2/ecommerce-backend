const express = require("express");
const stripeController = require("../controllers/stripeController");
const authController = require("../controllers/authController");

const router = express.Router();

// All routes are protected
router.use(authController.protect, authController.restrictTo("user"));

router.post("/create-payment-intent", stripeController.createPaymentIntent);

module.exports = router;
