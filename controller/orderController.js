// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

// const { v4: uuidv4 } = require("uuid")

// exports.createOrderController = async (req, res) => {
//   const { token, subTotal, currentUser, cartItem } = req.body
//   try {
//     const customer = await stripe.customers.create({
//       email: token.email,
//       source: token.id,
//     })
//     const payment = await stripe.charges.create(
//       {
//         amount: subTotal * 100,
//         currency: "usd",
//         receipt_email: token.email,
//       },
//       {
//         idempotencyKey: uuidv4(),
//       }
//     )
//     if (payment) {
//       res.send("Payment success")
//     } else {
//       res.send("Payment failed")
//     }
//   } catch (error) {
//     res.status(400).json({
//       message: "Something went wrong",
//     })
//   }
// }
// // With these changes, the error in the create route controller should be resolved.
