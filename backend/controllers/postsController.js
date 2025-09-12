// controllers/postsController.js
import * as postsRepo from "../repositories/posts.repo.js";

// GET /api/posts - Get community posts
export async function getPosts(req, res) {
  try {
    const { tag, page = 1, limit = 20, sort = "newest" } = req.query;

    const posts = await postsRepo.getPosts({
      tag,
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
    });

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// POST /api/posts - Create new post
export async function createPost(req, res) {
  try {
    const { content, tag } = req.body;

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Nội dung bài viết không được để trống",
        },
      });
    }

    if (!tag) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Tag không được để trống",
        },
      });
    }

    const post = await postsRepo.createPost(
      { content: content.trim(), tag },
      req.user,
      req
    );

    res.status(201).json({
      success: true,
      data: post,
      message: "Tạo bài viết thành công",
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// GET /api/posts/:id - Get single post
export async function getPost(req, res) {
  try {
    const { id } = req.params;

    const post = await postsRepo.getPostById(id);

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

// PUT /api/posts/:id - Update post
export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { content, tag } = req.body;

    const post = await postsRepo.updatePost(
      id,
      { content: content?.trim(), tag },
      req.user
    );

    res.json({
      success: true,
      data: post,
      message: "Cập nhật bài viết thành công",
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// DELETE /api/posts/:id - Delete post
export async function deletePost(req, res) {
  try {
    const { id } = req.params;

    await postsRepo.deletePost(id, req.user);

    res.json({
      success: true,
      message: "Xóa bài viết thành công",
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

// POST /api/posts/:id/like - Toggle like on post
export async function toggleLike(req, res) {
  try {
    const { id } = req.params;

    const result = await postsRepo.toggleLike(id, req.user);

    res.json({
      success: true,
      data: result,
      message: result.isLiked ? "Đã thích bài viết" : "Đã bỏ thích bài viết",
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}

// GET /api/posts/tags - Get available tags
export async function getTags(req, res) {
  try {
    const tags = await postsRepo.getTags();

    res.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "Internal server error",
      },
    });
  }
}
