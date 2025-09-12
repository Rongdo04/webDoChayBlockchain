// controllers/admin/audit.controller.js
import { asyncHandler } from "../../middleware/errorHandler.js";
import * as auditRepo from "../../repositories/audit.repo.js";

/**
 * Get audit logs with pagination and filtering
 * @route GET /api/admin/audit-logs
 * @access Admin
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  try {
    const {
      limit = 50,
      page = 1,
      action,
      entityType,
      userId,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Validate limit
    const parsedLimit = Math.min(parseInt(limit), 100); // Max 100 per page
    const parsedPage = Math.max(parseInt(page), 1);

    // Validate sort order
    if (sortOrder && !["asc", "desc"].includes(sortOrder)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_SORT_ORDER",
          message: "Sort order must be 'asc' or 'desc'",
        },
      });
    }

    // Validate date format if provided
    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_START_DATE",
            message: "Invalid start date format",
          },
        });
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_END_DATE",
            message: "Invalid end date format",
          },
        });
      }
    }

    const options = {
      limit: parsedLimit,
      page: parsedPage,
      action,
      entityType,
      userId,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    };

    const result = await auditRepo.getAuditLogs(options);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "AUDIT_LOGS_ERROR",
        message: "Failed to fetch audit logs",
      },
    });
  }
});

/**
 * Get audit logs for a specific entity
 * @route GET /api/admin/audit-logs/entity/:entityType/:entityId
 * @access Admin
 */
export const getEntityAuditLogs = asyncHandler(async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { limit = 10 } = req.query;

    // Validate parameters
    if (!entityType || !entityId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_PARAMETERS",
          message: "Entity type and ID are required",
        },
      });
    }

    const parsedLimit = Math.min(parseInt(limit), 50); // Max 50 for entity logs

    const logs = await auditRepo.getEntityAuditLogs(
      entityType,
      entityId,
      parsedLimit
    );

    res.json({
      success: true,
      data: {
        entityType,
        entityId,
        logs,
        total: logs.length,
      },
    });
  } catch (error) {
    console.error("Get entity audit logs error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "ENTITY_AUDIT_ERROR",
        message: "Failed to fetch entity audit logs",
      },
    });
  }
});

/**
 * Get audit statistics
 * @route GET /api/admin/audit-logs/stats
 * @access Admin
 */
export const getAuditStats = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let options = {};

    if (startDate) {
      options.startDate = new Date(startDate);
      if (isNaN(options.startDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_START_DATE",
            message: "Invalid start date format",
          },
        });
      }
    }

    if (endDate) {
      options.endDate = new Date(endDate);
      if (isNaN(options.endDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_END_DATE",
            message: "Invalid end date format",
          },
        });
      }
    }

    const stats = await auditRepo.getAuditStats(options);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get audit stats error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "AUDIT_STATS_ERROR",
        message: "Failed to fetch audit statistics",
      },
    });
  }
});

/**
 * Clean up old audit logs
 * @route DELETE /api/admin/audit-logs/cleanup
 * @access Admin
 */
export const cleanupAuditLogs = asyncHandler(async (req, res) => {
  try {
    const { daysToKeep = 365 } = req.body;

    // Validate daysToKeep
    const days = parseInt(daysToKeep);
    if (isNaN(days) || days < 30) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_DAYS",
          message: "Days to keep must be at least 30",
        },
      });
    }

    const deletedCount = await auditRepo.cleanupOldLogs(days);

    res.json({
      success: true,
      data: {
        message: `Successfully deleted ${deletedCount} old audit logs`,
        deletedCount,
        daysKept: days,
      },
    });
  } catch (error) {
    console.error("Cleanup audit logs error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "CLEANUP_ERROR",
        message: "Failed to cleanup audit logs",
      },
    });
  }
});

/**
 * Export audit logs (for backup/compliance)
 * @route GET /api/admin/audit-logs/export
 * @access Admin
 */
export const exportAuditLogs = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate, format = "json" } = req.query;

    if (!["json", "csv"].includes(format)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_FORMAT",
          message: "Format must be 'json' or 'csv'",
        },
      });
    }

    const options = {
      limit: 10000, // Large limit for export
      page: 1,
      startDate,
      endDate,
      sortBy: "createdAt",
      sortOrder: "desc",
    };

    const result = await auditRepo.getAuditLogs(options);

    if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="audit-logs.json"'
      );
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: result.logs.length,
        logs: result.logs,
      });
    } else if (format === "csv") {
      // Convert to CSV format
      const csvHeaders = [
        "timestamp",
        "action",
        "entityType",
        "actor",
        "description",
        "ipAddress",
      ];
      const csvRows = result.logs.map((log) => [
        log.timestamp,
        log.action,
        log.entityType,
        log.actor.email,
        log.description,
        log.ipAddress || "",
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) =>
          row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="audit-logs.csv"'
      );
      res.send(csvContent);
    }
  } catch (error) {
    console.error("Export audit logs error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "EXPORT_ERROR",
        message: "Failed to export audit logs",
      },
    });
  }
});
