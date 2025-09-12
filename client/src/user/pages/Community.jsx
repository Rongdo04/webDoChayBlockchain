import React, { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import useReportModal from "../../hooks/useReportModal";
import { usePosts } from "../../hooks/usePosts";
import PostComposer from "../components/community/PostComposer.jsx";
import FeedList from "../components/community/FeedList.jsx";
import GenericReportModal from "../../components/common/GenericReportModal.jsx";
import LoginRequiredModal from "../components/community/LoginRequiredModal.jsx";

export default function Community() {
  const { isAuthenticated } = useAuth();

  // Use posts hook for real API integration
  const {
    posts,
    loading,
    filters,
    createPost,
    updateFilters,
    toggleLike,
    refresh,
  } = usePosts();

  // Use report modal hook
  const {
    reportTarget,
    showLoginRequired,
    toast,
    handleReport: handleReportAction,
    handleReportSuccess,
    handleLoginRedirect,
    closeReportModal,
    closeLoginModal,
    clearToast,
  } = useReportModal();

  // Auto hide toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => clearToast(), 2600);
      return () => clearTimeout(t);
    }
  }, [toast, clearToast]);

  // Handle post creation
  const handleCreatePost = async (postData) => {
    try {
      await createPost(postData);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  // Handle report action - check authentication first
  const handleReport = (post) => {
    handleReportAction(post, isAuthenticated);
  };

  // Handle tag filter change
  const handleTagFilter = (tag) => {
    updateFilters({ tag });
  };

  const tags = [
    "Tất cả",
    "Kinh nghiệm",
    "Hỏi đáp",
    "Món mới",
    "Chia sẻ",
    "Tư vấn",
  ];

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 bg-clip-text text-transparent">
          Cộng đồng
        </h1>
        <p className="text-sm text-emerald-800/70 max-w-prose">
          Chia sẻ mẹo nấu ăn, đặt câu hỏi và khám phá món chay mỗi ngày.
        </p>
      </header>

      <PostComposer onPost={handleCreatePost} />

      <div className="flex flex-wrap gap-2 items-center">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => handleTagFilter(t)}
            aria-pressed={filters.tag === t}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition focus:outline-none focus:ring-2 focus:ring-emerald-600/50 ${
              filters.tag === t
                ? "bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-lime-100 border-transparent shadow"
                : "bg-white text-emerald-900/70 border-emerald-900/15 hover:bg-emerald-900/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-emerald-600">Đang tải bài viết...</p>
        </div>
      ) : (
        <FeedList
          posts={posts}
          filterTag={filters.tag}
          onReport={handleReport}
        />
      )}

      <GenericReportModal
        key={reportTarget?.id || "report-modal"}
        open={!!reportTarget}
        target={reportTarget}
        targetType="post"
        onClose={closeReportModal}
        onSuccess={handleReportSuccess}
        onLoginRequired={() => {}}
      />

      <LoginRequiredModal
        open={showLoginRequired}
        onClose={closeLoginModal}
        onLoginRedirect={handleLoginRedirect}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl bg-emerald-950 text-lime-200 text-sm font-medium shadow-lg animate-[fade_.25s_ease]"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
