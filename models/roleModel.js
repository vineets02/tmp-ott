const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    permissions: [{
      type: String,
      enum: [
        "manage_content",   // Create/Edit/Delete Movies, Categories, Genres
        "view_finance",     // View Orders, Analytics
        "manage_finance",   // Manage Coupons, Subscriptions
        "manage_users",     // Ban/Role Update
        "manage_reviews",   // Delete Reviews
        "manage_settings",  // Homepage Control, System Settings
      ],
    }],
    description: {
      type: String,
    },
    isSystemRole: {
      type: Boolean,
      default: false, // System roles like 'Super Admin' cannot be deleted
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
