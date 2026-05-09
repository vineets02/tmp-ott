const express = require("express");
const router = express.Router();
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const { getAnalyticsOverview } = require("../controller/analyticsController");

router.get("/overview", requireSignIn, isAdmin, getAnalyticsOverview);

module.exports = router;
