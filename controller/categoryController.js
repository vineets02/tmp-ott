const categoryModel = require("../models/categoryModel.js")
const slugify = require("slugify")

exports.createCategoryController = async (req, res) => {
  try {
    const { name } = req.body
    if (!name) {
      return res.status(401).send({ message: "Name is required" })
    }
    const existingCategory = await categoryModel.findOne({ name })
    if (existingCategory) {
      return res.status(200).send({
        success: true,
        message: "Category Already Exists",
      })
    }
    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save()
    res.status(201).send({
      success: true,
      message: "New category created",
      category,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      error,
      message: "Error in Category",
    })
  }
}

// Update category
exports.updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body
    const { id } = req.params
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    )
    res.status(200).send({
      success: true,
      message: "Category Updated Successfully",
      category,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      error,
      message: "Error while updating category",
    })
  }
}

// Get all categories
exports.categoryController = async (req, res) => {
  try {
    const category = await categoryModel.find({})
    res.status(200).send({
      success: true,
      message: "All Categories List",
      category,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all categories",
    })
  }
}

// Single category
exports.singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug })
    res.status(200).send({
      success: true,
      message: "Get Single Category Successfully",
      category,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      error,
      message: "Error While getting Single Category",
    })
  }
}

// Delete category
exports.deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params
    await categoryModel.findByIdAndDelete(id)
    res.status(200).send({
      success: true,
      message: "Category Deleted Successfully",
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Error while deleting category",
      error,
    })
  }
}
