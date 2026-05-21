const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware.js");
const {
  getNotificationsController,
  markAsReadController,
  createNotificationController,
} = require("../controller/notificationController.js");

const router = express.Router();

// User Routes
router.get("/user", requireSignIn, getNotificationsController);
router.put("/mark-read", requireSignIn, markAsReadController);

// Admin Routes
router.post("/create", requireSignIn, isAdmin, createNotificationController);

module.exports = router;
