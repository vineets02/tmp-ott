const campaignPlannerModel = require("../models/campaignPlannerModel");
const movieModel = require("../models/movieModel");

// Get or initialize a marketing plan for a movie
const getMarketingPlan = async (req, res) => {
  try {
    const { movieId } = req.params;
    const movie = await movieModel.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    let plan = await campaignPlannerModel.findOne({ movie: movieId });

    if (!plan) {
      const releaseDate = movie.releaseDate || new Date();
      
      // Seed default milestones relative to release date
      const defaultMilestones = [
        {
          phase: "teaser",
          task: "Upload Teaser Video & schedule Spotlight Banner on Homepage",
          scheduledDate: new Date(new Date(releaseDate).getTime() - 3 * 24 * 60 * 60 * 1000), // T-3 days
          status: "pending"
        },
        {
          phase: "teaser",
          task: "Send 'Coming Soon' Push Notification Alert to all active users",
          scheduledDate: new Date(new Date(releaseDate).getTime() - 1 * 24 * 60 * 60 * 1000), // T-1 day
          status: "pending"
        },
        {
          phase: "launch",
          task: "Launch Day Blast: Send System Notification with watch link",
          scheduledDate: new Date(releaseDate),
          status: "pending"
        },
        {
          phase: "launch",
          task: "Generate Launch Promotion Promo Code (e.g. coupon code)",
          scheduledDate: new Date(releaseDate),
          status: "pending"
        },
        {
          phase: "quotes",
          task: "Generate & share AI Dialogue Post 1:1 on Instagram feed",
          scheduledDate: new Date(new Date(releaseDate).getTime() + 1 * 24 * 60 * 60 * 1000), // T+1 day
          status: "pending"
        },
        {
          phase: "quotes",
          task: "Post Instagram Story 9:16 showcasing key dialogue",
          scheduledDate: new Date(new Date(releaseDate).getTime() + 2 * 24 * 60 * 60 * 1000), // T+2 days
          status: "pending"
        },
        {
          phase: "reviews",
          task: "Share viewer testimonial & rating cards on social channels",
          scheduledDate: new Date(new Date(releaseDate).getTime() + 4 * 24 * 60 * 60 * 1000), // T+4 days
          status: "pending"
        }
      ];

      plan = new campaignPlannerModel({
        movie: movieId,
        milestones: defaultMilestones,
        generatedAssets: []
      });

      await plan.save();
    }

    res.status(200).json({ success: true, plan });
  } catch (error) {
    console.error("Error getting marketing plan:", error);
    res.status(500).json({ success: false, message: "Error loading marketing planner", error: error.message });
  }
};

// Toggle a milestone checklist item status
const updateMilestoneStatus = async (req, res) => {
  try {
    const { planId, milestoneId } = req.body;
    const plan = await campaignPlannerModel.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    const milestone = plan.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: "Milestone task not found" });
    }

    milestone.status = milestone.status === "completed" ? "pending" : "completed";
    await plan.save();

    res.status(200).json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status", error: error.message });
  }
};

// Generate dialogues/quotes templates for movie
const suggestDialogue = async (req, res) => {
  try {
    const { movieId } = req.params;
    const movie = await movieModel.findById(movieId).populate("category");
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    const genre = movie.category?.name || "Premium Movie";
    
    // Catchy taglines and dialogue templates
    const suggestions = [
      `"Every choice defines your legacy. Witness the ultimate saga."`,
      `"In this game, there are no survivors. Only legends."`,
      `"Some stories are written in history. Ours is written in blood."`,
      `"They wanted a hero. They got a force of nature."`,
      `"The truth will be streaming. Are you ready for the thrill?"`,
      `"Experience ${movie.title} — Directed by ${movie.director}. Out Now!"`,
      `"From the depth of mysteries comes the year's greatest ${genre}."`
    ];

    res.status(200).json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generating quotes", error: error.message });
  }
};

// Save generated creative PNG/Base64 to DB assets log
const saveCreativeAsset = async (req, res) => {
  try {
    const { movieId, imageUrl, type } = req.body;
    const plan = await campaignPlannerModel.findOne({ movie: movieId });
    if (!plan) {
      return res.status(404).json({ success: false, message: "Marketing plan not active for this movie" });
    }

    plan.generatedAssets.push({ imageUrl, type });
    await plan.save();

    res.status(200).json({ success: true, assets: plan.generatedAssets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving asset", error: error.message });
  }
};

module.exports = {
  getMarketingPlan,
  updateMilestoneStatus,
  suggestDialogue,
  saveCreativeAsset
};
