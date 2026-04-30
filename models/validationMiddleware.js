const { validationResult } = require("express-validator");
const AppError = require("../utils/appError");


const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    // Join messages and pass to AppError for a formatted 400 response
    return next(
      new AppError(`Invalid input data. ${errorMessages.join(". ")}`, 400),
    );
  }
  next();
};

module.exports = handleValidation;
