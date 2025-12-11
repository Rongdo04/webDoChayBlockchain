// controllers/admin/settings.controller.js
import * as settingsRepo from "../../repositories/settings.repo.js";
import {
  sanitizeSettingsData,
  validateFieldFormats,
} from "../../validators/admin/settings.validator.js";

// GET /api/settings/public - Get public settings (no auth required)
export async function getPublicSettings(req, res) {
  try {
    const settings = await settingsRepo.getSettings();

    res.json({
      success: true,
      data: {
        siteTitle: settings.siteTitle,
        siteDesc: settings.siteDesc,
        brand: settings.brand,
        featuredVideo: settings.featuredVideo,
      },
    });
  } catch (error) {
    console.error("Get public settings error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Failed to fetch public settings",
      },
    });
  }
}

// GET /api/admin/settings - Get current settings
export async function getSettings(req, res) {
  try {
    const settings = await settingsRepo.getSettings();

    res.json({
      success: true,
      data: {
        id: settings._id,
        siteTitle: settings.siteTitle,
        siteDesc: settings.siteDesc,
        brand: settings.brand,
        policy: settings.policy,
        featuredVideo: settings.featuredVideo,
        updatedAt: settings.updatedAt,
        createdAt: settings.createdAt,
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Failed to fetch settings",
      },
    });
  }
}

// PUT /api/admin/settings - Update settings
export async function updateSettings(req, res) {
  try {
    const adminUserId = req.user.id;

    // Sanitize input data
    const sanitizedData = sanitizeSettingsData(req.body);

    // Additional format validation
    const formatErrors = validateFieldFormats(sanitizedData);
    if (Object.keys(formatErrors).length > 0) {
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Settings validation failed",
          details: formatErrors,
        },
      });
    }

    // Update settings
    const updatedSettings = await settingsRepo.updateSettings(
      sanitizedData,
      req.user
    );

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: {
        id: updatedSettings._id,
        siteTitle: updatedSettings.siteTitle,
        siteDesc: updatedSettings.siteDesc,
        brand: updatedSettings.brand,
        policy: updatedSettings.policy,
        featuredVideo: updatedSettings.featuredVideo,
        updatedAt: updatedSettings.updatedAt,
        createdAt: updatedSettings.createdAt,
      },
    });
  } catch (error) {
    console.error("Update settings error:", error);

    // Handle specific error types
    if (error.status === 422) {
      return res.status(422).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      });
    }

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Failed to update settings",
      },
    });
  }
}
