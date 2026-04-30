const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");

dotenv.config();

//////////////////////////////////////////////////
// 🔥 Swagger Loader (Enterprise Level)
//////////////////////////////////////////////////

const loadSwagger = () => {
  const files = [
    "swagger-enterprise.json", // 🔥 الأفضل
    "swagger-mongoose.json",
    "swagger-fixed.json",
    "swagger.json"
  ];

  for (const file of files) {
    const fullPath = path.join(__dirname, file);

    if (fs.existsSync(fullPath)) {
      console.log(`📄 Swagger loaded → ${file}`);

      // 🔥 مهم: remove cache عشان reload في dev
      delete require.cache[require.resolve(fullPath)];

      return require(fullPath);
    }
  }

  console.warn("⚠️ No Swagger file found → Swagger disabled");
  return null;
};

let swaggerDocument = loadSwagger();

//////////////////////////////////////////////////
// 🌐 Swagger Route
//////////////////////////////////////////////////

if (swaggerDocument) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customSiteTitle: "E-Commerce API Docs",
      swaggerOptions: {
        persistAuthorization: true
      }
    })
  );
}

//////////////////////////////////////////////////
// ❤️ Health Check (مهم للتسليم)
//////////////////////////////////////////////////

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

//////////////////////////////////////////////////
// 🚀 Start Server
//////////////////////////////////////////////////

const startServer = async () => {
  try {
    //////////////////////////////////////////////////
    // 🗄 Connect DB
    //////////////////////////////////////////////////
    await connectDB();
    console.log("✅ MongoDB connected");

    //////////////////////////////////////////////////
    // 🚀 Start Server
    //////////////////////////////////////////////////
    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running → http://localhost:${PORT}`);

      if (swaggerDocument) {
        console.log(`📄 Swagger Docs → http://localhost:${PORT}/api-docs`);
      } else {
        console.log("⚠️ Swagger not available");
      }

      console.log(`❤️ Health Check → http://localhost:${PORT}/health`);
    });

    //////////////////////////////////////////////////
    // ❌ Error Handling (Production Safe)
    //////////////////////////////////////////////////

    process.on("unhandledRejection", (err) => {
      console.error("❌ Unhandled Rejection:", err.message || err);
      server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (err) => {
      console.error("❌ Uncaught Exception:", err.message || err);
      process.exit(1);
    });

    //////////////////////////////////////////////////
    // 🔄 Hot Reload Swagger (Dev Only)
    //////////////////////////////////////////////////

    if (process.env.NODE_ENV !== "production") {
      fs.watch(__dirname, (event, filename) => {
        if (filename && filename.includes("swagger")) {
          console.log("🔄 Reloading Swagger...");
          swaggerDocument = loadSwagger();
        }
      });
    }

  } catch (error) {
    console.error("❌ Server failed to start:", error.message || error);
    process.exit(1);
  }
};

startServer();