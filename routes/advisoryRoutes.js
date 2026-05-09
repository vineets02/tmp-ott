const express = require("express")
const { isAdmin, requireSignIn } = require("../middlewares/authMiddleware.js")
// const {
//   categoryControlller,
//   // createCategoryController,
//   deleteCategoryCOntroller,
//   singleCategoryController,
//   // updateCategoryController,
// } = require("../controller/categoryController.js")
const {
  contenttypeControlller,
  createContentTypeController,
  deleteContentTypeCOntroller,
  singleContentTypeController,
  updateContentTypeController,
} = require("../controller/contentTypeController.js")

const router = express.Router()

//routes
// create category
router.post(
  "/create-contenttype",
  requireSignIn,
  isAdmin,
  createContentTypeController
)

//update category
router.put(
  "/update-contenttype/:id",
  requireSignIn,
  isAdmin,
  updateContentTypeController
)

//getALl category
router.get("/get-contenttype", contenttypeControlller)

//single category
router.get("/single-contenttype/:slug", singleContentTypeController)

//delete category
router.delete(
  "/delete-contenttype/:id",
  requireSignIn,
  isAdmin,
  deleteContentTypeCOntroller
)

module.exports = router
