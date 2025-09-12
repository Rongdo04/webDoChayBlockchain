// repositories/posts.repo.js
import Post from "../models/Post.js";
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
        user: post.userId,
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
export async function deletePost(id, user) {
  try {
    const post = await Post.findById(id);

    if (!post) {
      const error = new Error("Bài viết không tồn tại");
      error.status = 404;
      error.code = "POST_NOT_FOUND";
      throw error;
    }

    // Check ownership or admin role
    if (
      post.userId.toString() !== user._id.toString() &&
      user.role !== "admin"
    ) {
      const error = new Error("Không có quyền xóa bài viết này");
      error.status = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    await Post.findByIdAndDelete(id);
    return true;
  } catch (error) {
    console.error("Delete post repository error:", error);
    throw error;
  }
}

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
