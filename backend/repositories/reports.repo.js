// repositories/reports.repo.js
import Report from "../models/Report.js";
import Comment from "../models/Comment.js";
import Recipe from "../models/Recipe.js";
import AuditLog from "../models/AuditLog.js";
import mongoose from "mongoose";
import { hideComment } from "./comments.repo.js";

// List reports with filtering and pagination
export async function listReports(query = {}) {
  const {
    status,
    targetType,
    reason,
    cursor,
    limit = 20,
    sort = "newest",
  } = query;

  // Build filter
  const filter = {};

  if (status && ["open", "resolved"].includes(status)) {
    filter.status = status;
  }

  if (targetType && ["comment", "recipe"].includes(targetType)) {
    filter.targetType = targetType;
  }

  if (reason) {
    filter.reason = reason;
  }

  // Cursor pagination
  if (cursor) {
    try {
      const cursorDoc = await Report.findById(cursor);
      if (cursorDoc) {
        if (sort === "oldest") {
          filter._id = { $gt: cursorDoc._id };
        } else {
          filter._id = { $lt: cursorDoc._id };
        }
      }
    } catch (err) {
      // Invalid cursor, ignore
    }
  }

  // Sort
  const sortField = sort === "oldest" ? "createdAt" : "createdAt";
  const sortDirection = sort === "oldest" ? 1 : -1;
  const sortQuery = { [sortField]: sortDirection, _id: sortDirection };

  // Query with pagination (fetch one extra to check hasNext)
  let items = await Report.find(filter)
    .populate("reporterId", "name email avatar")
    .populate("resolution.resolvedBy", "name email")
    .sort(sortQuery)
    .limit(Number(limit) + 1);

  const hasNext = items.length > Number(limit);
  if (hasNext) items.pop();

  // Manually populate the target for each item
  for (const item of items) {
    if (item.targetType === "comment") {
      await item.populate({
        path: "targetId",
        model: "Comment",
        select: "content status",
      });
    } else if (item.targetType === "recipe") {
      await item.populate({
        path: "targetId",
        model: "Recipe",
        select: "title slug status",
      });
    }
  }

  return {
    items,
    hasNext,
    nextCursor:
      hasNext && items.length > 0 ? items[items.length - 1]._id : null,
  };
}

// Get single report with full details
export async function getReport(id) {
  const report = await Report.findById(id)
    .populate("reporterId", "name email avatar role createdAt")
    .populate("resolution.resolvedBy", "name email role");

  if (!report) {
    const error = new Error("Report not found");
    error.status = 404;
    error.code = "REPORT_NOT_FOUND";
    throw error;
  }

  // Manually populate the target based on targetType
  if (report.targetType === "comment") {
    await report.populate({
      path: "targetId",
      model: "Comment",
      populate: [
        { path: "userId", select: "name email avatar" },
        { path: "recipeId", select: "title slug" },
      ],
    });
  } else if (report.targetType === "recipe") {
    await report.populate({
      path: "targetId",
      model: "Recipe",
      populate: { path: "authorId", select: "name email avatar" },
    });
  }

  return report;
}

// Resolve report
export async function resolveReport(id, user, resolution, req = null) {
  const report = await Report.findById(id).populate({
    path: "targetId",
    refPath: "targetModel",
  });

  if (!report) {
    const error = new Error("Report not found");
    error.status = 404;
    error.code = "REPORT_NOT_FOUND";
    throw error;
  }

  if (!report.canResolve()) {
    const error = new Error("Report is already resolved");
    error.status = 400;
    error.code = "REPORT_ALREADY_RESOLVED";
    throw error;
  }

  const { action, note = "" } = resolution;

  // Validate resolution action
  if (!["no_action", "hidden", "removed"].includes(action)) {
    const error = new Error("Invalid resolution action");
    error.status = 400;
    error.code = "INVALID_RESOLUTION_ACTION";
    throw error;
  }

  // Store original status for audit
  const originalStatus = report.status;
  const targetInfo = {
    type: report.targetType,
    id: report.targetId,
    content: report.targetId?.content || report.targetId?.title || "Unknown",
  };

  // Update report
  report.status = "resolved";
  report.resolution = {
    action,
    note,
    resolvedBy: user._id || user.id,
    resolvedAt: new Date(),
  };

  // Apply resolution actions
  let actionResult = null;

  if (action === "hidden" && report.targetType === "comment") {
    try {
      // Reuse existing comment hide logic
      actionResult = await hideComment(
        report.targetId,
        user,
        `Report resolution: ${note || "Hidden due to report"}`,
        req
      );
    } catch (error) {
      // If comment no longer exists or already hidden, continue with report resolution
      actionResult = { error: error.message };
    }
  } else if (action === "removed") {
    try {
      if (report.targetType === "comment") {
        await Comment.findByIdAndDelete(report.targetId);
      } else if (report.targetType === "recipe") {
        await Recipe.findByIdAndUpdate(report.targetId, {
          status: "rejected",
          rejection: {
            reason: `Removed due to report: ${
              note || "Content violated guidelines"
            }`,
            at: new Date(),
            by: user._id || user.id,
          },
        });
      }
      actionResult = { action: "removed", success: true };
    } catch (error) {
      actionResult = { error: error.message };
    }
  }

  const updatedReport = await report.save();

  // Log audit
  await AuditLog.create({
    action: "update",
    entityType: "system",
    entityId: id,
    userId: user._id || user.id,
    userEmail: user.email,
    userRole: user.role,
    metadata: {
      operation: "resolve_report",
      originalStatus,
      resolution: {
        action,
        note,
      },
      target: targetInfo,
      actionResult,
    },
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.("User-Agent"),
  });

  return updatedReport;
}

// Get report statistics
export async function getReportStats() {
  const [basicStats, reasonStats, targetTypeStats] = await Promise.all([
    Report.getStats(),
    Report.getReasonStats(),
    Report.getTargetTypeStats(),
  ]);

  return {
    ...basicStats,
    byReason: reasonStats,
    byTargetType: targetTypeStats,
  };
}

// Check if user has already reported specific target
export async function hasUserReported(userId, targetType, targetId) {
  const existingReport = await Report.findOne({
    reporterId: userId,
    targetType,
    targetId,
  });

  return !!existingReport;
}

// Create new report (for user-facing API)
export async function createReport(reportData, reporterId, req = null) {
  const { targetType, targetId, reason, description = "" } = reportData;

  // Check if user already reported this item
  const hasReported = await hasUserReported(reporterId, targetType, targetId);
  if (hasReported) {
    const error = new Error("You have already reported this item");
    error.status = 400;
    error.code = "DUPLICATE_REPORT";
    throw error;
  }

  // Verify target exists
  let target = null;
  if (targetType === "comment") {
    target = await Comment.findById(targetId);
  } else if (targetType === "recipe") {
    target = await Recipe.findById(targetId);
  }

  if (!target) {
    const error = new Error(`${targetType} not found`);
    error.status = 404;
    error.code = "TARGET_NOT_FOUND";
    throw error;
  }

  const report = await Report.create({
    targetType,
    targetId,
    reason,
    description,
    reporterId,
  });

  // Log audit
  await AuditLog.create({
    action: "create",
    entityType: "system",
    entityId: report._id,
    userId: reporterId,
    userEmail: "user", // Will be populated by controller if available
    userRole: "user",
    metadata: {
      operation: "create_report",
      targetType,
      targetId,
      reason,
      description,
    },
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.("User-Agent"),
  });

  return report;
}

export default {
  listReports,
  getReport,
  resolveReport,
  getReportStats,
  hasUserReported,
  createReport,
};
