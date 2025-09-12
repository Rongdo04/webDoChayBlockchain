// repositories/comments.repo.js
import Comment from "../models/Comment.js";
import Recipe from "../models/Recipe.js";
import AuditLog from "../models/AuditLog.js";
import mongoose from "mongoose";

// Helper function to update recipe rating statistics
async function updateRecipeRating(recipeId) {
  const stats = await Comment.getRecipeRatingStats(recipeId);

  await Recipe.findByIdAndUpdate(recipeId, {
    ratingAvg: stats.avgRating,
    ratingCount: stats.totalRatings,
  });

  return stats;
}

// List comments with filtering and pagination (cursor-based for public API)
export async function listComments(query = {}) {
  const {
    status,
    recipeId,
    cursor,
    limit = 20,
    sort = "createdAt",
    order = "desc",
    // Add page-based pagination support
    page,
  } = query;

  // If page is provided, use page-based pagination for admin
  if (page) {
    return await listCommentsWithPagePagination(query);
  }

  // Original cursor-based pagination logic for public API
  // Build filter
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (recipeId) {
    filter.recipeId = recipeId;
  }

  // Cursor pagination
  if (cursor) {
    const sortOrder = order === "desc" ? "$lt" : "$gt";
    filter._id = { [sortOrder]: cursor };
  }

  // Build sort
  const sortField = sort === "createdAt" ? "createdAt" : sort;
  const sortDirection = order === "desc" ? -1 : 1;
  const sortQuery = { [sortField]: sortDirection, _id: sortDirection };

  // Query with pagination (fetch one extra to check hasNext)
  const items = await Comment.find(filter)
    .populate("userId", "name email avatar")
    .populate("recipeId", "title slug")
    .populate("moderatedBy", "name email")
    .sort(sortQuery)
    .limit(Number(limit) + 1);

  const hasNext = items.length > Number(limit);
  if (hasNext) items.pop();

  return {
    items,
    pageInfo: {
      nextCursor: items.length > 0 ? items[items.length - 1]._id : null,
      hasNext,
    },
    total: await Comment.countDocuments(filter),
  };
}

// List comments with page-based pagination (for admin)
export async function listCommentsWithPagePagination(query = {}) {
  const {
    status,
    recipeId,
    page = 1,
    limit = 20,
    sort = "createdAt",
    order = "desc",
  } = query;

  // Build filter
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (recipeId) {
    filter.recipeId = recipeId;
  }

  // Build sort
  const sortField = sort === "createdAt" ? "createdAt" : sort;
  const sortDirection = order === "desc" ? -1 : 1;
  const sortQuery = { [sortField]: sortDirection, _id: sortDirection };

  // Page-based pagination
  const skip = (Number(page) - 1) * Number(limit);
  const totalCount = await Comment.countDocuments(filter);
  const totalPages = Math.ceil(totalCount / Number(limit));

  // Query with page-based pagination
  const items = await Comment.find(filter)
    .populate("userId", "name email avatar")
    .populate("recipeId", "title slug")
    .populate("moderatedBy", "name email")
    .sort(sortQuery)
    .skip(skip)
    .limit(Number(limit));

  return {
    items,
    pageInfo: {
      page: Number(page),
      totalPages,
      hasNext: Number(page) < totalPages,
      hasPrev: Number(page) > 1,
    },
    total: totalCount,
  };
}

// Create a new comment
export async function create(commentData) {
  const comment = new Comment(commentData);
  await comment.save();

  // Populate user and recipe data before returning
  await comment.populate([
    { path: "userId", select: "name email avatar" },
    { path: "recipeId", select: "title slug" },
  ]);

  return comment;
}

// Get single comment
export async function getComment(id) {
  return await Comment.findById(id)
    .populate("userId", "name email avatar")
    .populate("recipeId", "title slug")
    .populate("moderatedBy", "name email");
}

