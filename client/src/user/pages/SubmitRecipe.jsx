import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuthAdapter } from "../../auth/useAuthAdapter.js";
import ProgressBar from "../components/submit/ProgressBar.jsx";
import StepInfo from "../components/submit/StepInfo.jsx";
import StepIngredients from "../components/submit/StepIngredients.jsx";
import StepSteps from "../components/submit/StepSteps.jsx";
import StepMedia from "../components/submit/StepMedia.jsx";
import ReviewSubmit from "../components/submit/ReviewSubmit.jsx";
import UnsavedChangesModal from "../components/modals/UnsavedChangesModal.jsx";
import Toast from "../components/Toast.jsx";
import { recipesAPI } from "../../services/recipesAPI.js";
import { httpClient } from "../../services/httpClient.js";
import { mediaAPI } from "../../services/mediaAPI.js";

const STORAGE_KEY = "submit_draft";

const emptyDraft = {
  title: "",
  slug: "",
  summary: "", // Short description for cards
  content: "", // Full description/content
  description: "", // Keep for backward compatibility
  ingredients: [],
  steps: [],
  prepTime: 0, // Admin uses prepTime
  cookTime: 0, // Admin uses cookTime
  durationPrep: 0, // Keep for backward compatibility
  durationCook: 0, // Keep for backward compatibility
  servings: 1,
  tags: [], // Admin uses tags
  tasteTags: [], // Keep for backward compatibility
  category: "",
  images: [],
  userEditedSlug: false,
  slugTouched: false, // Admin uses slugTouched
  status: "draft",
};

const stepsTotal = 5;

