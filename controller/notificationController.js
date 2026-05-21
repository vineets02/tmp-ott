const notificationModel = require("../models/notificationModel.js");

// Fetch notifications for the logged-in user
const getNotificationsController = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Fetch user-specific notifications + global notifications
    const notifications = await notificationModel
      .find({
        $or: [{ user: userId }, { user: null }],
      })
      .sort({ createdAt: -1 })
      .limit(30);

    // Calculate unread count (where userId is NOT in readBy)
    const unreadCount = notifications.filter(
      (n) => !n.readBy.includes(userId)
    ).length;

    res.status(200).send({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching notifications",
    });
  }
};

// Mark specific notifications or all as read
const markAsReadController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.body;

    if (notificationId) {
      // Mark a single notification as read
      await notificationModel.findByIdAndUpdate(notificationId, {
        $addToSet: { readBy: userId },
      });
    } else {
      // Mark all currently fetched notifications as read
      // We'll update any where user is null or user == userId
      await notificationModel.updateMany(
        { $or: [{ user: userId }, { user: null }] },
        { $addToSet: { readBy: userId } }
      );
    }

    res.status(200).send({
      success: true,
      message: "Marked as read",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error marking notifications as read",
    });
  }
};

// Admin/System endpoint to create a notification
const createNotificationController = async (req, res) => {
  try {
    const { user, title, message, type, link } = req.body;
    
    const newNotification = await new notificationModel({
      user: user || null,
      title,
      message,
      type: type || "system",
      link: link || "",
    }).save();

    res.status(201).send({
      success: true,
      message: "Notification created",
      notification: newNotification,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error creating notification",
    });
  }
};

module.exports = {
  getNotificationsController,
  markAsReadController,
  createNotificationController,
};
