const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

// All routes are protected
router.use(authController.protect, authController.restrictTo("user"));

router.post("/address", userController.saveAddress);

router
  .route("/cart")
  .post(userController.createUserCart)
  .get(userController.getUserCart)
  .delete(userController.emptyCart);

router.post("/cart/coupon", userController.applyCouponToCart);

module.exports = router;
