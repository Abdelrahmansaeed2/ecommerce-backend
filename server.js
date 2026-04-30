const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./config/logger");
const { initializeSocket } = require("./socket.js");

//////////////////////////////////////////////////
// 🚀 Start Server
//////////////////////////////////////////////////

const startServer = async () => {
  try {
    //////////////////////////////////////////////////
    // 🗄 Connect DB
    //////////////////////////////////////////////////
    await connectDB();
    logger.info("✅ MongoDB connected");

    //////////////////////////////////////////////////
    // 🚀 Start Server
    //////////////////////////////////////////////////
    const PORT = process.env.PORT || 5000;

    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: "*", // In production, restrict this to your frontend's URL
        methods: ["GET", "POST"],
      },
    });

    initializeSocket(io);

    const server = httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🔌 Socket.IO server initialized`);
    });

    //////////////////////////////////////////////////
    //  Error Handling (Production Safe)
    //////////////////////////////////////////////////

    process.on("unhandledRejection", (err) => {
      logger.error(" UNHANDLED REJECTION! Shutting down...", err);
      server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (err) => {
      logger.error(" UNCAUGHT EXCEPTION! Shutting down...", err);
      process.exit(1);
    });
  } catch (error) {
    logger.error(" Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
