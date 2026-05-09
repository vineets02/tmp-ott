const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema(
  {
    movies: [
      {
        type: mongoose.ObjectId,
        ref: "Movies",
      },
    ],
    payment: {},
    buyer: {
      type: mongoose.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      default: "Not Process",
      enum: ["Not Process", "Processing", "Shipped", "deliverd", "cancel", "Success", "Failed"],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Order", orderSchema)
