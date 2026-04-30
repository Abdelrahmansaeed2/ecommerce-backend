/**
 * @class AppError
 * @extends Error
 * @description Custom error class for operational errors.
 * This allows us to distinguish between operational errors (which we can send to the client)
 * and programming errors (which should be hidden).
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
