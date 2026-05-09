const mongoose = require("mongoose")

const contentTypeSchema = new mongoose.Schema({
  contenttype: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    lowercase: true,
  },
})

module.exports = mongoose.model("ContentType", contentTypeSchema)
