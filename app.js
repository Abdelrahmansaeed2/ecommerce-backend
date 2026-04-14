const express = require("express");
const morgan = require("morgan");
const limiter = require("./middlewares/rateLimit");
const errorHandler = require("./middlewares/errorMiddleware");

const app = express();

// body parser
app.use(express.json());

// logger
app.use(morgan("dev"));

// rate limiter
app.use(limiter);

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// product routes


// error middleware
app.use(errorHandler);

module.exports = app;