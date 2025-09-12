// routes/admin/metrics.js
import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler.js";
import * as metricsController from "../../controllers/admin/metrics.controller.js";

const router = Router();

// GET /api/admin/metrics/overview - Get dashboard overview metrics
router.get("/overview", asyncHandler(metricsController.getOverview));

// GET /api/admin/metrics/summary - Get metrics summary for date range
router.get("/summary", asyncHandler(metricsController.getSummary));

export default router;
