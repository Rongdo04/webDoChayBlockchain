// routes/reportsRoutes.js
import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  submitReport,
  getUserReports,
} from "../controllers/reportsController.js";

const router = express.Router();

// All report routes require authentication
router.use(authenticate);

/**
 * POST /api/reports
 * Submit a new report
 */
router.post("/", submitReport);

/**
 * GET /api/reports/user
 * Get current user's reports
 */
router.get("/user", getUserReports);

export default router;
