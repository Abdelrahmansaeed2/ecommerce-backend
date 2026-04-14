import productModel from "../models/productModel.js";
import { createError } from "../utils/error.js";

const getAllProducts = async (req, res, next) => {
  try {
    const { search, category, status, minPrice, maxPrice } = req.query;
    const filters = {};
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      filters.category = category;
    }
    if (status) {
      filters.status = status;
    }
    if (minPrice || maxPrice) {
      filters.price = {};
      const min = Number(minPrice);
      const max = Number(maxPrice);
      if (!Number.isNaN(min) && minPrice !== undefined) {
        filters.price.$gte = min;
      }
      if (!Number.isNaN(max) && maxPrice !== undefined) {
        filters.price.$lte = max;
      }
    }
    const products = await productModel.find(filters);
    if (!products || products.length === 0) {
      return res.status(200).json({ message: "no data found", data: [] });
    }
    return res.status(200).json({ message: "data retrieved successfully", data: products });
  } catch (err) {
    next(err);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      throw createError("Product not found", 404);
    }
    return res.status(200).json({ message: "product retrieved successfully", data: product });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, price, category, description, status } = req.body;
    if (!name || price === undefined || !category) {
      throw createError("name, price and category are required", 400);
    }
    const newProduct = await productModel.create({ name, price, category, description, status });
    if (!newProduct) {
      throw createError("failed to create product", 500);
    }
    return res.status(201).json({ message: "product created successfully", data: newProduct });
  } catch (err) {
    next(err);
  }
};

const editProduct = async (req, res, next) => {
  try {
    const product = await productModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      throw createError("Product not found", 404);
    }
    return res.status(200).json({ message: "product updated successfully", data: product });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      overwrite: true,
    });
    if (!product) {
      throw createError("Product not found", 404);
    }
    return res.status(200).json({ message: "product updated successfully", data: product });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await productModel.findByIdAndDelete(req.params.id);
    if (!product) {
      throw createError("Product not found", 404);
    }
    return res.status(200).json({ message: "product deleted successfully", data: product });
  } catch (err) {
    next(err);
  }
};

export { getAllProducts, getProduct, createProduct, editProduct, updateProduct, deleteProduct };