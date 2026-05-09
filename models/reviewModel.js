const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movies",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent multiple reviews from the same user on the same movie
reviewSchema.index({ user: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
