// routes/admin/settings.js
import express from "express";
import {
  getSettings,
  updateSettings,
} from "../../controllers/admin/settings.controller.js";
import { validateUpdateSettings } from "../../validators/admin/settings.validator.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

const router = express.Router();

// GET /api/admin/settings - Get current settings
router.get("/", asyncHandler(getSettings));

// PUT /api/admin/settings - Update settings
router.put("/", validateUpdateSettings, asyncHandler(updateSettings));

export default router;
