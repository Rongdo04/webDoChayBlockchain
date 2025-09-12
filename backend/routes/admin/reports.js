// routes/admin/reports.js
import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler.js";
import * as reportsController from "../../controllers/admin/reports.controller.js";
import {
  validateListReports,
  validateReportId,
  validateResolveReport,
} from "../../validators/admin/reports.validator.js";

const router = Router();

// GET /api/admin/reports - List reports with filtering and pagination
router.get(
  "/",
  validateListReports,
  asyncHandler(reportsController.listReports)
);

// GET /api/admin/reports/stats - Get report statistics
router.get("/stats", asyncHandler(reportsController.getReportStats));

// GET /api/admin/reports/:id - Get single report details
router.get("/:id", validateReportId, asyncHandler(reportsController.getReport));

// POST /api/admin/reports/:id/resolve - Resolve report
router.post(
  "/:id/resolve",
  validateReportId,
  validateResolveReport,
  asyncHandler(reportsController.resolveReport)
);

export default router;
