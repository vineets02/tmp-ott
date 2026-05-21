const express = require("express")
const compression = require("compression")
const helmet = require("helmet")
const http = require("http")
const { Server } = require("socket.io")
const colors = require("colors")
const dotenv = require("dotenv")
//config env
dotenv.config()
const connectDB = require("./config/db")
const morgan = require("morgan")
const authRoutes = require("./routes/authRoute")
const categoryRoutes = require("./routes/categoryRoutes")
const contentTypeRoutes = require("./routes/contentTypeRoutes")
const notificationRoutes = require("./routes/notificationRoute")
const advisoryRoutes = require("./routes/advisoryRoutes")
const movieRoutes = require("./routes/movieRoutes")
const paymentController = require("./controller/paymentController")
const settingsRoutes = require("./routes/settingsRoutes")
const rentRoutes = require("./routes/rentRoutes")
const analyticsRoutes = require("./routes/analyticsRoutes")
const couponRoutes = require("./routes/couponRoutes")
const homepageRoutes = require("./routes/homepageRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const { requireSignIn, isAdmin } = require("./middlewares/authMiddleware");
const fs = require("fs");
const path = require("path");
// const orderRoute = require("./routes/orderRoute")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)


const YOUR_DOMAIN = process.env.CLIENT_URL || "http://localhost:3000"
const cors = require("cors")
const movieModel = require("./models/movieModel")

const getMovieData = async () => {
  try {
    const movies = await movieModel.find()
    // Map the movie data to line items
    const lineItems = movies.map((movie) => ({
      price: movie.price,
      quantity: 1,
    }))

    return lineItems
  } catch (error) {
    console.error("Error retrieving movie data:", error)
    return []
  }
}
//database config
connectDB()

//rest object
const { seedRoles } = require("./controller/roleController");
seedRoles();

const app = express()

//middleware
app.use(compression()) // Compress all routes (GZIP)
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allow loading media from Cloudflare R2
    crossOriginEmbedderPolicy: false,
  })
) // Secure HTTP headers
app.use(express.json())
app.use(morgan("dev"))
app.use(express.urlencoded({ extended: false }))
app.use(express.static("public"))

//routes
app.use(cors())
const uploadBase = path.join(process.cwd(), "upload");
const uploadTmp  = path.join(uploadBase, "tmp");
fs.mkdirSync(uploadTmp, { recursive: true });
app.use("/upload", express.static(uploadBase));
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/category", categoryRoutes)
app.use("/api/v1/content-type", contentTypeRoutes)
app.use("/api/v1/content-advisory", advisoryRoutes)
app.use("/api/v1/movie", movieRoutes)
app.use("/api/v1/settings", settingsRoutes)
app.use("/api/v1/rent", rentRoutes)
app.use("/api/v1/admin/analytics", analyticsRoutes)
app.use("/api/v1/coupons", couponRoutes)
app.use("/api/v1/homepage", homepageRoutes)
app.use("/api/v1/review", reviewRoutes)
app.use("/api/v1/notifications", notificationRoutes)
// app.use("/api/v1/orders", orderRoute)
// app.use("/api/v1/users", getAllUsersController)

//rest api
app.get("/", (req, res) => {
  res.send({
    message: "welcome to tmpott app",
  })
})

app.post("/api/v1/payment/orders", requireSignIn, paymentController.orders)
app.post("/api/v1/payment/verify", requireSignIn, paymentController.verify)
app.post("/api/v1/payment/verify-subscription", requireSignIn, paymentController.verifySubscription)
app.post("/create-checkout-session", async (req, res) => {
  try {
    // Retrieve movie data from the database
    const lineItems = await getMovieData()

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "subscription",
      success_url: `${YOUR_DOMAIN}?success=true`,
      cancel_url: `${YOUR_DOMAIN}?canceled=true`,
    })

    res.redirect(303, session.url)
  } catch (error) {
    console.error("Error creating checkout session:", error)
    res.status(500).json({ error: "Failed to create checkout session" })
  }
})

