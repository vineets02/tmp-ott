const reviewModel = require("../models/reviewModel");
const movieModel = require("../models/movieModel");

// Create Review
module.exports.createReviewController = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;
    const userId = req.user._id;

    if (!movieId || !rating || !comment) {
      return res.status(400).send({ success: false, message: "Please provide all fields" });
    }

    // Check if movie exists
    const movie = await movieModel.findById(movieId);
    if (!movie) {
      return res.status(404).send({ success: false, message: "Movie not found" });
    }

    // Check if user already reviewed
    const existingReview = await reviewModel.findOne({ user: userId, movie: movieId });
    if (existingReview) {
      return res.status(400).send({ success: false, message: "You have already reviewed this movie" });
    }

    const review = await new reviewModel({
      user: userId,
      movie: movieId,
      rating,
      comment,
    }).save();

    // Optionally update movie average rating here or calculate on the fly
    
    res.status(201).send({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while creating review",
      error: error.message,
    });
  }
};

// Get Movie Reviews
module.exports.getMovieReviewsController = async (req, res) => {
  try {
    const { movieId } = req.params;
    const reviews = await reviewModel.find({ movie: movieId, isActive: true })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    // Calculate average
    const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.status(200).send({
      success: true,
      reviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching reviews", error });
  }
};

// Delete Review (Admin or Owner)
module.exports.deleteReviewController = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await reviewModel.findById(id);
    
    if (!review) return res.status(404).send({ success: false, message: "Review not found" });

    // Check permissions
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 1) {
      return res.status(401).send({ success: false, message: "Unauthorized" });
    }

    await reviewModel.findByIdAndDelete(id);
    res.status(200).send({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error deleting review", error });
  }
};
