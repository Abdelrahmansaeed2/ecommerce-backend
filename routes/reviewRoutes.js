const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

// mergeParams: true allows us to get access to params from other routers (e.g., productId)
const router = express.Router({ mergeParams: true });

// All routes after this middleware are protected
router.use(authController.protect);

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo("user"),
    reviewController.setProductUserIds,
    reviewController.createReview,
  );

router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.deleteReview,
  );

module.exports = router;
