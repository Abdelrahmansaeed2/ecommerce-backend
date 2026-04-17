// import express from "express";
// const morgan = require("morgan");
// const limiter = require("./middlewares/rateLimit");
// const errorHandler = require("./middlewares/errorMiddleware");
// import categoryRoutes from "./routes/categoryRoutes.js";
// const app = express();

// // body parser
// app.use(express.json());

// // logger
// app.use(morgan("dev"));

// // rate limiter
// app.use(limiter);

// // routes
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/products", require("./routes/productRoutes"));
// app.use("/api/categories", categoryRoutes);
// app.use("/api/orders", require("./routes/orderRoutes"));

// // error middleware
// app.use(errorHandler);

// module.exports = app;

import express from "express";
import morgan from "morgan";

import limiter from "./middlewares/rateLimit.js";
import errorHandler from "./middlewares/errorMiddleware.js";

import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

// body parser
app.use(express.json());

// logger
app.use(morgan("dev"));

// rate limiter
app.use(limiter);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);

// error middleware
app.use(errorHandler);

export default app;