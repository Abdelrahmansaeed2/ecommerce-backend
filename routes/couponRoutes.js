const express = require("express");
const couponController = require("../controllers/couponController");
const authController = require("../controllers/authController");

const router = express.Router();

// All routes below are protected
router.use(authController.protect);

// All routes below are for admins only
router.use(authController.restrictTo("admin"));

router
  .route("/")
  .post(couponController.createCoupon)
  .get(couponController.getAllCoupons);

router
  .route("/:id")
  .delete(couponController.deleteCoupon)
  .patch(couponController.updateCoupon);

module.exports = router;
