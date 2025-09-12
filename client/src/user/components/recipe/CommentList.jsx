import React, { useState, useEffect, useRef, useCallback } from "react";
import { commentsAPI } from "../../../services/commentsAPI.js";
import { useAuthAdapter } from "../../../auth/useAuthAdapter.js";
import Toast from "../Toast.jsx";

export default function CommentList({ recipeId, recipe, initial = [] }) {
  const [comments, setComments] = useState(initial);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [pagination, setPagination] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    type: "info",
    message: "",
  });
  const { user, isAuthenticated } = useAuthAdapter();

  // Dùng ref để tránh stale closure và kiểm soát loading state
  const currentRecipeIdRef = useRef(recipeId);
  const isLoadingRef = useRef(false);
  const lastRecipeIdRef = useRef(null);
  const lastLoadTimeRef = useRef(0);

  // Update ref khi recipeId thay đổi
  useEffect(() => {
    currentRecipeIdRef.current = recipeId;
  }, [recipeId]);

  const loadComments = useCallback(
    async (loadMore = false, currentPagination = null) => {
      const targetRecipeId = currentRecipeIdRef.current;
      const now = Date.now();

      // Kiểm tra các điều kiện để tránh infinite loop
      if (!targetRecipeId || isLoadingRef.current) {
        return;
      }

      // Rate limiting: không cho phép gọi API quá 1 lần trong 500ms
      if (!loadMore && now - lastLoadTimeRef.current < 500) {
        return;
      }

      // Tránh load lại nếu đã load cho recipe này rồi (trừ khi là load more)
      if (!loadMore && lastRecipeIdRef.current === targetRecipeId) {
        return;
      }

      try {
        isLoadingRef.current = true;
        if (!loadMore) {
          lastLoadTimeRef.current = now;
        }

        if (loadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setComments([]); // Clear when fresh load
          setPagination(null); // Reset pagination for fresh load
          lastRecipeIdRef.current = targetRecipeId; // Mark as loaded
        }

        const params = {
          status: "approved",
          limit: 10,
          ...(loadMore &&
            currentPagination?.nextCursor && {
              cursor: currentPagination.nextCursor,
            }),
        };

        const response = await commentsAPI.getComments(targetRecipeId, params);
        const commentsData = response?.data || [];
        const pageInfo = response?.pagination || null;

        // Chỉ update state nếu vẫn là cùng recipe
        if (currentRecipeIdRef.current === targetRecipeId) {
          if (loadMore) {
            setComments((prev) => [...prev, ...commentsData]);
          } else {
            setComments(commentsData);
          }
          setPagination(pageInfo);
          setError(null); // Clear any previous errors
        }
      } catch (err) {
        console.error("Error loading comments:", err);
        if (currentRecipeIdRef.current === targetRecipeId) {
          setError("Không thể tải bình luận");
          if (!loadMore) {
            // Use initial prop only on error fallback
            setComments(initial);
          }
        }
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // Chỉ gọi khi recipeId đổi; không reset lastRecipeIdRef để tránh phá guard
  useEffect(() => {
    if (!recipeId) return;
    setComments([]);
    setPagination(null);
    setError(null);
    const timeoutId = setTimeout(() => {
      loadComments(false);
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [recipeId]); // cố ý không đưa loadComments vào deps

  const add = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;

    if (!isAuthenticated) {
      setError("Bạn cần đăng nhập để bình luận");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setFieldErrors({});

      await commentsAPI.addComment(recipeId, content, rating || null);

      // Reset form
      setText("");
      setRating(0);

      // Reload comments to show updated list (including newly approved comments)
      loadComments(false);

      // Show success toast - comment is pending approval
      setToast({
        open: true,
        type: "success",
        message: "Bình luận đã được gửi và đang chờ duyệt",
      });
    } catch (err) {
      console.error("Error adding comment:", err);

      // Handle 422 validation errors
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      } else {
        setError("Không thể thêm bình luận. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const loadMoreComments = () => {
    if (!pagination?.hasNext || loadingMore || isLoadingRef.current) return;
    loadComments(true, pagination);
  };

  return (
    <div className="space-y-4" aria-labelledby="comments-title">
      <h3
        id="comments-title"
        className="text-sm font-semibold uppercase tracking-wide text-emerald-900/70"
      >
        Bình luận ({loading ? "..." : comments.length})
      </h3>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={add}
        className="space-y-3 p-4 rounded-xl border border-emerald-900/10 bg-white shadow-sm"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-emerald-800/70 mb-1">
              Nội dung bình luận
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/50 min-h-[80px] ${
                fieldErrors.content ? "border-red-300" : "border-emerald-900/20"
              }`}
              placeholder={
                isAuthenticated
                  ? "Chia sẻ cảm nhận của bạn..."
                  : "Đăng nhập để bình luận"
              }
              disabled={!isAuthenticated || submitting}
              required
            />
            {fieldErrors.content && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.content}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-emerald-800/70 mb-1">
              Đánh giá (tùy chọn)
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(rating === star ? 0 : star)}
                  disabled={!isAuthenticated || submitting}
                  className={`w-6 h-6 text-lg transition-colors ${
                    star <= rating
                      ? "text-yellow-400"
                      : "text-gray-300 hover:text-yellow-200"
                  } ${
                    !isAuthenticated || submitting
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  ★
                </button>
              ))}
              {rating > 0 && (
                <span className="text-xs text-emerald-700/70 ml-2 self-center">
                  {rating} sao
                </span>
              )}
            </div>
            {fieldErrors.rating && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.rating}</p>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={!text.trim() || !isAuthenticated || submitting}
          className="rounded-lg bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 px-4 py-2 text-sm font-semibold text-lime-100 shadow disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-600/60"
        >
          {submitting
            ? "Đang gửi..."
            : isAuthenticated
            ? "Gửi bình luận"
            : "Đăng nhập để bình luận"}
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-sm text-emerald-800/60">
            Đang tải bình luận...
          </div>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {comments.map((c, index) => (
              <li
                key={c.id || c._id || `comment-${index}`}
                className="p-4 rounded-xl border border-emerald-900/10 bg-white shadow-sm text-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-emerald-900/90">
                    {c.userId?.name || c.author?.name || c.author || "Ẩn danh"}
                  </span>
                  <time
                    className="text-[10px] uppercase tracking-wide text-emerald-800/40"
                    dateTime={c.createdAt}
                  >
                    {new Date(c.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <p className="text-emerald-900/80 leading-relaxed whitespace-pre-line">
                  {c.content}
                </p>
              </li>
            ))}
          </ul>

          {comments.length === 0 && (
            <p className="text-xs text-emerald-800/60">
              Chưa có bình luận nào.
            </p>
          )}

          {pagination?.hasNext && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMoreComments}
                disabled={loadingMore}
                className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? "Đang tải..." : "Xem thêm bình luận"}
              </button>
            </div>
          )}
        </>
      )}

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ open: false, type: "info", message: "" })}
      />
    </div>
  );
}
