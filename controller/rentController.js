const Razorpay = require("razorpay");
const crypto = require("crypto");
const rentalModel = require("../models/rentalModel");
const movieModel = require("../models/movieModel");

const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_DiJk5T6Kc6ampr";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "s3VtfMV2sX5KxN78S7QFvIvG";

// POST /api/v1/rent/create-order
// Creates a Razorpay order for renting a specific movie
const createRentalOrder = async (req, res) => {
  try {
    const { movieId } = req.body;
    const movie = await movieModel.findById(movieId).select("title rentalPrice");

    if (!movie) return res.status(404).json({ success: false, message: "Movie not found" });
    if (!movie.rentalPrice || movie.rentalPrice <= 0) {
      return res.status(400).json({ success: false, message: "This movie is not available for rental" });
    }

    const instance = new Razorpay({ key_id, key_secret });
    const order = await instance.orders.create({
      amount: movie.rentalPrice * 100, // paise
      currency: "INR",
    });

    res.json({ success: true, order, movie: { title: movie.title, price: movie.rentalPrice } });
  } catch (err) {
    console.error("Error creating rental order:", err);
    res.status(500).json({ success: false, message: "Failed to create rental order" });
  }
};

// POST /api/v1/rent/verify
// Verifies payment and grants 48-hour rental access
const verifyRentalPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, movieId, amount } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // Grant 48 hour access
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const rental = await rentalModel.create({
      user: req.user._id,
      movie: movieId,
      payment: {
        razorpay_order_id,
        razorpay_payment_id,
        amount,
        success: true,
      },
      expiresAt,
    });

    res.json({
      success: true,
      message: "Rental activated! You have 48 hours to watch.",
      rental,
    });
  } catch (err) {
    console.error("Error verifying rental:", err);
    res.status(500).json({ success: false, message: "Failed to activate rental" });
  }
};

// GET /api/v1/rent/check/:movieId
// Checks if logged-in user has an active (non-expired) rental for a movie
const checkRentalAccess = async (req, res) => {
  try {
    const rental = await rentalModel.findOne({
      user: req.user._id,
      movie: req.params.movieId,
      expiresAt: { $gt: new Date() },
      "payment.success": true,
    });

    if (rental) {
      return res.json({ success: true, hasAccess: true, expiresAt: rental.expiresAt });
    }
    res.json({ success: true, hasAccess: false });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error checking rental" });
  }
};

// GET /api/v1/rent/my-rentals
// Returns all active rentals for the logged-in user
const getMyRentals = async (req, res) => {
  try {
    const rentals = await rentalModel
      .find({ user: req.user._id, "payment.success": true })
      .populate("movie", "title slug poster rentalPrice")
      .sort({ createdAt: -1 });

    res.json({ success: true, rentals });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching rentals" });
  }
};

module.exports = { createRentalOrder, verifyRentalPayment, checkRentalAccess, getMyRentals };
