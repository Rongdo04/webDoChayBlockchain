// repositories/audit.repo.js
import AuditLog from "../models/AuditLog.js";

/**
 * Get audit logs with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Audit logs with pagination info
 */
export async function getAuditLogs(options = {}) {
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
    } = options;

    // Build query
    const query = {};

    if (action) {
      query.action = action;
    }

    if (entityType) {
      query.entityType = entityType;
    }

    if (userId) {
      query.userId = userId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Execute queries
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate("userId", "name email role")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    // Transform logs for response
    const transformedLogs = logs.map((log) => ({
      id: log._id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      actor: {
        id: log.userId?._id,
        name: log.userId?.name || "Unknown User",
        email: log.userId?.email || log.userEmail,
        role: log.userId?.role || log.userRole,
      },
      details: log.details || {},
      metadata: log.metadata || {},
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      timestamp: log.createdAt,
      description: generateDescription(log),
    }));

    return {
      logs: transformedLogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw new Error("Failed to fetch audit logs");
  }
}

/**
 * Get audit logs for a specific entity
 * @param {string} entityType - Type of entity
 * @param {string} entityId - ID of entity
 * @param {number} limit - Number of logs to return
 * @returns {Promise<Array>} Audit logs for the entity
 */
export async function getEntityAuditLogs(entityType, entityId, limit = 10) {
  try {
    const logs = await AuditLog.find({
      entityType,
      entityId,
    })
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return logs.map((log) => ({
      id: log._id,
      action: log.action,
      actor: {
        id: log.userId?._id,
        name: log.userId?.name || "Unknown User",
        email: log.userId?.email || log.userEmail,
        role: log.userId?.role || log.userRole,
      },
      details: log.details || {},
      timestamp: log.createdAt,
      description: generateDescription(log),
    }));
  } catch (error) {
    console.error("Error fetching entity audit logs:", error);
    throw new Error("Failed to fetch entity audit logs");
  }
}

/**
 * Get audit statistics
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Audit statistics
 */
export async function getAuditStats(options = {}) {
  try {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date(),
    } = options;

    // Get total counts
    const [totalLogs, actionStats, entityStats, userStats, recentActivity] =
      await Promise.all([
        AuditLog.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
        }),
        AuditLog.aggregate([
          { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: "$action", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        AuditLog.aggregate([
          { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: "$entityType", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        AuditLog.aggregate([
          { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
          {
            $group: {
              _id: "$userId",
              count: { $sum: 1 },
              userEmail: { $first: "$userEmail" },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        AuditLog.find({ createdAt: { $gte: startDate, $lte: endDate } })
          .populate("userId", "name email")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

    return {
      summary: {
        totalLogs,
        period: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
      },
      actionBreakdown: actionStats.map((stat) => ({
        action: stat._id,
        count: stat.count,
      })),
      entityBreakdown: entityStats.map((stat) => ({
        entityType: stat._id,
        count: stat.count,
      })),
      topUsers: userStats.map((stat) => ({
        userId: stat._id,
        email: stat.userEmail,
        actionCount: stat.count,
      })),
      recentActivity: recentActivity.map((log) => ({
        id: log._id,
        action: log.action,
        entityType: log.entityType,
        actor: log.userId?.name || log.userEmail,
        timestamp: log.createdAt,
        description: generateDescription(log),
      })),
    };
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    throw new Error("Failed to fetch audit statistics");
  }
}

/**
 * Generate human-readable description for audit log
 * @param {Object} log - Audit log entry
 * @returns {string} Human-readable description
 */
function generateDescription(log) {
  const { action, entityType, details, userEmail } = log;
  const actorName =
    log.userId?.name || details?.actorName || userEmail || "Unknown User";

  // Use custom description if available
  if (details?.description) {
    return details.description;
  }

  // Generate description based on action and entity type
  const actionMap = {
    create: "created",
    update: "updated",
    delete: "deleted",
    publish: "published",
    unpublish: "unpublished",
    reject: "rejected",
    approve: "approved",
    hide: "hidden",
    resolve: "resolved",
  };

  const entityMap = {
    recipe: "recipe",
    user: "user account",
    settings: "system settings",
    media: "media file",
    taxonomy: "taxonomy",
    comment: "comment",
    report: "report",
    system: "system",
  };

  const actionText = actionMap[action] || action;
  const entityText = entityMap[entityType] || entityType;

  let description = `${actorName} ${actionText} ${entityText}`;

  // Add specific details
  if (details?.title) {
    description += ` "${details.title}"`;
  } else if (details?.name) {
    description += ` "${details.name}"`;
  }

  if (details?.reason) {
    description += ` (${details.reason})`;
  }

  return description;
}

/**
 * Clean up old audit logs
 * @param {number} daysToKeep - Number of days to keep logs
 * @returns {Promise<number>} Number of deleted logs
 */
export async function cleanupOldLogs(daysToKeep = 365) {
  try {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await AuditLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    console.log(
      `Cleaned up ${result.deletedCount} audit logs older than ${daysToKeep} days`
    );
    return result.deletedCount;
  } catch (error) {
    console.error("Error cleaning up audit logs:", error);
    throw new Error("Failed to cleanup audit logs");
  }
}
