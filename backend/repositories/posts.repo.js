// repositories/posts.repo.js
import Post from "../models/Post.js";
import AuditLog from "../models/AuditLog.js";
import mongoose from "mongoose";

/**
 * Get posts with filtering and pagination
 */
export async function getPosts({
  tag,
  userId,
  status = "published",
  page = 1,
  limit = 20,
  sort = "newest",
} = {}) {
  try {
    // Build query
    const query = { status };

    if (tag && tag !== "Tất cả") {
      query.tag = tag;
    }

    if (userId) {
      query.userId = mongoose.Types.ObjectId(userId);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortObj = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    // Execute query with population
    const posts = await Post.find(query)
      .populate("userId", "name email avatar role")
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit) + 1)
      .lean();

    // Check if there are more items
    const hasNext = posts.length > limit;
    if (hasNext) {
      posts.pop(); // Remove the extra item
    }

    return {
      items: posts.map((post) => ({
        ...post,
        id: post._id,
        user: post.userId || null, // Ensure user is null if not populated
      })),
      hasNext,
      total: await Post.countDocuments(query),
    };
  } catch (error) {
    console.error("Get posts repository error:", error);
    throw error;
  }
}

/**
 * Create a new post
 */
export async function createPost(postData, user, request) {
  try {
    const post = new Post({
      content: postData.content,
      tag: postData.tag,
      userId: user._id,
      ipAddress: request?.ip || "",
      userAgent: request?.get("User-Agent") || "",
    });

    const savedPost = await post.save();

    // Populate user data
    await savedPost.populate("userId", "name email avatar role");

    return {
      ...savedPost.toJSON(),
      user: savedPost.userId,
    };
  } catch (error) {
    console.error("Create post repository error:", error);
    throw error;
  }
}

/**
 * Get single post by ID
 */
export async function getPostById(id) {
  try {
    const post = await Post.findById(id)
      .populate("userId", "name email avatar role")
      .lean();

    if (!post) {
      const error = new Error("Bài viết không tồn tại");
      error.status = 404;
      error.code = "POST_NOT_FOUND";
      throw error;
    }

    return {
      ...post,
      id: post._id,
      user: post.userId,
    };
  } catch (error) {
    console.error("Get post by ID repository error:", error);
    throw error;
  }
}

/**
 * Update post
 */
