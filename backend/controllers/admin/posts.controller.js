// controllers/admin/posts.controller.js
import * as postsRepo from "../../repositories/posts.repo.js";

// GET /api/admin/posts - List posts with filtering and pagination
export async function listPosts(req, res) {
  try {
    const result = await postsRepo.listPostsForAdmin(req.query);

    console.log("Admin posts result:", {
      itemsCount: result.items?.length || 0,
      firstItem: result.items?.[0] || null,
      hasNext: result.hasNext,
    });

    res.json({
      success: true,
      data: {
        items: result.items,
        pagination: {
          hasNext: result.hasNext,
          nextCursor: result.nextCursor,
        },
      },
    });
  } catch (error) {
    console.error("List posts error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// GET /api/admin/posts/:id - Get single post with full details
export async function getPost(req, res) {
  try {
    const { id } = req.params;
    const post = await postsRepo.getPostById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: {
          code: "POST_NOT_FOUND",
          message: "Post not found",
        },
      });
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Get post error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// PUT /api/admin/posts/:id/status - Update post status
export async function updatePostStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, moderationNote } = req.body;

    const updatedPost = await postsRepo.updatePostStatus(
      id,
      status,
      req.user?._id,
      moderationNote
    );

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        error: {
          code: "POST_NOT_FOUND",
          message: "Post not found",
        },
      });
    }

    res.json({
      success: true,
      data: updatedPost,
      message: `Trạng thái bài viết đã được cập nhật: ${status}`,
    });
  } catch (error) {
    console.error("Update post status error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// DELETE /api/admin/posts/:id - Delete a post
export async function deletePost(req, res) {
  try {
    const { id } = req.params;
    console.log("Delete post request:", { id, userId: req.user?._id });

    const result = await postsRepo.deletePost(id, req.user, req);

    res.json({
      success: true,
      data: { id, ...result },
      message: "Bài viết đã được xóa",
    });
  } catch (error) {
    console.error("Delete post error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// GET /api/admin/posts/stats - Get post statistics
export async function getPostStats(req, res) {
  try {
    const stats = await postsRepo.getPostStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get post stats error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// POST /api/admin/posts/:id/moderate - Moderate a post
export async function moderatePost(req, res) {
  try {
    const { id } = req.params;
    const { action, note } = req.body;

    const result = await postsRepo.moderatePost(
      id,
      action,
      req.user?._id,
      note,
      req
    );

    res.json({
      success: true,
      data: result,
      message: `Bài viết đã được ${action === "approve" ? "duyệt" : "từ chối"}`,
    });
  } catch (error) {
    console.error("Moderate post error:", error);

    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

export default {
  listPosts,
  getPost,
  updatePostStatus,
  deletePost,
  getPostStats,
  moderatePost,
};
