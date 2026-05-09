const express = require("express");
const router = express.Router();
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const {
  createCouponController,
  getAllCouponsController,
  toggleCouponController,
  deleteCouponController,
  validateCouponController
} = require("../controller/couponController");

// Admin
router.post("/create", requireSignIn, isAdmin, createCouponController);
router.get("/all", requireSignIn, isAdmin, getAllCouponsController);
router.put("/toggle/:id", requireSignIn, isAdmin, toggleCouponController);
router.delete("/delete/:id", requireSignIn, isAdmin, deleteCouponController);

// User
router.post("/validate", requireSignIn, validateCouponController);

module.exports = router;
