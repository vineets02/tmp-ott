const systemSettingsModel = require("../models/systemSettingsModel");

// Get settings
module.exports.getSettingsController = async (req, res) => {
  try {
    let settings = await systemSettingsModel.findOne()
      .populate("featuredMovies")
      .populate("pinnedCategories");
    if (!settings) {
      settings = await new systemSettingsModel().save();
    }
    res.status(200).send({
      success: true,
      settings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching system settings",
      error,
    });
  }
};

// Update settings
module.exports.updateSettingsController = async (req, res) => {
  try {
    const { paywallEnabled, maintenanceMode, siteName, featuredMovies, pinnedCategories, subscriptionPrice, currency } = req.body;
    let settings = await systemSettingsModel.findOne();
    
    if (!settings) {
      settings = new systemSettingsModel();
    }

    if (paywallEnabled !== undefined) settings.paywallEnabled = paywallEnabled;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (siteName !== undefined) settings.siteName = siteName;
    if (featuredMovies !== undefined) settings.featuredMovies = featuredMovies;
    if (pinnedCategories !== undefined) settings.pinnedCategories = pinnedCategories;
    if (subscriptionPrice !== undefined) settings.subscriptionPrice = subscriptionPrice;
    if (currency !== undefined) settings.currency = currency;

    await settings.save();
    
    res.status(200).send({
      success: true,
      message: "Settings Updated Successfully",
      settings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error updating system settings",
      error,
    });
  }
};

// Get storage stats
module.exports.storageStatsController = async (req, res) => {
  try {
    const { getBucketStats } = require("../utils/s3");
    const stats = await getBucketStats();
    
    res.status(200).send({
      success: true,
      stats,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching storage stats",
      error: error.message,
    });
  }
};
