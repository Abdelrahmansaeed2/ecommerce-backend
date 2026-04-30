const express = require("express");
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo("admin"),
    categoryController.createCategory,
  );

router
  .route("/:id")
  .get(categoryController.getCategory)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo("admin"),
    categoryController.updateCategory,
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo("admin"),
    categoryController.deleteCategory,
  );

module.exports = router;
