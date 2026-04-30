const logger = require("./config/logger");

let ioInstance;
const userSocketMap = new Map(); // Map<userId, socketId>

const addUser = (userId, socketId) => {
  if (userId) {
    userSocketMap.set(userId.toString(), socketId);
    logger.info(
      `User ${userId} connected with socket ${socketId}. Total users: ${userSocketMap.size}`,
    );
  }
};

const removeUser = (socketId) => {
  for (const [userId, sId] of userSocketMap.entries()) {
    if (sId === socketId) {
      userSocketMap.delete(userId);
      logger.info(
        `User ${userId} disconnected. Total users: ${userSocketMap.size}`,
      );
      break;
    }
  }
};

/**
 * Initializes Socket.IO and sets up event listeners for real-time communication.
 * @param {import('socket.io').Server} io - The Socket.IO server instance.
 */
const initializeSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    logger.info(`🔌 New client connected: ${socket.id}`);

    // Listen for user connecting with their ID
    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
    });

    // --- Existing chat logic ---
    socket.on("joinRoom", (room) => {
      socket.join(room);
      logger.info(`Client ${socket.id} joined room: ${room}`);
    });

    socket.on("sendMessage", ({ room, message, sender }) => {
      const messageData = { message, sender, timestamp: new Date() };
      io.to(room).emit("receiveMessage", messageData);
      logger.info(`Message sent in room ${room} by ${sender}: "${message}"`);
    });
    // --- End of existing chat logic ---

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
      removeUser(socket.id);
    });
  });
};

/**
 * Sends a notification to a specific user if they are connected.
 * @param {string | import('mongoose').Types.ObjectId} userId - The ID of the user to notify.
 * @param {object} notification - The notification object to send.
 */
const sendNotificationToUser = (userId, notification) => {
  if (ioInstance && userId) {
    const socketId = userSocketMap.get(userId.toString());
    if (socketId) {
      ioInstance.to(socketId).emit("new_notification", notification);
      logger.info(`Sent notification to user ${userId} on socket ${socketId}`);
    } else {
      logger.warn(
        `Could not find active socket for user ${userId} to send notification.`,
      );
    }
  }
};

module.exports = {
  initializeSocket,
  sendNotificationToUser,
};
