const homepageModel = require("../models/homepageModel");
const movieModel = require("../models/movieModel");
const categoryModel = require("../models/categoryModel");

// Get Homepage Settings
module.exports.getHomepageSettings = async (req, res) => {
  try {
    let settings = await homepageModel.findOne()
      .populate("heroMovies")
      .populate("pinnedCategories.category");

    if (!settings) {
      // Create default settings if none exist
      settings = await new homepageModel({
        heroMovies: [],
        pinnedCategories: [],
        promoBanners: []
      }).save();
    }

    res.status(200).send({
      success: true,
      settings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching homepage settings",
      error,
    });
  }
};

// Update Hero Movies
module.exports.updateHeroMovies = async (req, res) => {
  try {
    const { movieIds, isManualHero } = req.body;
    
    let settings = await homepageModel.findOne();
    if (!settings) settings = new homepageModel();

    settings.heroMovies = movieIds;
    settings.isManualHero = isManualHero;
    
    await settings.save();
    
    res.status(200).send({
      success: true,
      message: "Hero Slider updated successfully",
      settings,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error updating hero slider", error });
  }
};

// Update Pinned Categories
module.exports.updatePinnedCategories = async (req, res) => {
  try {
    const { categories, isManualCategories } = req.body;
    
    let settings = await homepageModel.findOne();
    if (!settings) settings = new homepageModel();

    settings.pinnedCategories = categories;
    settings.isManualCategories = isManualCategories;
    
    await settings.save();
    
    res.status(200).send({
      success: true,
      message: "Pinned categories updated successfully",
      settings,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error updating pinned categories", error });
  }
};

// Add Promo Banner
module.exports.updatePromoBanners = async (req, res) => {
  try {
    const { banners } = req.body;
    
    let settings = await homepageModel.findOne();
    if (!settings) settings = new homepageModel();

    settings.promoBanners = banners;
    await settings.save();
    
    res.status(200).send({
      success: true,
      message: "Promo banners updated successfully",
      settings,
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error updating promo banners", error });
  }
};
