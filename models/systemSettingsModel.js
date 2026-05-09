const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema({
  paywallEnabled: {
    type: Boolean,
    default: true,
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  siteName: {
    type: String,
    default: "Tortoise Motion Pictures",
  },
  featuredMovies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movies"
  }],
  pinnedCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }],
  subscriptionPrice: {
    type: Number,
    default: 499
  },
  currency: {
    type: String,
    default: "INR"
  }
}, { timestamps: true });

module.exports = mongoose.model("SystemSettings", systemSettingsSchema);
