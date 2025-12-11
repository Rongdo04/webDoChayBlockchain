import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaStar, FaRegStar, FaClock, FaFire } from "react-icons/fa";
import { recipesAPI } from "../../services/recipesAPI.js";
import { useAuthAdapter } from "../../auth/useAuthAdapter.js";
import useReportModal from "../../hooks/useReportModal";
import RatingStars from "../components/recipe/RatingStars";
import IngredientsChecklist from "../components/recipe/IngredientsChecklist";
import Steps from "../components/recipe/Steps";
import MediaGallery from "../components/recipe/MediaGallery";
import CommentList from "../components/recipe/CommentList";
import LoginRequiredModal from "../components/modals/LoginRequiredModal.jsx";
import GenericReportModal from "../../components/common/GenericReportModal.jsx";
import { default as ReportLoginModal } from "../components/community/LoginRequiredModal.jsx";

export default function RecipeDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const { isAuthenticated } = useAuthAdapter();
  // favorite handling
  const [fav, setFav] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Report modal hook
  const {
    reportTarget,
    showLoginRequired: showReportLoginRequired,
    toast: reportToast,
    handleReport: handleReportAction,
    handleReportSuccess,
    handleLoginRedirect: handleReportLoginRedirect,
    closeReportModal,
    closeLoginModal: closeReportLoginModal,
    clearToast: clearReportToast,
  } = useReportModal();

  // Track if recipe has been fetched to prevent double API calls (StrictMode)
  const hasFetchedRef = useRef(false);
  const currentSlugRef = useRef(slug);

  // Fetch recipe data
  useEffect(() => {
    // Reset ref if slug changes
    if (currentSlugRef.current !== slug) {
      hasFetchedRef.current = false;
      currentSlugRef.current = slug;
    }

    // Prevent double fetch in StrictMode
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchRecipe = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);
        setNotFound(false);

        const recipeData = await recipesAPI.getRecipeBySlug(slug);

        if (!recipeData) {
          setNotFound(true);
          return;
        }

        setRecipe(recipeData);

        // Set author from recipe data (if populated)
        if (recipeData.authorId) {
          setAuthor(recipeData.authorId);
        }
      } catch (err) {
        console.error("Error fetching recipe:", err);

        // Check if it's a 404 error
        if (err.response?.status === 404 || err.status === 404) {
          setNotFound(true);
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [slug]);

  // Favorites handling
  useEffect(() => {
    if (!recipe) return;
    const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFav(stored.includes(recipe._id));
  }, [recipe]);

  const toggleFav = () => {
    if (!recipe) return;
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setFav((prev) => {
      const next = !prev;
      const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
      let updated;
      if (next) updated = Array.from(new Set([recipe._id, ...stored]));
      else updated = stored.filter((id) => id !== recipe._id);
      localStorage.setItem("favorites", JSON.stringify(updated));
      return next;
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  // Auto hide report toast
  useEffect(() => {
    if (reportToast) {
      const t = setTimeout(() => clearReportToast(), 2600);
      return () => clearTimeout(t);
    }
  }, [reportToast, clearReportToast]);

  // Handle report recipe
  const handleReport = () => {
    if (!recipe) return;
    handleReportAction(recipe, isAuthenticated);
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-emerald-900/10 rounded-lg w-3/4"></div>
          <div className="h-4 bg-emerald-900/10 rounded w-1/2"></div>
          <div className="h-64 bg-emerald-900/10 rounded-2xl"></div>
          <div className="space-y-3">
            <div className="h-4 bg-emerald-900/10 rounded w-full"></div>
            <div className="h-4 bg-emerald-900/10 rounded w-5/6"></div>
            <div className="h-4 bg-emerald-900/10 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // 404 Not Found state
  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4">
        <div className="text-center space-y-6">
          <div className="text-6xl">🔍</div>
          <h1 className="text-2xl font-semibold bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 bg-clip-text text-transparent">
            Không tìm thấy công thức
          </h1>
          <p className="text-emerald-800/70 max-w-md mx-auto">
            Công thức bạn đang tìm kiếm không tồn tại hoặc đã được gỡ bỏ.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/recipes"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 px-6 py-3 text-sm font-semibold text-lime-100 shadow hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-600/60"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Xem tất cả công thức
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-900/20 bg-white px-6 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-600/60"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !recipe) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="p-6 rounded-xl border border-emerald-900/15 bg-white shadow-sm space-y-4 text-center">
          <h1 className="text-xl font-semibold bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 bg-clip-text text-transparent">
            {error ? "Có lỗi xảy ra" : "Không tìm thấy công thức"}
          </h1>
          <p className="text-sm text-emerald-800/70">
            {error
              ? "Vui lòng thử lại sau."
              : "Có thể công thức đã được đổi tên hoặc chưa được tạo."}
          </p>
          <Link
            to="/recipes"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 px-4 py-2 text-sm font-semibold text-lime-100 shadow focus:outline-none focus:ring-2 focus:ring-emerald-600/60"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 lg:px-6 space-y-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Main */}
        <div className="md:col-span-2 space-y-8">
          <header className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-semibold leading-tight bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 bg-clip-text text-transparent">
                      {recipe.title}
                    </h1>
                    <p className="text-emerald-900/70 text-sm leading-relaxed max-w-prose">
                      {recipe.summary || recipe.description}
                    </p>
                  </div>
                  {recipe.blockchain?.isVerified &&
                    recipe.blockchain?.transactionHash && (
                      <div className="shrink-0">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-medium shadow-sm">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Verified on Blockchain</span>
                        </div>
                      </div>
                    )}
                  {recipe.blockchain?.recipeHash &&
                    !recipe.blockchain?.isVerified &&
                    recipe.blockchain?.verificationReason ===
                      "hash_already_exists" && (
                      <div className="shrink-0">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-medium shadow-sm">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Trùng lặp - Chưa xác minh</span>
                        </div>
                      </div>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full bg-emerald-900/5 ring-1 ring-emerald-900/15 text-[11px] font-medium text-emerald-900/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleFav}
                  aria-pressed={fav}
                  className={`shrink-0 h-11 px-4 rounded-xl inline-flex items-center gap-2 text-sm font-medium shadow border transition focus:outline-none focus:ring-2 focus:ring-emerald-600/60 ${
                    fav
                      ? "bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-lime-100 border-transparent"
                      : "bg-white text-emerald-900/80 border-emerald-900/15 hover:bg-emerald-50"
                  }`}
                  aria-label={fav ? "Bỏ lưu công thức" : "Lưu công thức"}
                >
                  {fav ? (
                    <>
                      <FaStar className="inline mr-1" /> Đã lưu
                    </>
                  ) : (
                    <>
                      <FaRegStar className="inline mr-1" /> Lưu
                    </>
                  )}
                </button>
                <button
                  onClick={handleReport}
                  className="shrink-0 h-11 px-3 rounded-xl inline-flex items-center gap-1 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 transition focus:outline-none focus:ring-2 focus:ring-rose-400/60"
                  aria-label="Báo cáo công thức"
                  title="Báo cáo công thức"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-[11px] uppercase tracking-wide text-emerald-800/50">
              <div className="flex items-center gap-1 font-medium text-emerald-900/70">
                <FaClock className="inline mr-1" /> Chuẩn bị{" "}
                {recipe.prepTime || 0} phút
              </div>
              <div className="flex items-center gap-1 font-medium text-emerald-900/70">
                <FaFire className="inline mr-1" /> Nấu {recipe.cookTime || 0}{" "}
                phút
              </div>
              <div className="flex items-center gap-1 font-medium text-emerald-900/70">
                👥 {recipe.servings || 1} khẩu phần
              </div>
              {recipe.difficulty && (
                <div className="flex items-center gap-1 font-medium text-emerald-900/70">
                  🧪 {recipe.difficulty}
                </div>
              )}
            </div>
            <RatingStars value={recipe.ratingAvg} count={recipe.ratingCount} />
          </header>

          {/* Gallery (mobile show first) */}
          <div className="md:hidden">
            <MediaGallery images={recipe.images} videoUrl={recipe.videoUrl} />
          </div>

          <section>
            <h2 className="sr-only">Nguyên liệu & Bước</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              <IngredientsChecklist list={recipe.ingredients} />
              <Steps steps={recipe.steps} />
            </div>
          </section>

          <section>
            <h2 className="sr-only">Bình luận</h2>
            <CommentList recipeId={recipe._id} recipe={recipe} />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div className="hidden md:block">
            <MediaGallery images={recipe.images} videoUrl={recipe.videoUrl} />
          </div>

          <div className="p-5 rounded-xl border border-emerald-900/10 bg-white shadow-sm space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-900/70">
              Thông tin
            </h3>
            {recipe.blockchain?.isVerified && (
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50 space-y-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-blue-900">
                    Đã xác minh trên Blockchain
                  </span>
                </div>
                {recipe.blockchain.transactionHash && (
                  <div className="text-[10px] text-blue-700/80 space-y-0.5">
                    <div>
                      <span className="font-medium">TX:</span>{" "}
                      <span className="font-mono">
                        {recipe.blockchain.transactionHash.slice(0, 10)}...
                        {recipe.blockchain.transactionHash.slice(-8)}
                      </span>
                    </div>
                    {recipe.blockchain.blockNumber && (
                      <div>
                        <span className="font-medium">Block:</span>{" "}
                        {recipe.blockchain.blockNumber}
                      </div>
                    )}
                    {recipe.blockchain.timestamp && (
                      <div>
                        <span className="font-medium">Đăng ký:</span>{" "}
                        {new Date(
                          recipe.blockchain.timestamp
                        ).toLocaleDateString("vi-VN")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {recipe.blockchain?.recipeHash &&
              !recipe.blockchain?.isVerified && (
                <div className="p-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs font-semibold text-amber-900">
                      {recipe.blockchain.verificationReason ===
                      "hash_already_exists"
                        ? "Công thức trùng lặp"
                        : recipe.blockchain.verificationReason ===
                          "no_wallet_address"
                        ? "Chưa kết nối MetaMask"
                        : "Chưa xác minh trên Blockchain"}
                    </span>
                  </div>
                  {recipe.blockchain.verificationReason ===
                    "hash_already_exists" && (
                    <div className="text-[10px] text-amber-700/80 space-y-0.5">
                      <p>
                        Công thức này có nội dung trùng với một công thức đã
                        được đăng ký trước đó trên blockchain. Vui lòng chỉnh
                        sửa nội dung để tạo công thức mới.
                      </p>
                    </div>
                  )}
                  {recipe.blockchain.verificationReason ===
                    "no_wallet_address" && (
                    <div className="text-[10px] text-amber-700/80 space-y-0.5">
                      <p>
                        Công thức này chưa được bảo vệ bản quyền. Kết nối
                        MetaMask khi tạo công thức để đăng ký trên blockchain.
                      </p>
                    </div>
                  )}
                </div>
              )}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] text-emerald-900/80">
              <div className="space-y-1 col-span-2">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-emerald-800/50">
                  Tác giả
                </dt>
                {author ? (
                  <dd className="flex items-center gap-3">
                    <img
                      src={author.avatar || "/api/placeholder/40/40"}
                      alt={author.name || "Author"}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-900/10"
                      loading="lazy"
                    />
                    <div>
                      <div className="font-medium text-emerald-900/90 text-sm">
                        {author.name || "Không rõ"}
                      </div>
                      <div className="text-[11px] text-emerald-800/60 leading-tight">
                        {author.bio || author.email || ""}
                      </div>
                    </div>
                  </dd>
                ) : (
                  <dd className="text-emerald-800/60">Không rõ</dd>
                )}
              </div>

              {recipe.dietType && (
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-emerald-800/50">
                    Chế độ ăn
                  </dt>
                  <dd>{recipe.dietType}</dd>
                </div>
              )}
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-emerald-800/50">
                  Ngày tạo
                </dt>
                <dd>
                  {new Date(recipe.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-emerald-800/50">
                  Đánh giá
                </dt>
                <dd className="text-emerald-900/80">
                  {recipe.ratingAvg} ({recipe.ratingCount})
                </dd>
              </div>
            </dl>
          </div>

          <div className="p-5 rounded-xl border border-emerald-900/10 bg-white shadow-sm space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-900/70">
              Ghi chú nhanh
            </h3>
            <textarea
              placeholder="Bạn có thể ghi lại biến tấu, thời gian nấu thực tế... (chỉ lưu tại trình duyệt)"
              className="w-full rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/50 min-h-[100px]"
              onChange={(e) => {
                if (!recipe) return;
                const notes = JSON.parse(localStorage.getItem("notes") || "{}");
                notes[recipe._id] = e.target.value;
                localStorage.setItem("notes", JSON.stringify(notes));
              }}
              defaultValue={(() => {
                if (!recipe) return "";
                const notes = JSON.parse(localStorage.getItem("notes") || "{}");
                return notes[recipe._id] || "";
              })()}
            />
            <p className="text-[11px] text-emerald-800/50 leading-snug">
              Những ghi chú này sẽ không được đồng bộ lên máy chủ.
            </p>
          </div>
        </aside>
      </div>
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Report Modals */}
      <GenericReportModal
        open={!!reportTarget}
        target={reportTarget}
        targetType="recipe"
        onClose={closeReportModal}
        onSuccess={handleReportSuccess}
        onLoginRequired={() => {}}
      />

      <ReportLoginModal
        open={showReportLoginRequired}
        onClose={closeReportLoginModal}
        onLoginRedirect={handleReportLoginRedirect}
      />

      {/* Report Toast */}
      {reportToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl bg-emerald-950 text-lime-200 text-sm font-medium shadow-lg animate-[fade_.25s_ease] z-50"
        >
          {reportToast}
        </div>
      )}
    </div>
  );
}
