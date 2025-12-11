/** RecipeEditor - API Integration
 * Steps: Meta -> Ingredients -> Steps -> Media -> Preview
 * Actions: Save Draft, Update, Publish, Unpublish, Reject
 * API Integration for full CRUD operations
 */
import React, { useEffect, useState, useCallback } from "react";
import RecipeMetaStep from "../components/recipe/RecipeMetaStep.jsx";
import RecipeIngredientsStep from "../components/recipe/RecipeIngredientsStep.jsx";
import RecipeInstructionsStep from "../components/recipe/RecipeInstructionsStep.jsx";
import RecipeMediaStep from "../components/recipe/RecipeMediaStep.jsx";
import RecipePreviewStep from "../components/recipe/RecipePreviewStep.jsx";
import Toast from "../components/Toast.jsx";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { useAdminApi } from "../contexts/AdminApiContext.jsx";

const steps = [
  { id: "meta", label: "Thông tin" },
  { id: "ingredients", label: "Nguyên liệu" },
  { id: "steps", label: "Các bước" },
  { id: "media", label: "Hình ảnh" },
  { id: "preview", label: "Xem trước" },
];

const emptyRecipe = {
  _id: null,
  title: "",
  slug: "",
  slugTouched: false,
  summary: "",
  content: "",
  seoTitle: "",
  seoDescription: "",
  ingredients: [],
  steps: [],
  tags: [],
  category: "",
  prepTime: 0,
  cookTime: 0,
  servings: 1,
  images: [],
  status: "pending", // Mặc định là "chờ duyệt" khi tạo mới
  publishAt: null,
  ratingAvg: 0,
  ratingCount: 0,
};