// app.post("/create-portal-session", async (req, res) => {
//   // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
//   // Typically this is stored alongside the authenticated user in your database.
//   const { session_id } = req.body
//   const checkoutSession = await stripe.checkout.sessions.retrieve(session_id)

//   // This is the url to which the customer will be redirected when they are done
//   // managing their billing with the portal.
//   const returnUrl = YOUR_DOMAIN

//   const portalSession = await stripe.billingPortal.sessions.create({
//     customer: checkoutSession.customer,
//     return_url: returnUrl,
//   })

//   res.redirect(303, portalSession.url)
// })

// app.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   (request, response) => {
//     let event = request.body
//     // Replace this endpoint secret with your endpoint's unique secret
//     // If you are testing with the CLI, find the secret by running 'stripe listen'
//     // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
//     // at https://dashboard.stripe.com/webhooks
//     const endpointSecret = "whsec_12345"
//     // Only verify the event if you have an endpoint secret defined.
//     // Otherwise use the basic event deserialized with JSON.parse
//     if (endpointSecret) {
//       // Get the signature sent by Stripe
//       const signature = request.headers["stripe-signature"]
//       try {
//         event = stripe.webhooks.constructEvent(
//           request.body,
//           signature,
//           endpointSecret
//         )
//       } catch (err) {
//         console.log(`⚠️  Webhook signature verification failed.`, err.message)
//         return response.sendStatus(400)
//       }
//     }
//     let subscription
//     let status
//     // Handle the event
//     switch (event.type) {
//       case "customer.subscription.trial_will_end":
//         subscription = event.data.object
//         status = subscription.status
//         console.log(`Subscription status is ${status}.`)
//         // Then define and call a method to handle the subscription trial ending.
//         // handleSubscriptionTrialEnding(subscription);
//         break
//       case "customer.subscription.deleted":
//         subscription = event.data.object
//         status = subscription.status
//         console.log(`Subscription status is ${status}.`)
//         // Then define and call a method to handle the subscription deleted.
//         // handleSubscriptionDeleted(subscriptionDeleted);
//         break
//       case "customer.subscription.created":
//         subscription = event.data.object
//         status = subscription.status
//         console.log(`Subscription status is ${status}.`)
//         // Then define and call a method to handle the subscription created.
//         // handleSubscriptionCreated(subscription);
//         break
//       case "customer.subscription.updated":
//         subscription = event.data.object
//         status = subscription.status
//         console.log(`Subscription status is ${status}.`)
//         // Then define and call a method to handle the subscription update.
//         // handleSubscriptionUpdated(subscription);
//         break
//       default:
//         // Unexpected event type
//         console.log(`Unhandled event type ${event.type}.`)
//     }
//     // Return a 200 response to acknowledge receipt of the event
//     response.send()
//   }
// )

// Create HTTP Server for Socket.io
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Watch Party Socket Logic
io.on("connection", (socket) => {
  socket.on("join_room", (roomId) => {
    socket.join(roomId)
    console.log(`User ${socket.id} joined room ${roomId}`)
  })

  socket.on("send_message", (data) => {
    io.to(data.roomId).emit("receive_message", data)
  })

  socket.on("sync_play", (data) => {
    socket.to(data.roomId).emit("on_sync_play", data)
  })

  socket.on("sync_pause", (data) => {
    socket.to(data.roomId).emit("on_sync_pause", data)
  })

  socket.on("sync_seek", (data) => {
    socket.to(data.roomId).emit("on_sync_seek", data)
  })

  socket.on("disconnect", () => {
    // console.log("User disconnected")
  })
})

const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
  console.log(`server Running on ${PORT}`.bgYellow.white)
})

// Self-pinging to prevent Render sleep (Method 3)
const https = require("https");
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || "https://tmp-ott.onrender.com";
setInterval(() => {
  https.get(RENDER_URL, (res) => {
    if (res.statusCode === 200) {
      console.log("Self-ping successful: Service kept awake");
    }
  }).on("error", (err) => {
    console.log("Self-ping failed:", err.message);
  });
}, 600000); // 10 minutes

