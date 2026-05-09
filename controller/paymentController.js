// const { response } = require("express")
const crypto = require("crypto")
const Razorpay = require("razorpay")

const key_secret = process.env.RAZORPAY_KEY_SECRET || "s3VtfMV2sX5KxN78S7QFvIvG";

module.exports.orders = (req, res) => {
  let instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_DiJk5T6Kc6ampr",
    key_secret: key_secret,
  });

  var options = {
    amount: req.body.amount * 100, // amount in the smallest currency unit
    currency: "INR",
    // receipt: "order_rcptid_11",
  }
  instance.orders.create(options, function (err, order) {
    if (err) {
      return res.send({ code: 500, message: "server err" })
    }
    return res.send({ code: 200, message: "order created", data: order })
    // console.log(order)
  })
  //   res.send({ orders })
}

module.exports.verify = (req, res) => {
  let body =
    req.body.response.razorpay_order_id +
    "|" +
    req.body.response.razorpay_payment_id

  let expectedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature === req.body.response.razorpay_signature) {
    res.send({ code: 200, message: "Signature valid" })
  } else {
    res.send({ code: 500, message: "Signature notvalid" })
  }
}

module.exports.verifySubscription = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body.response;
    const { userId } = req.body;

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    let expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const userModel = require("../models/userModel");
      const couponModel = require("../models/couponModel");
      const { couponId } = req.body;
      
      const userId = req.user._id; 
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now

      // If coupon used, increment usage count
      if (couponId) {
        await couponModel.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
      }

      await userModel.findByIdAndUpdate(userId, {
        subscription: true,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: expiryDate,
      });

      res.send({ 
        code: 200, 
        message: "Subscription activated for 30 days",
        subscriptionEndDate: expiryDate 
      });
    } else {
      res.send({ code: 500, message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).send({ code: 500, message: "Error activating subscription", error });
  }
}
