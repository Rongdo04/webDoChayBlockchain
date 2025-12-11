// pages/admin/Posts.jsx
import React, { useState, useEffect } from "react";
import { useAdminApi } from "../contexts/AdminApiContext";
import { toast } from "react-toastify";

const Posts = () => {
  const {
    getPosts,
    updatePostStatus,
    deletePost,
    getPostsStats,
    moderatePost,
  } = useAdminApi();
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(new Set());
  const [filters, setFilters] = useState({
    status: "",
    tag: "",
    search: "",
    page: 1,
  });

  // Status options
  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ duyệt" },
    { value: "published", label: "Đã xuất bản" },
    { value: "hidden", label: "Đã ẩn" },
  ];

  // Tag options
  const tagOptions = [
    { value: "", label: "Tất cả tag" },
    { value: "Kinh nghiệm", label: "Kinh nghiệm" },
    { value: "Hỏi đáp", label: "Hỏi đáp" },
    { value: "Món mới", label: "Món mới" },
    { value: "Chia sẻ", label: "Chia sẻ" },
    { value: "Tư vấn", label: "Tư vấn" },
  ];

  // Status styles
  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      published: "bg-green-100 text-green-800 border-green-200",
      hidden: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Status labels
  const getStatusLabel = (status) => {
    const labels = {
      pending: "Chờ duyệt",
      published: "Đã xuất bản",
      hidden: "Đã ẩn",
    };
    return labels[status] || status || "Không có trạng thái";
  };

  // Tag styles
  const getTagStyle = (tag) => {
    const styles = {
      "Kinh nghiệm": "bg-blue-100 text-blue-800",
      "Hỏi đáp": "bg-purple-100 text-purple-800",
      "Món mới": "bg-orange-100 text-orange-800",
      "Chia sẻ": "bg-green-100 text-green-800",
      "Tư vấn": "bg-pink-100 text-pink-800",
    };
    return styles[tag] || "bg-gray-100 text-gray-800";
  };

  // Load posts
  const loadPosts = async () => {
    try {
      setLoading(true);
      console.log("Loading posts with filters:", filters);
      const response = await getPosts(filters);
      console.log("Posts response:", response);
      const posts = response.data?.items || response.items || [];
      console.log(
        "Posts data structure:",
        posts.length > 0 ? posts[0] : "No posts"
      );

      // Debug: Check for posts with missing content
      posts.forEach((post, index) => {
        if (!post.content) {
          console.warn(`Post ${index} has no content:`, post);
        }
        if (!post.user) {
          console.warn(`Post ${index} has no user:`, post);
        }
        if (!post.tag) {
          console.warn(`Post ${index} has no tag:`, post);
        }
        if (!post.status) {
          console.warn(`Post ${index} has no status:`, post);
        }
      });

      setPosts(posts);
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Lỗi khi tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      console.log("Loading stats...");
      const response = await getPostsStats();
      console.log("Stats response:", response);
      setStats(response.data || response);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // Update post status
  const handleUpdateStatus = async (postId, newStatus, moderationNote = "") => {
    if (updating.has(postId)) return;

    try {
      setUpdating((prev) => new Set(prev).add(postId));

      const apiResponse = await updatePostStatus(
        postId,
        newStatus,
        moderationNote
      );

      console.log("Updated post from API:", apiResponse);

      // Update local state with the updated post data
      setPosts((prev) => {
        console.log(
          "Posts before update:",
          prev.find((p) => (p.id || p._id) === postId)
        );
        const newPosts = prev.map((post) => {
          if ((post.id || post._id) === postId) {
            const updatedPost = {
              ...post,
              status: newStatus,
              moderatedAt: new Date().toISOString(),
              moderatedBy: apiResponse.moderatedBy || post.moderatedBy,
              moderationNote: moderationNote || post.moderationNote,
            };
            console.log("Updated post in state:", updatedPost);
            return updatedPost;
          }
          return post;
        });
        console.log(
          "Posts after update:",
          newPosts.find((p) => (p.id || p._id) === postId)
        );
        return newPosts;
      });

      toast.success("Cập nhật trạng thái thành công");

      // Reload stats
      loadStats();
    } catch (error) {
      console.error("Error updating post status:", error);
      toast.error("Lỗi khi cập nhật trạng thái");
    } finally {
      setUpdating((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  // Moderate post
  const handleModerate = async (postId, action, note = "") => {
    if (updating.has(postId)) return;

    try {
      setUpdating((prev) => new Set(prev).add(postId));

      const apiResult = await moderatePost(postId, action, note);

      console.log("Moderated post from API:", apiResult);

      // Update local state with the moderated post data
      setPosts((prev) => {
        console.log(
          "Posts before moderation:",
          prev.find((p) => (p.id || p._id) === postId)
        );
        const newPosts = prev.map((post) => {
          if ((post.id || post._id) === postId) {
            const updatedPost = {
              ...post,
              status: action === "approve" ? "published" : "hidden",
              moderatedAt: new Date().toISOString(),
              moderatedBy: apiResult.moderatedBy || post.moderatedBy,
              moderationNote: note || post.moderationNote,
            };
            console.log("Moderated post in state:", updatedPost);
            return updatedPost;
          }
          return post;
        });
        console.log(
          "Posts after moderation:",
          newPosts.find((p) => (p.id || p._id) === postId)
        );
        return newPosts;
      });

      toast.success(
        `Bài viết đã được ${action === "approve" ? "duyệt" : "từ chối"}`
      );

      // Reload stats
      loadStats();
    } catch (error) {
      console.error("Error moderating post:", error);
      toast.error("Lỗi khi duyệt bài viết");
    } finally {
      setUpdating((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  // Delete post
  const handleDelete = async (postId) => {
    console.log("Delete post called with ID:", postId);
    console.log(
      "Post data:",
      posts.find((p) => (p.id || p._id) === postId)
    );

    if (!postId) {
      console.error("Post ID is undefined");
      toast.error("Lỗi: Không tìm thấy ID bài viết");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;

    try {
      console.log("Calling deletePost API with ID:", postId);
      await deletePost(postId);
      setPosts((prev) =>
        prev.filter((post) => (post.id || post._id) !== postId)
      );
      toast.success("Xóa bài viết thành công");
      loadStats();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Lỗi khi xóa bài viết");
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset page when filter changes
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Không có ngày";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Ngày không hợp lệ";
    }
  };

  // Truncate content
  const truncateContent = (content, maxLength = 100) => {
    if (!content || typeof content !== "string") return "";
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Load data on mount and filter changes
  useEffect(() => {
    loadPosts();
  }, [filters]);

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Quản lý bài viết
        </h1>
        <p className="text-gray-600">
          Xem và quản lý các bài viết trong cộng đồng
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Tổng số</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.total || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Chờ duyệt</div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Đã xuất bản</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.published || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Tuần này</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.recent || 0}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag
            </label>
            <select
              value={filters.tag}
              onChange={(e) => handleFilterChange("tag", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tagOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Tìm theo nội dung bài viết..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không có bài viết nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tác giả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nội dung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tương tác
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id || post._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          {post.user?.avatar ? (
                            <img
                              src={post.user.avatar}
                              alt={post.user.name || "User"}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {(post.user?.name || "U").charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {post.user?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {post.user?.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {truncateContent(post.content) || "Không có nội dung"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getTagStyle(
                          post.tag
                        )}`}
                      >
                        {post.tag || "Không có tag"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyle(
                          post.status
                        )}`}
                      >
                        {getStatusLabel(post.status) || "Không có trạng thái"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <span>
                          👍 {post.likesCount || post.likes?.length || 0}
                        </span>
                        <span>💬 {post.commentsCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {post.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleModerate(post.id || post._id, "approve")
                              }
                              disabled={updating.has(post.id || post._id)}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() =>
                                handleModerate(post.id || post._id, "reject")
                              }
                              disabled={updating.has(post.id || post._id)}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              Từ chối
                            </button>
                          </>
                        )}

                        {post.status === "published" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(post.id || post._id, "hidden")
                            }
                            disabled={updating.has(post.id || post._id)}
                            className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                          >
                            Ẩn
                          </button>
                        )}

                        {post.status === "hidden" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                post.id || post._id,
                                "published"
                              )
                            }
                            disabled={updating.has(post.id || post._id)}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            Hiện
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(post.id || post._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;
