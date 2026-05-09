const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.ObjectId,
      ref: "users",
      required: true,
    },
    movie: {
      type: mongoose.ObjectId,
      ref: "Movies",
      required: true,
    },
    payment: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      amount: Number,
      success: { type: Boolean, default: false },
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rental", rentalSchema);
