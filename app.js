const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");

const logger = require("./config/logger");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./middleware/errorHandler");
const authRouter = require("./routes/authRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const wishlistRouter = require("./routes/wishlistRoutes");
const couponRouter = require("./routes/couponRoutes");
const userRouter = require("./routes/userRoutes");
const orderRouter = require("./routes/orderRoutes");
const paymentRouter = require("./routes/paymentRoutes");
const webhookRouter = require("./routes/webhookRoutes");
const chatbotRouter = require("./routes/chatbotRoutes");
const notificationRouter = require("./routes/notificationRoutes");
const adminRouter = require("./routes/adminRoutes");

const app = express();


// Enable CORS
app.use(cors());

// importantt: Webhook routes need to be registered before the global express.json()
// body parser to handle raw request bodies for signature verification.
app.use("/api/v1/webhooks", webhookRouter);

// HTTP Request Logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", limiter);

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookie parser
app.use(cookieParser());



const swaggerDocumentPath = path.join(__dirname, "swagger-enterprise.json"); // Or your preferred swagger file
if (fs.existsSync(swaggerDocumentPath)) {
  const swaggerDocument = require(swaggerDocumentPath);
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customSiteTitle: "E-Commerce API Docs",
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );
  logger.info(`  Swagger Docs available → /api-docs`);
} else {
  logger.warn("  Swagger file not found, API docs are disabled.");
}

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// API routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/webhooks", webhookRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/chatbot", chatbotRouter);
app.use("/api/v1/admin", adminRouter);

// Handle unhandled routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
