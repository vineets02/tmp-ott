const mongoose = require("mongoose");

const homepageSchema = new mongoose.Schema(
  {
    // Array of Movie IDs for the top hero banner (max 5)
    heroMovies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movies",
      },
    ],
    // Array of Category IDs to be pinned in a specific order
    pinnedCategories: [
      {
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    // Promotional banners between rows
    promoBanners: [
      {
        image: { type: String }, // R2 URL or local path
        link: { type: String }, // URL to redirect to
        position: { type: Number }, // After which row it should appear
        isActive: { type: Boolean, default: true },
      },
    ],
    // Settings for auto-pull vs manual
    isManualHero: {
      type: Boolean,
      default: false,
    },
    isManualCategories: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Homepage", homepageSchema);
