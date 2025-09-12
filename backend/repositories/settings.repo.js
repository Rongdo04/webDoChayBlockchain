// repositories/settings.repo.js
import Settings from "../models/Settings.js";
import AuditLog from "../models/AuditLog.js";

// Get current settings (single document)
export async function getSettings() {
  try {
    let settings = await Settings.findOne({ _singleton: true });

    // If no settings exist, create default ones
    if (!settings) {
      settings = await Settings.create({
        siteTitle: "Vegetarian Recipe Platform",
        siteDesc:
          "Discover delicious and healthy vegetarian recipes for every occasion",
        brand: "VeggieCook",
        policy:
          "Welcome to our vegetarian recipe platform. Please respect our community guidelines and enjoy sharing healthy, plant-based recipes.",
        _singleton: true,
      });
    }

    return settings;
  } catch (error) {
    console.error("Get settings error:", error);
    throw {
      status: 500,
      code: "SETTINGS_FETCH_ERROR",
      message: "Failed to fetch settings",
    };
  }
}

// Update settings (single document)
export async function updateSettings(updateData, adminUser) {
  try {
    // Get current settings for audit trail
    const currentSettings = await getSettings();

    // Track changes for audit
    const changes = {};
    const allowedFields = ["siteTitle", "siteDesc", "brand", "policy"];

    allowedFields.forEach((field) => {
      if (
        updateData[field] !== undefined &&
        updateData[field] !== currentSettings[field]
      ) {
        changes[field] = {
          from: currentSettings[field],
          to: updateData[field],
        };
      }
    });

    // Update the settings
    const updatedSettings = await Settings.findOneAndUpdate(
      { _singleton: true },
      {
        ...updateData,
        _singleton: true, // Ensure singleton pattern
      },
      {
        new: true,
        runValidators: true,
        upsert: true, // Create if doesn't exist
      }
    );

    // Log audit trail if there were changes
    if (Object.keys(changes).length > 0) {
      await AuditLog.create({
        action: "update",
        entityType: "settings",
        entityId: updatedSettings._id,
        userId: adminUser._id || adminUser.id,
        userEmail: adminUser.email,
        userRole: adminUser.role,
        details: {
          changes,
          summary: `Updated settings: ${Object.keys(changes).join(", ")}`,
        },
        metadata: {
          userAgent: "Admin Panel",
          timestamp: new Date(),
        },
      });
    }

    return updatedSettings;
  } catch (error) {
    console.error("Update settings error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = {};
      Object.keys(error.errors).forEach((key) => {
        validationErrors[key] = error.errors[key].message;
      });

      throw {
        status: 422,
        code: "VALIDATION_ERROR",
        message: "Settings validation failed",
        details: validationErrors,
      };
    }

    // Handle duplicate key errors (shouldn't happen with singleton pattern)
    if (error.code === 11000) {
      throw {
        status: 409,
        code: "SETTINGS_CONFLICT",
        message: "Settings conflict occurred",
      };
    }

    throw {
      status: 500,
      code: "SETTINGS_UPDATE_ERROR",
      message: "Failed to update settings",
    };
  }
}

// Initialize default settings if none exist
export async function initializeSettings() {
  try {
    const existing = await Settings.findOne({ _singleton: true });
    if (!existing) {
      return await getSettings(); // This will create default settings
    }
    return existing;
  } catch (error) {
    console.error("Initialize settings error:", error);
    throw {
      status: 500,
      code: "SETTINGS_INIT_ERROR",
      message: "Failed to initialize settings",
    };
  }
}