export default function SubmitRecipe() {
  const { isAuthenticated, loading } = useAuthAdapter();
  const navigate = useNavigate();

  const [current, setCurrent] = useState(0);
  const [draft, setDraft] = useState(() => {
    try {
      return {
        ...emptyDraft,
        ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}),
      };
    } catch {
      return emptyDraft;
    }
  });
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    type: "info",
    message: "",
  });
  const intervalRef = useRef(null); // legacy (not used after refactor, kept if future revert)
  const draftRef = useRef(draft);

  // keep latest draft for interval without re-registering
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // Auth gate
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(`/auth/login?redirect=/submit`, { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Autosave (interval every 4s while dirty, does not restart on each keystroke)
  useEffect(() => {
    if (!dirty) return;
    const id = setInterval(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draftRef.current));
      } catch {}
    }, 4000);
    return () => clearInterval(id);
  }, [dirty]);

  // Debounced quick save after user stops typing (~600ms)
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch {}
    }, 600);
    return () => clearTimeout(t);
  }, [draft, dirty]);

  // Save on step change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [current]);

  // Warn before unload
  useEffect(() => {
    const handler = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const updateDraft = (next) => {
    setDraft(next);
    setDirty(true);
  };

  const validate = useCallback((data) => {
    const errs = {};
    if (!data.title) errs.title = "Bắt buộc";

    // Prefer new fields over backward compatibility fields
    if (!data.summary && !data.description) errs.summary = "Bắt buộc";
    if (!data.content && !data.description) errs.content = "Bắt buộc";
    if (!data.description && !data.summary && !data.content)
      errs.description = "Bắt buộc";

    if (!data.category) errs.category = "Bắt buộc";
    if (!data.servings || data.servings < 1) errs.servings = ">=1";

    // Check both new and old field names
    const prepTime = data.prepTime || data.durationPrep;
    const cookTime = data.cookTime || data.durationCook;
    if (prepTime < 0) errs.prepTime = errs.durationPrep = ">=0";
    if (cookTime < 0) errs.cookTime = errs.durationCook = ">=0";

    if (data.ingredients.length === 0) errs.ingredients = "Thêm ít nhất 1";
    if (data.steps.length === 0) errs.steps = "Thêm ít nhất 1";
    return errs;
  }, []);

  const canNext = () => {
    const v = validate(draft);
    if (current === 0)
      return (
        !v.title &&
        !v.description &&
        !v.category &&
        !v.servings &&
        !v.durationPrep &&
        !v.durationCook
      );
    if (current === 1) return !v.ingredients;
    if (current === 2) return !v.steps;
    return true;
  };

  const goNext = () => {
    if (current < stepsTotal - 1) setCurrent((c) => c + 1);
  };
  const goPrev = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  const saveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setDirty(false);
    setToast({
      open: true,
      type: "success",
      message: "Đã lưu nháp",
    });
  };

  const submit = async (walletAddress = null) => {
    const v = validate(draft);
    setErrors(v);
    if (Object.keys(v).length) {
      setToast({
        open: true,
        type: "error",
        message: "Có lỗi, vui lòng kiểm tra",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: Upload images if any
      let finalImageIds = [];

      if (draft.images && draft.images.length > 0) {
        // Separate uploaded images from base64 images
        const uploadedImages = draft.images.filter(
          (img) =>
            typeof img === "object" &&
            img.type === "uploaded" &&
            (img.id || img._id)
        );
        const base64Images = draft.images.filter(
          (img) => typeof img === "string" && img.startsWith("data:image/")
        );

        // Add already uploaded image IDs
        finalImageIds = uploadedImages.map((img) => img.id || img._id);

        // Upload remaining base64 images if any
        if (base64Images.length > 0) {
          setToast({
            open: true,
            type: "info",
            message: "Đang tải ảnh lên...",
          });

          try {
            const newUploadedIds = await mediaAPI.uploadBase64Images(
              base64Images
            );
            finalImageIds = [...finalImageIds, ...newUploadedIds];
          } catch (uploadError) {
            console.error("Image upload failed:", uploadError);
            setToast({
              open: true,
              type: "error",
              message: "Tải ảnh lên thất bại. Vui lòng thử lại.",
            });
            setSubmitting(false);
            return;
          }
        }
      }

      // Step 2: Prepare recipe data for API - normalize to admin format
      const recipeData = {
        title: draft.title,
        slug: draft.slug,
        summary: draft.summary || draft.description || "", // Prefer summary, fallback to description
        content: draft.content || draft.description || "", // Prefer content, fallback to description
        ingredients: draft.ingredients,
        steps: draft.steps,
        prepTime: draft.prepTime || draft.durationPrep || 0, // Prefer prepTime
        cookTime: draft.cookTime || draft.durationCook || 0, // Prefer cookTime
        servings: draft.servings,
        tags: draft.tags || draft.tasteTags || [], // Prefer tags, fallback to tasteTags
        category: draft.category,
        images: finalImageIds, // Use final combined image IDs
        status: "draft", // Set to draft for user submissions
        walletAddress: walletAddress || null, // Include wallet address from MetaMask

        // Keep backward compatibility fields
        description: draft.description,
        durationPrep: draft.durationPrep || draft.prepTime || 0,
        durationCook: draft.durationCook || draft.cookTime || 0,
        tasteTags: draft.tasteTags || draft.tags || [],
      };

      let result;
      let backendSuccess = true;

      try {
        // Step 3: Try to submit to backend API
        result = await recipesAPI.createRecipe(recipeData);

        // Success - clear draft and show success message
        localStorage.removeItem(STORAGE_KEY);
        setDirty(false);

        setToast({
          open: true,
          type: "success",
          message: "Đã gửi công thức để duyệt 🎉 Chuyển đến trang cá nhân...",
        });

        // Navigate to appropriate page
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      } catch (apiError) {
        console.warn(
          "Backend API failed, falling back to localStorage:",
          apiError
        );
        backendSuccess = false;

        // Fallback to localStorage queue when backend is down
        try {
          const existing = JSON.parse(
            localStorage.getItem("submitted_recipes") || "[]"
          );
          const fakeRecipe = {
            ...recipeData,
            id: Date.now().toString(),
            slug: draft.slug || `recipe-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: "draft",
          };

          localStorage.setItem(
            "submitted_recipes",
            JSON.stringify([fakeRecipe, ...existing])
          );

          // Clear draft since we saved it to submission queue
          localStorage.removeItem(STORAGE_KEY);
          setDirty(false);

          setToast({
            open: true,
            type: "info",
            message:
              "Đã lưu công thức vào hàng đợi. Sẽ gửi khi server hoạt động.",
          });

          // Navigate to profile after delay
          setTimeout(() => {
            navigate("/profile");
          }, 2000);
        } catch (localError) {
          console.error("Failed to save to localStorage:", localError);
          throw new Error("Không thể lưu công thức");
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      setToast({
        open: true,
        type: "error",
        message: error.message || "Gửi thất bại. Vui lòng thử lại.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const attemptLeave = () => {
    if (dirty) {
      setShowLeave(true);
    } else {
      navigate(-1);
    }
  };

  const confirmLeave = () => {
    setShowLeave(false);
    navigate(-1);
  };

  // Memoized current step element (prevents remount of same step component on unrelated state changes)
  const stepEl = useMemo(() => {
    switch (current) {
      case 0:
        return <StepInfo data={draft} onChange={updateDraft} errors={errors} />;
      case 1:
        return (
          <StepIngredients
            data={draft}
            onChange={updateDraft}
            errors={errors}
          />
        );
      case 2:
        return (
          <StepSteps data={draft} onChange={updateDraft} errors={errors} />
        );
      case 3:
        return <StepMedia data={draft} onChange={updateDraft} />;
      case 4:
        return (
          <ReviewSubmit
            data={draft}
            onEditStep={(s) => setCurrent(s)}
            onSaveDraft={saveDraft}
            onSubmit={submit}
            submitting={submitting}
          />
        );
      default:
        return null;
    }
  }, [current, draft, errors, submitting]);

  if (!isAuthenticated && !loading) {
    return null; // redirect handled earlier
  }

  return (
    <div className="space-y-6">
      <div className="bg-brand text-white rounded-2xl p-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Đăng công thức</h1>
          <p className="text-sm text-white/80 mt-1">
            Chia sẻ món chay của bạn với cộng đồng.
          </p>
        </div>
        <button
          onClick={attemptLeave}
          className="text-xs font-medium text-white/80 hover:text-white underline"
        >
          Rời trang
        </button>
      </div>
      <ProgressBar current={current} total={stepsTotal} />
      {Object.keys(errors).length > 0 && current !== 4 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
          <p className="font-semibold">Vui lòng sửa lỗi trước khi tiếp tục:</p>
          <ul className="list-disc list-inside">
            {Object.entries(errors).map(([k, v]) => (
              <li key={k}>
                {k}: {v}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="min-h-[400px]">{stepEl}</div>
      <div className="flex items-center justify-between pt-4 border-t border-emerald-900/10">
        <button
          disabled={current === 0}
          onClick={goPrev}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-100 text-emerald-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-lime-400"
        >
          Quay lại
        </button>
        <div className="flex gap-2">
          {current < stepsTotal - 1 && (
            <button
              disabled={!canNext()}
              onClick={() => {
                setErrors(validate(draft));
                goNext();
              }}
              className="btn-brand disabled:opacity-50"
            >
              Tiếp theo
            </button>
          )}
        </div>
      </div>
      <UnsavedChangesModal
        open={showLeave}
        onCancel={() => setShowLeave(false)}
        onConfirm={confirmLeave}
      />
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}
