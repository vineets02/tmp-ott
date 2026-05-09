const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const {
  getHomepageSettings,
  updateHeroMovies,
  updatePinnedCategories,
  updatePromoBanners,
} = require("../controller/homepageController");

const router = express.Router();

// GET settings (Public)
router.get("/get-settings", getHomepageSettings);

// ADMIN ONLY ROUTES
router.put("/update-hero", requireSignIn, isAdmin, updateHeroMovies);
router.put("/update-pinned", requireSignIn, isAdmin, updatePinnedCategories);
router.put("/update-promo", requireSignIn, isAdmin, updatePromoBanners);

module.exports = router;
