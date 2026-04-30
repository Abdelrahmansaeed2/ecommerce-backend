const Category = require("../models/categoryModel");
const factory = require("./handlerFactory");

exports.createCategory = factory.createOne(Category);
exports.getCategory = factory.getOne(Category);
exports.updateCategory = factory.updateOne(Category);
exports.deleteCategory = factory.deleteOne(Category);

exports.getAllCategories = async (req, res, next) => {
  try {
    const documents = await Category.find();

    res.status(200).json({
      status: "success",
      results: documents.length,
      data: {
        data: documents,
      },
    });
  } catch (err) {
    next(err);
  }
};