// Approve comment
export async function approveComment(id, user, req = null) {
  const comment = await Comment.findById(id);
  if (!comment) {
    const error = new Error("Comment not found");
    error.status = 404;
    error.code = "COMMENT_NOT_FOUND";
    throw error;
  }

  // Update comment status
  comment.status = "approved";
  comment.moderatedBy = user._id || user.id;
  comment.moderatedAt = new Date();

  const updated = await comment.save();

  // Update recipe rating if comment has rating
  let ratingStats = null;
  if (comment.hasRating()) {
    ratingStats = await updateRecipeRating(comment.recipeId);
  }

  // Log audit
  await AuditLog.create({
    action: "update",
    entityType: "system",
    entityId: id,
    userId: user._id || user.id,
    userEmail: user.email,
    userRole: user.role,
    metadata: {
      operation: "approve_comment",
      recipeId: comment.recipeId,
      hasRating: comment.hasRating(),
      rating: comment.rating,
      ratingStats,
    },
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.("User-Agent"),
  });

  return updated;
}

// Hide comment
export async function hideComment(id, user, reason = null, req = null) {
  const comment = await Comment.findById(id);
  if (!comment) {
    const error = new Error("Comment not found");
    error.status = 404;
    error.code = "COMMENT_NOT_FOUND";
    throw error;
  }

  const wasApproved = comment.status === "approved";
  const hadRating = comment.hasRating();

  // Update comment status
  comment.status = "hidden";
  comment.moderatedBy = user._id || user.id;
  comment.moderatedAt = new Date();
  comment.moderationReason = reason;

  const updated = await comment.save();

  // Update recipe rating if comment was approved and had rating
  let ratingStats = null;
  if (wasApproved && hadRating) {
    ratingStats = await updateRecipeRating(comment.recipeId);
  }

  // Log audit
  await AuditLog.create({
    action: "update",
    entityType: "system",
    entityId: id,
    userId: user._id || user.id,
    userEmail: user.email,
    userRole: user.role,
    metadata: {
      operation: "hide_comment",
      recipeId: comment.recipeId,
      reason,
      wasApproved,
      hadRating,
      rating: comment.rating,
      ratingStats,
    },
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.("User-Agent"),
  });

  return updated;
}

// Bulk operations
export async function bulkUpdateComments(
  ids,
  action,
  user,
  reason = null,
  req = null
) {
  // Validate action
  if (!["approve", "hide"].includes(action)) {
    const error = new Error("Invalid action");
    error.status = 400;
    error.code = "INVALID_ACTION";
    throw error;
  }

  // Validate IDs
  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) {
    const error = new Error("No valid comment IDs provided");
    error.status = 400;
    error.code = "INVALID_IDS";
    throw error;
  }

  // Get comments to update
  const comments = await Comment.find({ _id: { $in: validIds } });

  if (comments.length === 0) {
    const error = new Error("No comments found");
    error.status = 404;
    error.code = "COMMENTS_NOT_FOUND";
    throw error;
  }

  const results = {
    successful: [],
    failed: [],
    updatedRecipes: new Set(),
  };

  // Process each comment
  for (const comment of comments) {
    try {
      const wasApproved = comment.status === "approved";
      const hadRating = comment.hasRating();

      // Update comment
      comment.status = action === "approve" ? "approved" : "hidden";
      comment.moderatedBy = user._id || user.id;
      comment.moderatedAt = new Date();

      if (action === "hide" && reason) {
        comment.moderationReason = reason;
      }

      await comment.save();

      // Track recipe for rating update
      if (
        comment.hasRating() &&
        (action === "approve" || (action === "hide" && wasApproved))
      ) {
        results.updatedRecipes.add(comment.recipeId.toString());
      }

      results.successful.push({
        id: comment._id,
        recipeId: comment.recipeId,
        hadRating,
        wasApproved,
      });
    } catch (error) {
      results.failed.push({
        id: comment._id,
        error: error.message,
      });
    }
  }

  // Update recipe ratings for affected recipes
  const ratingUpdates = {};
  for (const recipeId of results.updatedRecipes) {
    try {
      const stats = await updateRecipeRating(recipeId);
      ratingUpdates[recipeId] = stats;
    } catch (error) {
      console.error(`Failed to update recipe rating for ${recipeId}:`, error);
    }
  }

  // Log audit
  await AuditLog.create({
    action: "bulk",
    entityType: "system",
    entityId: null,
    userId: user._id || user.id,
    userEmail: user.email,
    userRole: user.role,
    metadata: {
      operation: `bulk_${action}_comments`,
      requestedIds: validIds,
      successful: results.successful.length,
      failed: results.failed.length,
      updatedRecipes: Array.from(results.updatedRecipes),
      ratingUpdates,
      reason: action === "hide" ? reason : null,
    },
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.("User-Agent"),
  });

  return {
    successful: results.successful.length,
    failed: results.failed.length,
    results: results.successful,
    errors: results.failed,
    updatedRecipes: ratingUpdates,
  };
}

