const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

const router = express.Router();

// Nested route: POST /products/5c88fa8cf4afda39709c2955/reviews
router.use("/:productId/reviews", reviewRouter);

router
  .route("/")
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    productController.createProduct,
  );

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    productController.updateProduct,
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    productController.deleteProduct,
  );

module.exports = router;