export async function updatePost(id, postData, user) {
  try {
    const post = await Post.findById(id);

    if (!post) {
      const error = new Error("Bài viết không tồn tại");
      error.status = 404;
      error.code = "POST_NOT_FOUND";
      throw error;
    }

    // Check ownership
    if (post.userId.toString() !== user._id.toString()) {
      const error = new Error("Không có quyền chỉnh sửa bài viết này");
      error.status = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    // Update fields
    if (postData.content) post.content = postData.content;
    if (postData.tag) post.tag = postData.tag;

    const updatedPost = await post.save();
    await updatedPost.populate("userId", "name email avatar role");

    return {
      ...updatedPost.toJSON(),
      user: updatedPost.userId,
    };
  } catch (error) {
    console.error("Update post repository error:", error);
    throw error;
  }
}

/**
 * Delete post
 */

/**
 * Toggle like on post
 */
export async function toggleLike(id, user) {
  try {
    const post = await Post.findById(id);

    if (!post) {
      const error = new Error("Bài viết không tồn tại");
      error.status = 404;
      error.code = "POST_NOT_FOUND";
      throw error;
    }

    const isLiked = post.toggleLike(user._id);
    await post.save();

    return {
      isLiked,
      likesCount: post.likesCount,
    };
  } catch (error) {
    console.error("Toggle like repository error:", error);
    throw error;
  }
}

/**
 * Get available tags
 */
export async function getTags() {
  try {
    return Post.getTags();
  } catch (error) {
    console.error("Get tags repository error:", error);
    throw error;
  }
}

// ==================== ADMIN FUNCTIONS ====================

/**
 * List posts for admin with advanced filtering
 */
export async function listPostsForAdmin(query = {}) {
  const { status, tag, cursor, limit = 20, sort = "newest" } = query;

  // Build filter
  const filter = {};

  if (status && ["pending", "published", "hidden"].includes(status)) {
    filter.status = status;
  }

  if (tag && Post.getTags().includes(tag)) {
    filter.tag = tag;
  }

  // Cursor pagination
  if (cursor) {
    try {
      const cursorDoc = await Post.findById(cursor);
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
  let sortQuery = { createdAt: -1 };
  if (sort === "oldest") {
    sortQuery = { createdAt: 1 };
  } else if (sort === "most_liked") {
    sortQuery = { likesCount: -1, createdAt: -1 };
  } else if (sort === "most_commented") {
    sortQuery = { commentsCount: -1, createdAt: -1 };
  }

  // Query with pagination (fetch one extra to check hasNext)
  let items = await Post.find(filter)
    .populate("userId", "name email avatar role")
    .populate("moderatedBy", "name email")
    .sort(sortQuery)
    .limit(Number(limit) + 1);

  const hasNext = items.length > Number(limit);
  if (hasNext) items.pop();

  return {
    items: items.map((post) => {
      const postData = post.toJSON();
      return {
        ...postData,
        id: post._id.toString(),
        _id: post._id.toString(), // Ensure both are available
        user: post.userId, // This is already populated
        moderatedBy: post.moderatedBy,
      };
    }),
    hasNext,
    nextCursor:
      hasNext && items.length > 0 ? items[items.length - 1]._id : null,
  };
}

/**
 * Update post status (admin only)
 */
export async function updatePostStatus(
  id,
  status,
  adminId,
  moderationNote = ""
) {
  try {
    const updateData = {
      status,
      moderatedBy: adminId,
      moderatedAt: new Date(),
      updatedAt: new Date(),
    };

    if (moderationNote) {
      updateData.moderationNote = moderationNote;
    }

    // Log audit for status update
    const post = await Post.findById(id);
    if (post) {
      await AuditLog.create({
        action: "update",
        entityType: "post",
        entityId: id,
        userId: adminId,
        userEmail: "admin",
        userRole: "admin",
        metadata: {
          operation: "update_post_status",
          originalStatus: post.status,
          newStatus: status,
          moderationNote: moderationNote || "",
        },
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("userId", "name email avatar role")
      .populate("moderatedBy", "name email")
      .lean();

    return updatedPost;
  } catch (error) {
    console.error("Update post status repository error:", error);
    throw error;
  }
}

/**
 * Moderate a post (approve/reject/hide)
 */
export async function moderatePost(id, action, adminId, note = "", req = null) {
  try {
    const post = await Post.findById(id);
    if (!post) {
      const error = new Error("Post not found");
      error.status = 404;
      error.code = "POST_NOT_FOUND";
      throw error;
    }

    let newStatus;
    switch (action) {
      case "approve":
        newStatus = "published";
        break;
      case "reject":
        newStatus = "hidden";
        break;
      case "hide":
        newStatus = "hidden";
        break;
      default:
        throw new Error("Invalid moderation action");
    }

    const updateData = {
      status: newStatus,
      moderatedBy: adminId,
      moderatedAt: new Date(),
      moderationNote: note,
      updatedAt: new Date(),
    };

    const updatedPost = await Post.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("userId", "name email avatar role")
      .populate("moderatedBy", "name email")
      .lean();

    // Log audit
    await AuditLog.create({
      action: "update",
      entityType: "post",
      entityId: id,
      userId: adminId,
      userEmail: "admin",
      userRole: "admin",
      metadata: {
        operation: "moderate_post",
        action,
        originalStatus: post.status,
        newStatus,
        note: note || "",
      },
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get?.("User-Agent"),
    });

    return updatedPost;
  } catch (error) {
    console.error("Moderate post repository error:", error);
    throw error;
  }
}

/**
 * Get post statistics for admin
 */
export async function getPostStats() {
  try {
    const [basicStats, tagStats, statusStats] = await Promise.all([
      Post.getStats(),
      Post.getTagStats(),
      Post.getStatusStats(),
    ]);

    return {
      ...basicStats,
      byTag: tagStats,
      byStatus: statusStats,
    };
  } catch (error) {
    console.error("Get post stats repository error:", error);
    throw error;
  }
}

/**
 * Delete post (admin version with audit)
 */
export async function deletePost(id, user, req = null) {
  try {
    const post = await Post.findById(id);
    if (!post) {
      const error = new Error("Post not found");
      error.status = 404;
      error.code = "POST_NOT_FOUND";
      throw error;
    }

    await Post.deleteOne({ _id: id });

    // Log audit
    await AuditLog.create({
      action: "delete",
      entityType: "post",
      entityId: id,
      userId: user._id || user.id,
      userEmail: user.email,
      userRole: user.role,
      metadata: {
        operation: "delete_post",
        postAuthor: post.userId,
        postContent: post.content.substring(0, 100),
        postTag: post.tag,
        postStatus: post.status,
      },
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get?.("User-Agent"),
    });

    return { deleted: true };
  } catch (error) {
    console.error("Delete post repository error:", error);
    throw error;
  }
}
