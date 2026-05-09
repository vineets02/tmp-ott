const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    lowercase: true,
  },
  movie: {
    type: mongoose.ObjectId,
    ref: "Movies",
    // required: true,
  },
})

module.exports = mongoose.model("Category", categorySchema)