// Get comment statistics
export async function getCommentStats() {
  const stats = await Comment.getStats();

  // Get recent activity (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const recentStats = await Comment.aggregate([
    {
      $match: {
        createdAt: { $gte: weekAgo },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const recent = {
    pending: 0,
    approved: 0,
    hidden: 0,
    total: 0,
  };

  recentStats.forEach((stat) => {
    recent[stat._id] = stat.count;
    recent.total += stat.count;
  });

  return {
    ...stats,
    recent,
  };
}

// Delete comment permanently
export async function deleteComment(commentId, user = null, req = null) {
  try {
    console.log("🗑️ Attempting to delete comment:", commentId);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      console.log("❌ Invalid ObjectId format:", commentId);
      throw new Error("Invalid comment ID format");
    }

    const comment = await Comment.findById(commentId);
    console.log("🔍 Found comment:", comment ? "Yes" : "No");

    if (!comment) {
      console.log("❌ Comment not found in database");
      return null;
    }

    // Store recipe ID for rating update
    const recipeId = comment.recipeId;
    const hadRating = comment.rating !== null && comment.rating !== undefined;

    console.log("🔄 Deleting comment from database...");
    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // Update recipe rating if comment had rating
    if (hadRating) {
      console.log("📊 Updating recipe rating...");
      await updateRecipeRating(recipeId);
    }

    console.log("📝 Creating audit log...");

    // Ensure we have valid user info for audit log
    let auditUserId = user?.id || user?._id;
    let auditUserEmail = user?.email || "system@admin.com";
    let auditUserRole = user?.role || "admin";

    // If no user provided, try to create a system ObjectId or use a default admin
    if (!auditUserId) {
      // Create a temporary ObjectId for system operations
      auditUserId = new mongoose.Types.ObjectId("000000000000000000000001");
    }

    console.log("📝 Audit info:", {
      auditUserId,
      auditUserEmail,
      auditUserRole,
    });

    // Create audit log
    await AuditLog.create({
      action: "delete",
      entityType: "comment",
      entityId: commentId,
      userId: auditUserId,
      userEmail: auditUserEmail,
      userRole: auditUserRole,
      metadata: {
        recipeId: recipeId,
        hadRating: hadRating,
        originalContent: comment.content.slice(0, 100) + "...",
        userAgent: req?.get("User-Agent") || "Unknown",
        ip: req?.ip || "Unknown",
      },
    });

    console.log("✅ Comment deleted successfully");
    return { id: commentId };
  } catch (error) {
    console.error("❌ Error deleting comment:", error);
    throw new Error("Failed to delete comment: " + error.message);
  }
}

export default {
  listComments,
  getComment,
  approveComment,
  hideComment,
  deleteComment,
  bulkUpdateComments,
  getCommentStats,
};
