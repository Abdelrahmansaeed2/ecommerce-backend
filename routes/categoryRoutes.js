const express = require("express");
const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  editCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

const router = express.Router();

// Public routes
router.route("/").get(getAllCategories);

router.route("/:id").get(getCategory);

// Protected routes (Admin only)
router.route("/").post(protect, authorize("Admin"), createCategory);

router
  .route("/:id")
  .put(protect, authorize("Admin"), updateCategory)
  .patch(protect, authorize("Admin"), editCategory)
  .delete(protect, authorize("Admin"), deleteCategory);

module.exports = router;