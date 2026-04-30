const express = require("express");
const wishlistController = require("../controllers/wishlistController");
const authController = require("../controllers/authController");

const router = express.Router();

// All wishlist routes are protected and require a logged-in user
router.use(authController.protect, authController.restrictTo("user"));

router
  .route("/")
  .get(wishlistController.getWishlist)
  .post(wishlistController.addToWishlist);

router.route("/:productId").delete(wishlistController.removeFromWishlist);

module.exports = router;
