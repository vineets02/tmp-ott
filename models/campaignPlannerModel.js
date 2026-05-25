const mongoose = require("mongoose");

const campaignPlannerSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movies",
      required: true,
      unique: true,
    },
    milestones: [
      {
        phase: {
          type: String,
          enum: ["teaser", "launch", "quotes", "reviews"],
          required: true,
        },
        task: {
          type: String,
          required: true,
        },
        scheduledDate: {
          type: Date,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "completed"],
          default: "pending",
        },
      },
    ],
    generatedAssets: [
      {
        imageUrl: { type: String, required: true }, // R2 image URL or Base64 string
        type: { type: String, enum: ["post_1_1", "story_9_16"], default: "post_1_1" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CampaignPlanner", campaignPlannerSchema);
