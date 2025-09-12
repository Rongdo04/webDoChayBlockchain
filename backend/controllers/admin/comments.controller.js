// controllers/admin/comments.controller.js
import commentsRepo from "../../repositories/comments.repo.js";

// List comments with filtering and pagination
export const listComments = async (req, res) => {
  try {
    const result = await commentsRepo.listComments(req.query);

    // Check if it's page-based pagination (for admin) or cursor-based (for public)
    if (req.query.page) {
      // Page-based response for admin
      res.json({
        success: true,
        data: result.items,
        pagination: {
          page: result.pageInfo.page,
          totalPages: result.pageInfo.totalPages,
          hasNext: result.pageInfo.hasNext,
          hasPrev: result.pageInfo.hasPrev,
          total: result.total,
        },
      });
    } else {
      // Cursor-based response for public API
      res.json({
        success: true,
        data: result.items,
        pagination: {
          nextCursor: result.pageInfo.nextCursor,
          hasNext: result.pageInfo.hasNext,
          total: result.total,
        },
      });
    }
  } catch (error) {
    console.error("List comments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
};

// Get single comment
export const getComment = async (req, res) => {
  try {
    const comment = await commentsRepo.getComment(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("Get comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comment",
      error: error.message,
    });
  }
};

// Approve comment
export const approveComment = async (req, res) => {
  try {
    const comment = await commentsRepo.approveComment(
      req.params.id,
      req.user,
      req
    );

    res.json({
      success: true,
      message: "Comment approved successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Approve comment error:", error);

    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        code: error.code,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to approve comment",
      error: error.message,
    });
  }
};

// Hide comment
export const hideComment = async (req, res) => {
  try {
    const { reason } = req.body;

    const comment = await commentsRepo.hideComment(
      req.params.id,
      req.user,
      reason,
      req
    );

    res.json({
      success: true,
      message: "Comment hidden successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Hide comment error:", error);

    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        code: error.code,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to hide comment",
      error: error.message,
    });
  }
};

// Bulk operations on comments
export const bulkComments = async (req, res) => {
  try {
    const { ids, action, reason } = req.body;

    const result = await commentsRepo.bulkUpdateComments(
      ids,
      action,
      req.user,
      reason,
      req
    );

    res.json({
      success: true,
      message: `Bulk ${action} completed`,
      data: {
        successful: result.successful,
        failed: result.failed,
        results: result.results,
        errors: result.errors,
        updatedRecipes: result.updatedRecipes,
      },
    });
  } catch (error) {
    console.error("Bulk comments error:", error);

    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        code: error.code,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to perform bulk operation",
      error: error.message,
    });
  }
};

// Get comment statistics
export const getCommentStats = async (req, res) => {
  try {
    const stats = await commentsRepo.getCommentStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get comment stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comment statistics",
      error: error.message,
    });
  }
};

// Delete comment permanently
export const deleteComment = async (req, res) => {
  try {
    const deleted = await commentsRepo.deleteComment(
      req.params.id,
      req.user,
      req
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    res.json({
      success: true,
      message: "Comment deleted successfully",
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};

export default {
  listComments,
  getComment,
  approveComment,
  hideComment,
  deleteComment,
  bulkComments,
  getCommentStats,
};
