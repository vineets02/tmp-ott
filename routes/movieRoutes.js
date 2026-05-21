// routes/movieRoutes.js
const express = require("express");
const router = express.Router();

const path = require("path");
const formidable = require("express-formidable");
const { requireSignIn, isAdmin, canManageContent } = require("../middlewares/authMiddleware.js");
const {
  createMovieController,
  deleteMovieController,
  getMovieController,
  getSingleMovieController,
  moviePosterController,
  movieSearchController,
  movieTrailerController,
  movieVideoController,
  relatedMovieController,
  updateMovieController,
  movieCategoryController,
  movieSubtitlesController,
  getUploadUrlController,
  getForYouController,
} = require("../controller/movieController.js");

// Put temp uploads on the same drive as final destination
const uploadBase = path.join(process.cwd(), "upload");    // e.g., E:\tmpott\upload
const uploadTmp  = path.join(uploadBase, "tmp");

// Get Upload URL for R2 (Admin only)
router.post("/get-upload-url", requireSignIn, canManageContent, getUploadUrlController);

// Create movie (protected, admin)
router.post(
  "/create-movie",
  requireSignIn,
  canManageContent,
  formidable({
    uploadDir: uploadTmp,
    keepExtensions: true,
    multiples: true,
    maxFileSize: 20 * 1024 * 1024 * 1024, // 20 GB
    allowEmptyFiles: false,
  }),
  createMovieController
);

// Update movie (protected, admin)
router.put(
  "/update-movie/:pid",
  requireSignIn,
  canManageContent,
  formidable({
    uploadDir: uploadTmp,
    keepExtensions: true,
    multiples: true,
    maxFileSize: 20 * 1024 * 1024 * 1024, // 20 GB
    allowEmptyFiles: false,
  }),
  updateMovieController
);

// Public routes
router.get("/get-movie", getMovieController);
router.get("/get-movie/:slug", getSingleMovieController);
router.get("/for-you", requireSignIn, getForYouController);
router.get("/movie-photo/:pid", moviePosterController);
router.get("/movie-video/:pid", movieVideoController);
router.get("/movie-trailer/:pid", movieTrailerController);
router.get("/search/:keyword", movieSearchController);
router.get("/movie-category/:slug", movieCategoryController);
router.get("/related-product/:pid/:cid", relatedMovieController);
router.delete("/delete-movie/:pid", requireSignIn, canManageContent, deleteMovieController);

router.get("/movie-subtitles/:pid", movieSubtitlesController);

module.exports = router;
