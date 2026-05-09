const couponModel = require("../models/couponModel");

// Create Coupon
module.exports.createCouponController = async (req, res) => {
  try {
    const { code, discountType, discountValue, minPurchase, expiryDate, usageLimit } = req.body;
    if (!code || !discountValue || !expiryDate) {
      return res.status(400).send({ success: false, message: "Code, Value and Expiry are required" });
    }

    const existing = await couponModel.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).send({ success: false, message: "Coupon code already exists" });
    }

    const coupon = await new couponModel({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minPurchase,
      expiryDate,
      usageLimit
    }).save();

    res.status(201).send({
      success: true,
      message: "Coupon Created Successfully",
      coupon,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error creating coupon", error });
  }
};

// Get All Coupons (Admin)
module.exports.getAllCouponsController = async (req, res) => {
  try {
    const coupons = await couponModel.find({}).sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      coupons,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error fetching coupons", error });
  }
};

// Toggle Coupon Status
module.exports.toggleCouponController = async (req, res) => {
  try {
    const coupon = await couponModel.findById(req.params.id);
    if (!coupon) return res.status(404).send({ success: false, message: "Coupon not found" });
    
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    
    res.status(200).send({
      success: true,
      message: `Coupon ${coupon.isActive ? "Activated" : "Deactivated"}`,
      coupon,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error updating coupon", error });
  }
};

// Delete Coupon
module.exports.deleteCouponController = async (req, res) => {
  try {
    await couponModel.findByIdAndDelete(req.params.id);
    res.status(200).send({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error deleting coupon", error });
  }
};

// Validate Coupon (Public/User)
module.exports.validateCouponController = async (req, res) => {
  try {
    const { code, amount } = req.body;
    const coupon = await couponModel.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).send({ success: false, message: "Invalid or expired coupon code" });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).send({ success: false, message: "Coupon has expired" });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).send({ success: false, message: "Coupon usage limit reached" });
    }

    if (amount < coupon.minPurchase) {
      return res.status(400).send({ 
        success: false, 
        message: `Minimum purchase of ₹${coupon.minPurchase} required for this coupon` 
      });
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (amount * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    res.status(200).send({
      success: true,
      message: "Coupon Applied!",
      discount,
      finalAmount: amount - discount,
      couponId: coupon._id
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error validating coupon", error });
  }
};
