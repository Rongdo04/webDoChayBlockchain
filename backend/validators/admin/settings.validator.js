// validators/admin/settings.validator.js
import validator from "validator";

// Validate settings update request
export function validateUpdateSettings(req, res, next) {
  const { siteTitle, siteDesc, brand, policy, featuredVideo } = req.body;
  const errors = {};

  // Validate siteTitle
  if (siteTitle !== undefined) {
    if (!siteTitle || typeof siteTitle !== "string") {
      errors.siteTitle = "Site title is required and must be a string";
    } else if (siteTitle.trim().length === 0) {
      errors.siteTitle = "Site title cannot be empty";
    } else if (siteTitle.length > 100) {
      errors.siteTitle = "Site title must not exceed 100 characters";
    } else if (siteTitle.length < 3) {
      errors.siteTitle = "Site title must be at least 3 characters long";
    }
  }

  // Validate siteDesc
  if (siteDesc !== undefined) {
    if (!siteDesc || typeof siteDesc !== "string") {
      errors.siteDesc = "Site description is required and must be a string";
    } else if (siteDesc.trim().length === 0) {
      errors.siteDesc = "Site description cannot be empty";
    } else if (siteDesc.length > 500) {
      errors.siteDesc = "Site description must not exceed 500 characters";
    } else if (siteDesc.length < 10) {
      errors.siteDesc = "Site description must be at least 10 characters long";
    }
  }

  // Validate brand
  if (brand !== undefined) {
    if (!brand || typeof brand !== "string") {
      errors.brand = "Brand name is required and must be a string";
    } else if (brand.trim().length === 0) {
      errors.brand = "Brand name cannot be empty";
    } else if (brand.length > 50) {
      errors.brand = "Brand name must not exceed 50 characters";
    } else if (brand.length < 2) {
      errors.brand = "Brand name must be at least 2 characters long";
    } else if (!/^[a-zA-Z0-9\s\-_&]+$/.test(brand)) {
      errors.brand = "Brand name contains invalid characters";
    }
  }

  // Validate policy
  if (policy !== undefined) {
    if (!policy || typeof policy !== "string") {
      errors.policy = "Policy text is required and must be a string";
    } else if (policy.trim().length === 0) {
      errors.policy = "Policy text cannot be empty";
    } else if (policy.length > 5000) {
      errors.policy = "Policy text must not exceed 5000 characters";
    } else if (policy.length < 20) {
      errors.policy = "Policy text must be at least 20 characters long";
    }
  }

  // Validate featuredVideo
  if (featuredVideo !== undefined) {
    if (featuredVideo && typeof featuredVideo !== "string") {
      errors.featuredVideo = "Featured video must be a string";
    } else if (featuredVideo && featuredVideo.trim().length === 0) {
      errors.featuredVideo = "Featured video URL cannot be empty";
    } else if (featuredVideo && featuredVideo.length > 500) {
      errors.featuredVideo =
        "Featured video URL must not exceed 500 characters";
    } else if (
      featuredVideo &&
      !validator.isURL(featuredVideo, { protocols: ["http", "https"] })
    ) {
      errors.featuredVideo = "Featured video must be a valid URL";
    }
  }

  // Check if at least one field is provided
  const providedFields = [
    siteTitle,
    siteDesc,
    brand,
    policy,
    featuredVideo,
  ].filter((field) => field !== undefined);
  if (providedFields.length === 0) {
    errors.general = "At least one field must be provided for update";
  }

  // Validate required fields for complete update
  if (
    siteTitle !== undefined ||
    siteDesc !== undefined ||
    brand !== undefined ||
    policy !== undefined ||
    featuredVideo !== undefined
  ) {
    // If any field is provided, we should validate all are eventually present
    // This will be handled by the repository layer and Mongoose schema
  }

  // Return validation errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Settings validation failed",
        details: errors,
      },
    });
  }

  next();
}

// Validate individual field formats
export function validateFieldFormats(data) {
  const errors = {};

  // Additional format validations
  if (data.siteTitle) {
    // Check for potentially harmful content
    if (/<script|javascript:|on\w+=/i.test(data.siteTitle)) {
      errors.siteTitle = "Site title contains potentially harmful content";
    }
  }

  if (data.siteDesc) {
    // Check for potentially harmful content
    if (/<script|javascript:|on\w+=/i.test(data.siteDesc)) {
      errors.siteDesc = "Site description contains potentially harmful content";
    }
  }

  if (data.brand) {
    // Additional brand validation
    if (/<script|javascript:|on\w+=/i.test(data.brand)) {
      errors.brand = "Brand name contains potentially harmful content";
    }
  }

  if (data.policy) {
    // Policy can contain some HTML but validate against harmful scripts
    if (/<script|javascript:|on\w+=/i.test(data.policy)) {
      errors.policy = "Policy text contains potentially harmful content";
    }
  }

  if (data.featuredVideo) {
    // Check for potentially harmful content in video URL
    if (/<script|javascript:|on\w+=/i.test(data.featuredVideo)) {
      errors.featuredVideo =
        "Featured video URL contains potentially harmful content";
    }
  }

  return errors;
}

// Sanitize input data
export function sanitizeSettingsData(data) {
  const sanitized = {};

  if (data.siteTitle !== undefined) {
    sanitized.siteTitle = validator.escape(data.siteTitle.toString().trim());
  }

  if (data.siteDesc !== undefined) {
    sanitized.siteDesc = validator.escape(data.siteDesc.toString().trim());
  }

  if (data.brand !== undefined) {
    sanitized.brand = validator.escape(data.brand.toString().trim());
  }

  if (data.policy !== undefined) {
    // For policy, we might want to allow some basic HTML, so minimal sanitization
    sanitized.policy = data.policy.toString().trim();
  }

  if (data.featuredVideo !== undefined) {
    // Don't escape URLs for featuredVideo to preserve valid URL format
    sanitized.featuredVideo = data.featuredVideo.toString().trim();
  }

  return sanitized;
}
