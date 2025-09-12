// models/Settings.js
import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    siteTitle: {
      type: String,
      required: true,
      maxlength: [100, "Site title must not exceed 100 characters"],
      trim: true,
    },
    siteDesc: {
      type: String,
      required: true,
      maxlength: [500, "Site description must not exceed 500 characters"],
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      maxlength: [50, "Brand name must not exceed 50 characters"],
      trim: true,
    },
    policy: {
      type: String,
      required: true,
      maxlength: [5000, "Policy text must not exceed 5000 characters"],
      trim: true,
    },
    // Single document pattern - only one settings document allowed
    _singleton: {
      type: Boolean,
      default: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    collection: "settings",
  }
);

// Index for efficient queries
settingsSchema.index({ _singleton: 1 });

// Prevent multiple documents
settingsSchema.pre("save", function (next) {
  this._singleton = true;
  next();
});

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
