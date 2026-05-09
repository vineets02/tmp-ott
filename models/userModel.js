const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      default: 0,
    },
    dynamicRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    subscription: {
      type: Boolean,
      default: false,
    },
    subscriptionStartDate: {
      type: Date,
    },
    subscriptionEndDate: {
      type: Date,
    },
    razorpay_customer_id: {
      type: String,
    },
    watchlist: [
      {
        type: mongoose.ObjectId,
        ref: "Movies",
      },
    ],
    history: [
      {
        movie: { type: mongoose.ObjectId, ref: "Movies" },
        watchedAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 }, // in seconds
      },
    ],
    profiles: [
      {
        name: { type: String },
        avatar: { type: String },
        isChild: { type: Boolean, default: false },
        watchlist: [
          {
            type: mongoose.ObjectId,
            ref: "Movies",
          },
        ],
        history: [
          {
            movie: { type: mongoose.ObjectId, ref: "Movies" },
            watchedAt: { type: Date, default: Date.now },
            progress: { type: Number, default: 0 },
          },
        ],
      },
    ],
    isBanned: {
      type: Boolean,
      default: false,
    },
    version: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model("users", userSchema)
