const express = require("express");
const { getAllProducts, getProduct, editProduct, updateProduct, deleteProduct, createProduct } = require("../controllers/productController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const router = express.Router();

router.route("/")
.get(getAllProducts)
.post(protect, authorize("Admin"), createProduct);

router.route("/:id")
.get(getProduct)
.patch(protect, authorize("Admin"), editProduct)
.put(protect, authorize("Admin"), updateProduct)
.delete(protect, authorize("Admin"), deleteProduct);

module.exports = router;