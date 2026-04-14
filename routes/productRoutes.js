const express = require("express");
const { getAllProducts, getProduct, editProduct, updateProduct, deleteProduct, createProduct } = require("../controllers/productController");
const router = express.Router();

router.route("/")
.get(getAllProducts)
.post(createProduct);


router.route("/:id")
.get(getProduct)
.patch(editProduct)
.put(updateProduct)
.delete(deleteProduct);

module.exports = router;