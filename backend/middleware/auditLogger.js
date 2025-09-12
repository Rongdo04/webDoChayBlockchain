// middleware/auditLogger.js
import AuditLog from "../models/AuditLog.js";

/**
 * Audit Logger Middleware
 * Centralized logging for all important admin actions
 */

/**
 * Log an audit entry
 * @param {string} actorId - ID of the user performing the action
 * @param {string} action - Action type (create, update, delete, publish, unpublish, reject, approve, hide, resolve)
 * @param {string} targetType - Type of entity being acted upon (recipe, user, settings, media, taxonomy, comment, report)
 * @param {string} targetId - ID of the target entity
 * @param {Object} meta - Additional metadata about the action
 * @param {Object} req - Express request object (optional)
 * @returns {Promise<Object>} Created audit log entry
 */
export async function log(
  actorId,
  action,
  targetType,
  targetId,
  meta = {},
  req = null
) {
  try {
    // Get actor information
    const User = (await import("../models/User.js")).default;
    const actor = await User.findById(actorId).select("name email role").lean();

    if (!actor) {
      console.warn(`Audit log: Actor not found for ID ${actorId}`);
      return null;
    }

    // Create audit log entry
    const auditEntry = {
      action,
      entityType: targetType,
      entityId: targetId,
      userId: actorId,
      userEmail: actor.email,
      userRole: actor.role,
      details: {
        actorName: actor.name,
        ...meta,
      },
      metadata: {
        timestamp: new Date(),
        userAgent: req?.get("User-Agent") || "System",
        ...meta.metadata,
      },
    };

    // Add IP address if request is available
    if (req) {
      auditEntry.ipAddress = req.ip || req.connection?.remoteAddress;
      auditEntry.userAgent = req.get("User-Agent");
    }

    const logEntry = await AuditLog.create(auditEntry);

    // Log to console for debugging
    console.log(
      `[AUDIT] ${actor.name} (${actor.role}) ${action} ${targetType} ${
        targetId || ""
      }`
    );

    return logEntry;
  } catch (error) {
    console.error("Audit logging error:", error);
    // Don't throw error to prevent breaking the main operation
    return null;
  }
}

/**
 * Express middleware for automatic audit logging
 * Usage: router.use(auditMiddleware({ action: 'update', targetType: 'recipe' }))
 */
export function auditMiddleware(options = {}) {
  return async (req, res, next) => {
    // Store original res.json to intercept successful responses
    const originalJson = res.json;

    res.json = function (data) {
      // Only log on successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const actorId = req.user?.id || req.user?._id;
        const targetId = req.params?.id || data?.data?.id || options.targetId;

        if (actorId) {
          // Log asynchronously without blocking response
          setImmediate(async () => {
            await log(
              actorId,
              options.action || req.method.toLowerCase(),
              options.targetType || "unknown",
              targetId,
              {
                endpoint: req.originalUrl,
                method: req.method,
                statusCode: res.statusCode,
                ...options.meta,
              },
              req
            );
          });
        }
      }

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
}

/**
 * Helper functions for common audit actions
 */

export const auditHelpers = {
  // Recipe actions
  async recipePublished(actorId, recipeId, recipeTitle, req) {
    return await log(
      actorId,
      "publish",
      "recipe",
      recipeId,
      {
        title: recipeTitle,
        description: `Published recipe "${recipeTitle}"`,
      },
      req
    );
  },

  async recipeUnpublished(actorId, recipeId, recipeTitle, req) {
    return await log(
      actorId,
      "unpublish",
      "recipe",
      recipeId,
      {
        title: recipeTitle,
        description: `Unpublished recipe "${recipeTitle}"`,
      },
      req
    );
  },

  async recipeRejected(actorId, recipeId, recipeTitle, reason, req) {
    return await log(
      actorId,
      "reject",
      "recipe",
      recipeId,
      {
        title: recipeTitle,
        reason,
        description: `Rejected recipe "${recipeTitle}" - ${reason}`,
      },
      req
    );
  },

  // Comment actions
  async commentApproved(actorId, commentId, recipeId, req) {
    return await log(
      actorId,
      "approve",
      "comment",
      commentId,
      {
        recipeId,
        description: "Approved comment",
      },
      req
    );
  },

  async commentHidden(actorId, commentId, recipeId, reason, req) {
    return await log(
      actorId,
      "hide",
      "comment",
      commentId,
      {
        recipeId,
        reason,
        description: `Hidden comment - ${reason}`,
      },
      req
    );
  },

  // Report actions
  async reportResolved(actorId, reportId, reportType, resolution, req) {
    return await log(
      actorId,
      "resolve",
      "report",
      reportId,
      {
        reportType,
        resolution,
        description: `Resolved ${reportType} report - ${resolution}`,
      },
      req
    );
  },

  // User actions
  async userRoleChanged(actorId, targetUserId, oldRole, newRole, req) {
    return await log(
      actorId,
      "update",
      "user",
      targetUserId,
      {
        oldRole,
        newRole,
        description: `Changed user role from ${oldRole} to ${newRole}`,
      },
      req
    );
  },

  async userStatusChanged(actorId, targetUserId, oldStatus, newStatus, req) {
    return await log(
      actorId,
      "update",
      "user",
      targetUserId,
      {
        oldStatus,
        newStatus,
        description: `Changed user status from ${oldStatus} to ${newStatus}`,
      },
      req
    );
  },

  // Settings actions
  async settingsUpdated(actorId, changes, req) {
    return await log(
      actorId,
      "update",
      "settings",
      null,
      {
        changes,
        changedFields: Object.keys(changes),
        description: `Updated settings: ${Object.keys(changes).join(", ")}`,
      },
      req
    );
  },

  // Media actions
  async mediaDeleted(actorId, mediaId, fileName, req) {
    return await log(
      actorId,
      "delete",
      "media",
      mediaId,
      {
        fileName,
        description: `Deleted media file "${fileName}"`,
      },
      req
    );
  },

  // Taxonomy actions
  async taxonomyCreated(actorId, taxonomyId, taxonomyType, name, req) {
    return await log(
      actorId,
      "create",
      "taxonomy",
      taxonomyId,
      {
        taxonomyType,
        name,
        description: `Created ${taxonomyType} "${name}"`,
      },
      req
    );
  },

  async taxonomyUpdated(actorId, taxonomyId, taxonomyType, name, changes, req) {
    return await log(
      actorId,
      "update",
      "taxonomy",
      taxonomyId,
      {
        taxonomyType,
        name,
        changes,
        description: `Updated ${taxonomyType} "${name}"`,
      },
      req
    );
  },

  async taxonomyDeleted(actorId, taxonomyId, taxonomyType, name, req) {
    return await log(
      actorId,
      "delete",
      "taxonomy",
      taxonomyId,
      {
        taxonomyType,
        name,
        description: `Deleted ${taxonomyType} "${name}"`,
      },
      req
    );
  },
};

export default {
  log,
  auditMiddleware,
  auditHelpers,
};
