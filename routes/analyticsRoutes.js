const express = require("express");
const router = express.Router();
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const { getAnalyticsOverview, getMovieWatchInsights } = require("../controller/analyticsController");

router.get("/overview", requireSignIn, isAdmin, getAnalyticsOverview);
router.get("/movie/:movieId", requireSignIn, isAdmin, getMovieWatchInsights);

module.exports = router;
