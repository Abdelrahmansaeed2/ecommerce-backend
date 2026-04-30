const express = require("express");
const webhookController = require("../controllers/webhookController");

const router = express.Router();

// Stripe requires the raw body to verify its signature.
// This middleware must come BEFORE the global express.json() parser.
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  webhookController.stripeWebhook,
);

router.post("/paymob", webhookController.paymobWebhook);

router.post("/fawry", webhookController.fawryWebhook);

module.exports = router;
