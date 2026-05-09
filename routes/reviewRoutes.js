const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const {
  createReviewController,
  getMovieReviewsController,
  deleteReviewController
} = require("../controller/reviewController");

const router = express.Router();

// Create Review
router.post("/create", requireSignIn, createReviewController);

// Get Reviews for Movie (Public)
router.get("/movie/:movieId", getMovieReviewsController);

// Delete Review
router.delete("/delete/:id", requireSignIn, deleteReviewController);

module.exports = router;
