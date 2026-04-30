const Notification = require("../models/notificationModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user.id }).sort(
    "-createdAt",
  );

  const unreadCount = await Notification.countDocuments({
    user: req.user.id,
    read: false,
  });

  res.status(200).json({
    success: true,
    results: notifications.length,
    unreadCount,
    data: {
      notifications,
    },
  });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!notification) {
    return next(
      new AppError("No notification found with that ID for this user.", 404),
    );
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    success: true,
    data: {
      notification,
    },
  });
});

exports.markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { read: true },
  );

  res
    .status(200)
    .json({ success: true, message: "All notifications marked as read." });
});
