const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.ObjectId,
      ref: "users",
      default: null, // null means it's a global notification for everyone
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["new_drop", "rental_alert", "party_invite", "system"],
      default: "system",
    },
    link: {
      type: String, // e.g. "/movie/123"
      default: "",
    },
    readBy: [
      {
        type: mongoose.ObjectId,
        ref: "users",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("notifications", notificationSchema);
