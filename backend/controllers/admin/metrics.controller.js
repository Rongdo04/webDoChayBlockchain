// controllers/admin/metrics.controller.js
import { asyncHandler } from "../../middleware/errorHandler.js";
import * as metricsRepo from "../../repositories/metrics.repo.js";

/**
 * Get overview metrics for admin dashboard
 * @route GET /api/admin/metrics/overview
 * @access Admin
 */
export const getOverview = asyncHandler(async (req, res) => {
  try {
    const metrics = await metricsRepo.getOverviewMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("Get overview metrics error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "METRICS_ERROR",
        message: "Failed to fetch overview metrics",
      },
    });
  }
});

/**
 * Get recent activity feed
 * @route GET /api/admin/activity
 * @access Admin
 */
export const getActivity = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const days = parseInt(req.query.days) || 7;

    // Validate limit
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_LIMIT",
          message: "Limit must be between 1 and 100",
        },
      });
    }

    // Validate days
    if (days < 1 || days > 365) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_DAYS",
          message: "Days must be between 1 and 365",
        },
      });
    }

    const activities = await metricsRepo.getRecentActivity(limit, days);

    res.json({
      success: true,
      data: {
        activities,
        total: activities.length,
        limit,
      },
    });
  } catch (error) {
    console.error("Get activity error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "ACTIVITY_ERROR",
        message: "Failed to fetch recent activity",
      },
    });
  }
});

/**
 * Get metrics summary for date range
 * @route GET /api/admin/metrics/summary
 * @access Admin
 */
export const getSummary = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_DATES",
          message: "Both startDate and endDate are required",
        },
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date format
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_DATE_FORMAT",
          message: "Invalid date format. Use YYYY-MM-DD format",
        },
      });
    }

    // Validate date range
    if (start > end) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_DATE_RANGE",
          message: "Start date must be before end date",
        },
      });
    }

    // Limit range to 1 year
    const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
    if (end.getTime() - start.getTime() > maxRange) {
      return res.status(400).json({
        success: false,
        error: {
          code: "DATE_RANGE_TOO_LARGE",
          message: "Date range cannot exceed 1 year",
        },
      });
    }

    const summary = await metricsRepo.getMetricsSummary(start, end);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Get metrics summary error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SUMMARY_ERROR",
        message: "Failed to fetch metrics summary",
      },
    });
  }
});
