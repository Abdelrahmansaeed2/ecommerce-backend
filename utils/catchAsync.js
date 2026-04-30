/**
 * @function catchAsync
 * @description A wrapper function for async route handlers to catch promise rejections
 * and pass them to the global error handler via next().
 * @param {Function} fn - The async function to wrap.
 * @returns {Function} A new function that handles promise rejections.
 */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