export default function RecipeEditor() {
  const nav = useNavigate();
  const { id } = useParams();
  const adminApi = useAdminApi();

  // Core state
  const [data, setData] = useState(emptyRecipe);
  const [originalData, setOriginalData] = useState(null);
  const [active, setActive] = useState(steps[0].id);

  // UI state
  const [toast, setToast] = useState({ open: false, msg: "", type: "info" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Modals
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, reason: "" });

  const isEditing = Boolean(id);
  const isDirty = JSON.stringify(data) !== JSON.stringify(originalData);

  // Load recipe data for editing
  useEffect(() => {
    if (!isEditing) {
      setOriginalData({ ...emptyRecipe });
      return;
    }

    const loadRecipe = async () => {
      setLoading(true);
      setErrors({});

      const result = await adminApi.safeApiCall(
        () => adminApi.getRecipeById(id),
        {
          defaultErrorMessage: "Không thể tải thông tin công thức",
        }
      );

      if (result.success) {
        const recipe = result.data?.data || result.data;
        let loadedData = { ...emptyRecipe, ...recipe };

        // Convert string image IDs to objects with URLs
        if (
          loadedData.images &&
          Array.isArray(loadedData.images) &&
          loadedData.images.length > 0
        ) {
          try {
            const imageObjects = [];
            for (const imageId of loadedData.images) {
              if (typeof imageId === "string") {
                // Try to fetch media object by ID
                const mediaResult = await adminApi.safeApiCall(
                  () => adminApi.getMediaById(imageId),
                  { defaultErrorMessage: `Không thể tải media ${imageId}` }
                );

                if (mediaResult.success && mediaResult.data) {
                  const mediaItem = mediaResult.data?.data || mediaResult.data;
                  imageObjects.push({
                    _id: mediaItem._id,
                    url: mediaItem.url,
                    alt: mediaItem.alt || "",
                    caption: "",
                  });
                  console.log(
                    "Converted image ID to object:",
                    imageId,
                    "->",
                    mediaItem
                  );
                } else {
                  console.warn("Could not load media for ID:", imageId);
                }
              } else if (typeof imageId === "object" && imageId.url) {
                // Already an object, keep as is
                imageObjects.push(imageId);
              }
            }
            loadedData.images = imageObjects;
            console.log("Final loaded images:", loadedData.images);
          } catch (error) {
            console.error("Error converting image IDs:", error);
          }
        }

        setData(loadedData);
        setOriginalData(loadedData);
      } else {
        showToast("Không thể tải thông tin công thức", "error");
      }

      setLoading(false);
    };

    loadRecipe();
  }, [id, isEditing, adminApi]);

  // Helper functions
  const showToast = (msg, type = "info") => {
    setToast({ open: true, msg, type });
  };

  const update = (next) => {
    setData(next);
    setErrors({}); // Clear errors when user updates
  };

  // Navigation helpers
  const stepIndex = steps.findIndex((s) => s.id === active);
  const go = (id) => setActive(id);
  const next = () =>
    setActive(steps[Math.min(stepIndex + 1, steps.length - 1)].id);
  const prev = () => setActive(steps[Math.max(stepIndex - 1, 0)].id);

  // API Action handlers
  const saveDraft = async () => {
    setSaving(true);
    setErrors({});

    // Clean up data for API - only send allowed fields
    const allowedFields = [
      "title",
      "summary",
      "content",
      "ingredients",
      "steps",
      "tags",
      "category",
      "prepTime",
      "cookTime",
      "servings",
      "images",
      "slug",
    ];

    const payload = {};
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        if (field === "images") {
          // Convert image objects to just IDs for database storage
          payload[field] = (data[field] || []).map((img) =>
            typeof img === "object" ? img._id || img.id : img
          );
          console.log(
            "Converting images for save:",
            data[field],
            "->",
            payload[field]
          );
        } else {
          payload[field] = data[field];
        }
      }
    });

    // Set status to "draft" when saving as draft
    payload.status = "draft";

    const result = await adminApi.safeApiCall(
      () =>
        isEditing
          ? adminApi.updateRecipe(data._id, payload)
          : adminApi.createRecipe(payload),
      {
        defaultErrorMessage: isEditing
          ? "Không thể cập nhật công thức"
          : "Không thể tạo công thức",
      }
    );

    if (result.success) {
      const savedRecipe = result.data?.data || result.data;
      // Preserve current images format (objects) instead of backend format (strings)
      const updatedData = { ...data, ...savedRecipe, images: data.images };
      setData(updatedData);
      setOriginalData(updatedData);
      showToast("Đã lưu bản nháp", "success");

      if (!isEditing) {
        // Redirect to edit mode after creating
        nav(`/admin/recipes/${savedRecipe._id}/edit`, { replace: true });
      }
    } else {
      if (result.error?.details) {
        // Backend sends details as object, not array
        setErrors(result.error.details);
      }
      showToast(result.error?.message || "Đã xảy ra lỗi", "error");
    }

    setSaving(false);
  };

  const submitForReview = async () => {
    setSaving(true);
    setErrors({});

    // Clean up data for API - only send allowed fields
    const allowedFields = [
      "title",
      "summary",
      "content",
      "ingredients",
      "steps",
      "tags",
      "category",
      "prepTime",
      "cookTime",
      "servings",
      "images",
      "slug",
    ];

    const payload = {};
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        if (field === "images") {
          // Convert image objects to just IDs for database storage
          payload[field] = (data[field] || []).map((img) =>
            typeof img === "object" ? img._id || img.id : img
          );
        } else {
          payload[field] = data[field];
        }
      }
    });

    // Clean up _id fields for new recipes (MongoDB will generate proper ObjectIds)
    if (!isEditing) {
      // Remove _id from ingredients array
      if (payload.ingredients && Array.isArray(payload.ingredients)) {
        payload.ingredients = payload.ingredients.map(
          ({ _id, ...ingredient }) => ingredient
        );
      }

      // Remove _id from steps array
      if (payload.steps && Array.isArray(payload.steps)) {
        payload.steps = payload.steps.map(({ _id, ...step }) => step);
      }
    }

    // Set status to "pending" when submitting for review
    payload.status = "pending";

    const result = await adminApi.safeApiCall(
      () =>
        isEditing
          ? adminApi.updateRecipe(data._id, payload)
          : adminApi.createRecipe(payload),
      {
        defaultErrorMessage: isEditing
          ? "Không thể cập nhật công thức"
          : "Không thể tạo công thức",
      }
    );

    if (result.success) {
      const savedRecipe = result.data?.data || result.data;
      // Preserve current images format (objects) instead of backend format (strings)
      const updatedData = { ...data, ...savedRecipe, images: data.images };
      setData(updatedData);
      setOriginalData(updatedData);
      showToast(
        isEditing ? "Đã gửi công thức để duyệt" : "Đã tạo công thức và gửi để duyệt",
        "success"
      );

      if (!isEditing) {
        nav(`/admin/recipes/${savedRecipe._id}/edit`, { replace: true });
      }
    } else {
      if (result.error?.details) {
        // Backend sends details as object, not array
        setErrors(result.error.details);
      }
      showToast(result.error?.message || "Đã xảy ra lỗi", "error");
    }

    setSaving(false);
  };

  const publishRecipe = async () => {
    if (!isEditing) {
      showToast("Vui lòng lưu công thức trước khi xuất bản", "error");
      return;
    }

    setSaving(true);
    const result = await adminApi.safeApiCall(
      () => adminApi.publishRecipe(data._id),
      {
        defaultErrorMessage: "Không thể xuất bản công thức",
      }
    );

    if (result.success) {
      const publishedRecipe = result.data?.data || result.data;
      setData({ ...data, ...publishedRecipe });
      setOriginalData({ ...data, ...publishedRecipe });
      showToast("Đã xuất bản công thức", "success");
    } else {
      showToast(result.error?.message || "Đã xảy ra lỗi", "error");
    }

    setSaving(false);
  };

  const unpublishRecipe = async () => {
    if (!isEditing) return;

    setSaving(true);
    const result = await adminApi.safeApiCall(
      () => adminApi.unpublishRecipe(data._id),
      {
        defaultErrorMessage: "Không thể gỡ xuất bản công thức",
      }
    );

    if (result.success) {
      const unpublishedRecipe = result.data?.data || result.data;
      setData({ ...data, ...unpublishedRecipe });
      setOriginalData({ ...data, ...unpublishedRecipe });
      showToast("Đã gỡ xuất bản công thức", "success");
    } else {
      showToast(result.error?.message || "Đã xảy ra lỗi", "error");
    }

    setSaving(false);
  };

  const rejectRecipe = async () => {
    if (
      !isEditing ||
      !rejectModal.reason.trim() ||
      rejectModal.reason.trim().length < 5
    ) {
      if (
        rejectModal.reason.trim().length > 0 &&
        rejectModal.reason.trim().length < 5
      ) {
        showToast("Lý do từ chối phải có ít nhất 5 ký tự", "error");
        return;
      }
      setRejectModal({ ...rejectModal, open: false });
      return;
    }

    setSaving(true);
    const result = await adminApi.safeApiCall(
      () => adminApi.rejectRecipe(data._id, rejectModal.reason.trim()),
      {
        defaultErrorMessage: "Không thể từ chối công thức",
      }
    );

    if (result.success) {
      const rejectedRecipe = result.data?.data || result.data;
      setData({ ...data, ...rejectedRecipe });
      setOriginalData({ ...data, ...rejectedRecipe });
      showToast("Đã từ chối công thức", "success");
    } else {
      if (result.error?.details) {
        // Backend sends details as object, not array
        setErrors(result.error.details);
      }
      showToast(result.error?.message || "Đã xảy ra lỗi", "error");
    }

    setRejectModal({ open: false, reason: "" });
    setSaving(false);
  };

  // Leave guard
  const onBeforeUnload = useCallback(
    (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    },
    [isDirty]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [onBeforeUnload]);

  const attemptLeave = () => {
    if (isDirty) setConfirmLeave(true);
    else nav("/admin/recipes");
  };

  const confirmLeaveAction = () => {
    setConfirmLeave(false);
    nav("/admin/recipes");
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-emerald-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-emerald-100 rounded w-1/2"></div>
        </div>
        <div className="animate-pulse bg-emerald-100 rounded-2xl h-64"></div>
      </div>
    );
  }

  // Render step content
  let body = null;
  if (active === "meta")
    body = <RecipeMetaStep data={data} onChange={update} errors={errors} />;
  if (active === "ingredients")
    body = (
      <RecipeIngredientsStep data={data} onChange={update} errors={errors} />
    );
  if (active === "steps")
    body = (
      <RecipeInstructionsStep data={data} onChange={update} errors={errors} />
    );
  if (active === "media")
    body = <RecipeMediaStep data={data} onChange={update} errors={errors} />;
  if (active === "preview") body = <RecipePreviewStep data={data} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-emerald-900">
            {isEditing ? "Chỉnh sửa công thức" : "Tạo công thức mới"}
          </h2>
          <p className="text-xs text-emerald-800/70">
            {isEditing
              ? `Chỉnh sửa: ${data.title || "Chưa có tiêu đề"}`
              : "Tạo công thức mới"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveDraft}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-emerald-900/15 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : isEditing ? "Lưu nháp" : "Lưu nháp"}
          </button>

          <button
            type="button"
            onClick={submitForReview}
            disabled={saving}
            className="btn-brand disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : isEditing ? "Gửi duyệt" : "Gửi duyệt"}
          </button>

          {isEditing && data.status !== "published" && (
            <button
              type="button"
              onClick={publishRecipe}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-green-600 text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-60"
            >
              {saving ? "Đang xuất bản..." : "Đăng"}
            </button>
          )}

          {isEditing && data.status === "published" && (
            <button
              type="button"
              onClick={unpublishRecipe}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-orange-600 text-white shadow-sm hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-60"
            >
              {saving ? "Đang gỡ..." : "Gỡ đăng"}
            </button>
          )}

          {isEditing && data.status !== "rejected" && (
            <button
              type="button"
              onClick={() => setRejectModal({ open: true, reason: "" })}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-60"
            >
              Từ chối
            </button>
          )}

          <button
            type="button"
            onClick={attemptLeave}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-600 text-white shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Step nav */}
      <div className="flex flex-wrap gap-2 bg-white border border-emerald-900/15 rounded-2xl p-2">
        {steps.map((s) => {
          const idx = steps.findIndex((x) => x.id === s.id);
          const done = idx < stepIndex;
          const activeStep = s.id === active;
          return (
            <button
              key={s.id}
              onClick={() => go(s.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-lime-400 ${
                activeStep
                  ? "bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-white shadow-brand"
                  : done
                  ? "bg-emerald-900/10 text-emerald-900"
                  : "text-emerald-800 hover:bg-emerald-900/10"
              }`}
              aria-current={activeStep ? "step" : undefined}
            >
              {s.label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 text-xs text-emerald-700">
          {saving && <span>Đang lưu…</span>}
          {!saving && !isDirty && (
            <span className="text-emerald-600">Đã lưu</span>
          )}
          {isDirty && !saving && (
            <span className="text-amber-600">Chưa lưu</span>
          )}
          {data.status && (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                data.status === "published"
                  ? "bg-green-100 text-green-800"
                  : data.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : data.status === "review"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {data.status === "published"
                ? "Đã xuất bản"
                : data.status === "rejected"
                ? "Bị từ chối"
                : data.status === "review"
                ? "Đang xem xét"
                : "Bản nháp"}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="rounded-2xl bg-white border border-emerald-900/10 p-6 shadow-sm">
        {body}
      </div>

      {/* Prev / Next */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={prev}
          disabled={stepIndex === 0}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-emerald-900/15 hover:bg-emerald-50 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-lime-400"
        >
          Trước
        </button>
        <button
          onClick={next}
          disabled={stepIndex === steps.length - 1}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-emerald-900/15 hover:bg-emerald-50 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-lime-400"
        >
          Tiếp theo
        </button>
      </div>

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.msg}
        onClose={() => setToast({ ...toast, open: false })}
      />

      <ConfirmModal
        open={confirmLeave}
        title="Hủy bỏ các thay đổi?"
        message="Bạn có các thay đổi chưa lưu. Vẫn rời đi?"
        confirmLabel="Rời đi"
        onConfirm={confirmLeaveAction}
        onCancel={() => setConfirmLeave(false)}
        danger
      />

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setRejectModal({ open: false, reason: "" })}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-emerald-900 mb-4">
              Từ chối công thức
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
                  Lý do từ chối
                </label>
                <textarea
                  value={rejectModal.reason}
                  onChange={(e) =>
                    setRejectModal({ ...rejectModal, reason: e.target.value })
                  }
                  className="input min-h-[100px] resize-y mt-2"
                  placeholder="Nhập lý do từ chối (tối thiểu 5 ký tự)..."
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">Tối thiểu 5 ký tự</p>
                  <p
                    className={`text-xs ${
                      rejectModal.reason.length >= 5
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {rejectModal.reason.length}/5
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRejectModal({ open: false, reason: "" })}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-emerald-900/15 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-lime-400"
                >
                  Hủy
                </button>
                <button
                  onClick={rejectRecipe}
                  disabled={
                    !rejectModal.reason.trim() ||
                    rejectModal.reason.trim().length < 5 ||
                    saving
                  }
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-60"
                >
                  {saving ? "Đang từ chối..." : "Từ chối"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
