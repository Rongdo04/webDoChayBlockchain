// hooks/usePosts.js
import { useState, useEffect, useCallback } from "react";
import { postsAPI } from "../services/postsAPI";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

export const usePosts = (initialFilters = {}) => {
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    tag: "Tất cả",
    page: 1,
    limit: 20,
    ...initialFilters,
  });
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(0);

  // Load posts
  const loadPosts = useCallback(
    async (resetPosts = false) => {
      try {
        setLoading(true);
        setError(null);

        const response = await postsAPI.getPosts(filters);

        if (resetPosts || filters.page === 1) {
          setPosts(response.items || []);
        } else {
          setPosts((prev) => [...prev, ...(response.items || [])]);
        }

        setHasNext(response.hasNext || false);
        setTotal(response.total || 0);
      } catch (err) {
        console.error("Error loading posts:", err);
        setError("Lỗi khi tải bài viết");
        toast.error("Lỗi khi tải bài viết");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Create new post
  const createPost = useCallback(
    async (postData) => {
      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để tạo bài viết");
        return null;
      }

      try {
        const newPost = await postsAPI.createPost({
          ...postData,
          userId: user.id,
        });

        // Add to the beginning of the list
        setPosts((prev) => [newPost, ...prev]);
        setTotal((prev) => prev + 1);

        toast.success("Tạo bài viết thành công!");
        return newPost;
      } catch (err) {
        console.error("Error creating post:", err);
        const errorMessage =
          err.response?.data?.error?.message || "Lỗi khi tạo bài viết";
        toast.error(errorMessage);
        throw err;
      }
    },
    [isAuthenticated, user]
  );

  // Update post
  const updatePost = useCallback(
    async (postId, postData) => {
      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để cập nhật bài viết");
        return null;
      }

      try {
        const updatedPost = await postsAPI.updatePost(postId, postData);

        setPosts((prev) =>
          prev.map((post) => (post.id === postId ? updatedPost : post))
        );

        toast.success("Cập nhật bài viết thành công!");
        return updatedPost;
      } catch (err) {
        console.error("Error updating post:", err);
        const errorMessage =
          err.response?.data?.error?.message || "Lỗi khi cập nhật bài viết";
        toast.error(errorMessage);
        throw err;
      }
    },
    [isAuthenticated]
  );

  // Delete post
  const deletePost = useCallback(
    async (postId) => {
      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để xóa bài viết");
        return false;
      }

      try {
        await postsAPI.deletePost(postId);

        setPosts((prev) => prev.filter((post) => post.id !== postId));
        setTotal((prev) => prev - 1);

        toast.success("Xóa bài viết thành công!");
        return true;
      } catch (err) {
        console.error("Error deleting post:", err);
        const errorMessage =
          err.response?.data?.error?.message || "Lỗi khi xóa bài viết";
        toast.error(errorMessage);
        return false;
      }
    },
    [isAuthenticated]
  );

  // Toggle like
  const toggleLike = useCallback(
    async (postId) => {
      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để thích bài viết");
        return false;
      }

      try {
        const result = await postsAPI.toggleLike(postId);

        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likesCount: result.likesCount,
                  isLiked: result.isLiked,
                }
              : post
          )
        );

        return result.isLiked;
      } catch (err) {
        console.error("Error toggling like:", err);
        toast.error("Lỗi khi thích bài viết");
        return false;
      }
    },
    [isAuthenticated]
  );

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.tag !== prev.tag ? 1 : prev.page, // Reset page if tag changes
    }));
  }, []);

  // Load more posts (pagination)
  const loadMore = useCallback(() => {
    if (!loading && hasNext) {
      setFilters((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [loading, hasNext]);

  // Refresh posts
  const refresh = useCallback(() => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Load posts when filters change
  useEffect(() => {
    loadPosts(filters.page === 1);
  }, [loadPosts]);

  return {
    posts,
    loading,
    error,
    filters,
    hasNext,
    total,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    updateFilters,
    loadMore,
    refresh,
  };
};
