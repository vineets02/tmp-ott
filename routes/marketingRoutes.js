const express = require("express");
const router = express.Router();
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const {
  getMarketingPlan,
  updateMilestoneStatus,
  suggestDialogue,
  saveCreativeAsset,
  generateAIPoster
} = require("../controller/marketingController");

router.get("/plan/:movieId", requireSignIn, isAdmin, getMarketingPlan);
router.put("/milestone", requireSignIn, isAdmin, updateMilestoneStatus);
router.get("/suggest-dialogue/:movieId", requireSignIn, isAdmin, suggestDialogue);
router.post("/save-creative", requireSignIn, isAdmin, saveCreativeAsset);
router.post("/ai-poster", requireSignIn, isAdmin, generateAIPoster);

module.exports = router;
