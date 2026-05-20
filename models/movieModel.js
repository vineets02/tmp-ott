const mongoose = require("mongoose")

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    director: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: true,
    },
    contenttype: {
      type: mongoose.ObjectId,
      ref: "ContentType",
      required: true,
    },
    price: {
      type: Number,
      default: 199,
    },
    rentalPrice: {
      type: Number,
      default: 0, // 0 means not available for rental
    },
    poster: {
      type: String,
      required: true,
    },
    trailer: {
      type: String,
      required: true,
    },
    video: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    cast: [String],
    subtitles: {
      type: String,
    },
    releaseDate: {
      type: Date,
    },
    isPremium: {
      type: Boolean,
      default: true,
    },
    isKids: {
      type: Boolean,
      default: false,
    },
    introStart: {
      type: Number,
      default: 0,   // seconds — 0 means no intro configured
    },
    introEnd: {
      type: Number,
      default: 0,   // seconds
    },
  },
  { timestamps: true }
)

// Add Database Indexes for Production Optimization
movieSchema.index({ slug: 1 }, { unique: true }); // Fast routing by slug
movieSchema.index({ title: 'text', description: 'text' }, { language_override: 'dummy_language_override' }); // Fast search queries
movieSchema.index({ category: 1 }); // Fast category filtering
movieSchema.index({ isKids: 1 }); // Fast kids mode filtering

module.exports = mongoose.model("Movies", movieSchema)
