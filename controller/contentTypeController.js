const contentTypeModel = require("../models/contentTypeModel.js")
const slugify = require("slugify")

exports.createContentTypeController = async (req, res) => {
  try {
    const { contenttype } = req.body
    if (!contenttype) {
      return res.status(400).send({ message: "Content type is required" })
    }
    const existingContentType = await contentTypeModel.findOne({ contenttype })
    if (existingContentType) {
      return res.status(409).send({
        success: true,
        message: "Content type Already Exists",
      })
    }
    const contentType = await new contentTypeModel({
      contenttype,
      slug: slugify(contenttype),
    }).save()
    res.status(201).send({
      success: true,
      message: "New content type created",
      contentType,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      error,
      message: "Error in content type",
    })
  }
}

exports.updateContentTypeController = async (req, res) => {
  try {
    const { contenttype } = req.body
    const { id } = req.params
    const contentType = await contentTypeModel.findByIdAndUpdate(
      id,
      { contenttype, slug: slugify(contenttype) },
      { new: true }
    )
    if (!contentType) {
      return res.status(404).json({ message: "Content type not found" })
    }
    res.status(200).send({
      success: true,
      message: "Content type Updated Successfully",
      contentType,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      error,
      message: "Error while updating content type",
    })
  }
}

exports.contenttypeControlller = async (req, res) => {
  try {
    const contenttype = await contentTypeModel.find({})
    res.status(200).send({
      success: true,
      message: "All content types list",
      contenttype,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting all content types",
    })
  }
}

exports.singleContentTypeController = async (req, res) => {
  try {
    const contenttype = await contentTypeModel.findOne({
      slug: req.params.slug,
    })
    res.status(200).send({
      success: true,
      message: "Get Single content type Successfully",
      contenttype,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      error,
      message: "Error while getting Single content type",
    })
  }
}

exports.deleteContentTypeCOntroller = async (req, res) => {
  try {
    const { id } = req.params
    const contentType = await contentTypeModel.findByIdAndDelete(id)
    if (!contentType) {
      return res.status(404).json({ message: "Content type not found" })
    }
    res.status(200).send({
      success: true,
      message: "Content type Deleted Successfully",
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Error while deleting content type",
      error,
    })
  }
}
