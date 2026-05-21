const express = require("express")
const {
  registerController,
  forgotPasswordController,
  testController,
  loginController,
  getAllUsersController,
  updateSubscriptionController,
  getSingleUser,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
  changePasswordController,
  banUserController,
  getUserDetailController,
} = require("../controller/authController.js")
// const { loginController } = require("../controller/authController.js");
const { isAdmin, requireSignIn } = require("../middlewares/authMiddleware.js")
//router object

const router = express.Router()

//routing
//REGISTER || METHOD POST
router.post("/register", registerController)

//LOGIN || POST
router.post("/login", loginController)

//FORGOT PASSWORD || POST
router.post("/forgot-password", forgotPasswordController)

router.post("/change-password", requireSignIn, changePasswordController)
router.get("/users", requireSignIn, isAdmin, getAllUsersController)

router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true })
})

router.put("/:_id/subscription", requireSignIn, updateSubscriptionController)

// //test routes
router.get("/test", requireSignIn, isAdmin, testController)
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true })
})

router.get("/users", requireSignIn, isAdmin)
router.get("/users/:id", requireSignIn, isAdmin, getSingleUser)

router.get("/orders", requireSignIn, getOrdersController)
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController)
router.get("/order-status", requireSignIn, isAdmin, orderStatusController)

// Watchlist & History
router.post("/watchlist", requireSignIn, require("../controller/authController.js").addToWatchlistController)
router.get("/watchlist", requireSignIn, require("../controller/authController.js").getWatchlistController)
router.delete("/watchlist/:movieId", requireSignIn, require("../controller/authController.js").removeFromWatchlistController)
router.post("/history", requireSignIn, require("../controller/authController.js").updateHistoryController)
router.get("/history", requireSignIn, require("../controller/authController.js").getHistoryController)

// Profiles
router.get("/profiles", requireSignIn, require("../controller/authController.js").getProfilesController)
router.post("/profiles", requireSignIn, require("../controller/authController.js").addProfileController)
router.delete("/profiles/:profileId", requireSignIn, require("../controller/authController.js").deleteProfileController)

// Admin User Management
router.get("/all-users", requireSignIn, isAdmin, require("../controller/authController.js").getAllUsers)
router.get("/user-detail/:id", requireSignIn, isAdmin, getUserDetailController)
router.put("/ban-user/:id", requireSignIn, isAdmin, banUserController)

// Audit & Staff Role Management (Module E)
router.get("/logs", requireSignIn, isAdmin, require("../controller/auditController.js").getAuditLogsController)
router.put("/update-role", requireSignIn, isAdmin, require("../controller/authController.js").updateRoleController)

// Dynamic Role Management
router.get("/roles", requireSignIn, isAdmin, require("../controller/roleController.js").getAllRolesController)
router.post("/roles", requireSignIn, isAdmin, require("../controller/roleController.js").createRoleController)
router.put("/roles/:id", requireSignIn, isAdmin, require("../controller/roleController.js").updateRoleController)
router.delete("/roles/:id", requireSignIn, isAdmin, require("../controller/roleController.js").deleteRoleController)
router.put("/assign-role", requireSignIn, isAdmin, require("../controller/roleController.js").assignRoleController)


module.exports = router
