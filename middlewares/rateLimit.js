const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW_MS || 15) * 60 * 1000, // minutes to milliseconds
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after a few minutes.",
});

module.exports = limiter;