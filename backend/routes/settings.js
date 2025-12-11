// routes/settings.js
import express from "express";
import { getPublicSettings } from "../controllers/admin/settings.controller.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// GET /api/settings/public - Get public settings (no auth required)
router.get("/public", asyncHandler(getPublicSettings));

export default router;
