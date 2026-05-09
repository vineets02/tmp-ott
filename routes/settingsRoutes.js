const express = require("express");
const router = express.Router();
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const { getSettingsController, updateSettingsController, storageStatsController } = require("../controller/settingsController");

// Public
router.get("/get-settings", getSettingsController);

// Admin only
router.put("/update-settings", requireSignIn, isAdmin, updateSettingsController);
router.get("/storage-stats", requireSignIn, isAdmin, storageStatsController);

module.exports = router;
