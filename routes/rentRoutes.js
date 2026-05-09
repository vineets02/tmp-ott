const express = require("express");
const router = express.Router();
const { requireSignIn } = require("../middlewares/authMiddleware");
const { createRentalOrder, verifyRentalPayment, checkRentalAccess, getMyRentals } = require("../controller/rentController");

router.post("/create-order", requireSignIn, createRentalOrder);
router.post("/verify", requireSignIn, verifyRentalPayment);
router.get("/check/:movieId", requireSignIn, checkRentalAccess);
router.get("/my-rentals", requireSignIn, getMyRentals);

module.exports = router;
