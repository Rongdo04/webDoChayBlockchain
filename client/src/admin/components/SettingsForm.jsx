/** SettingsForm with API Integration
 * Fields: siteTitle, siteDesc, brand, policy, featuredVideo
 * API: GET/PUT /api/admin/settings
 * Features: Load from API, save to API, field validation from backend errors
 */
import React, { useEffect, useState, useMemo } from "react";
import { useAdminApi } from "../contexts/AdminApiContext.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import Toast from "./Toast.jsx";
import { t } from "../../i18n";

const defaultValues = {
  siteTitle: "",
  siteDesc: "",
  brand: "",
  policy: "",
  featuredVideo: "",
};

export default function SettingsForm() {
  const adminApi = useAdminApi();
  const [values, setValues] = useState(defaultValues);
  const [originalValues, setOriginalValues] = useState(defaultValues);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", type: "success" });

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(originalValues),
    [values, originalValues]
  );

  // helpers
  const openToast = (msg, type = "success") =>
    setToast({ open: true, msg, type });

  const closeToast = () =>
    setToast((t) => ({
      ...t,
      open: false,
    }));

  // robust field error mapping from backend
  const mapBackendErrors = (details = []) => {
    const fieldErrors = {};
    details.forEach((d) => {
      // d.path can be "siteTitle" OR ["body","siteTitle"] etc.
      let key = d?.path;
      if (Array.isArray(key)) key = key[key.length - 1];
      if (typeof key !== "string") return;
      fieldErrors[key] =
        d?.message || t("common.invalidField", "Giá trị không hợp lệ");
    });
    return fieldErrors;
  };

  // Load settings
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setErrors({});

      const result = await adminApi.safeApiCall(() => adminApi.getSettings(), {
        defaultErrorMessage: "Không thể tải cài đặt",
      });

      if (!mounted) return;

      if (result.success) {
        const settingsData = result.data?.data || result.data || {};
        const loadedValues = { ...defaultValues, ...settingsData };
        setValues(loadedValues);
        setOriginalValues(loadedValues);
      } else {
        openToast(result.error?.message || "Không thể tải cài đặt", "error");
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [adminApi]);

  const update = (field, val) => {
    setValues((v) => ({ ...v, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setErrors({});

    const result = await adminApi.safeApiCall(
      () => adminApi.updateSettings(values),
      { defaultErrorMessage: "Không thể lưu cài đặt" }
    );

    if (result.success) {
      const updatedSettings = result.data?.data || result.data || values;
      setValues(updatedSettings);
      setOriginalValues(updatedSettings);
      openToast(t("settings.saved", "Đã lưu cài đặt"), "success");
    } else {
      if (result.error?.details && Array.isArray(result.error.details)) {
        setErrors(mapBackendErrors(result.error.details));
      }
      openToast(result.error?.message || "Không thể lưu cài đặt", "error");
    }

    setSaving(false);
  };

  const resetDefaults = async () => {
    if (saving) return;

    setSaving(true);
    setErrors({});

    const result = await adminApi.safeApiCall(
      () => adminApi.updateSettings(defaultValues),
      { defaultErrorMessage: "Không thể reset cài đặt" }
    );

    if (result.success) {
      const resetSettings = result.data?.data || result.data || defaultValues;
      setValues(resetSettings);
      setOriginalValues(resetSettings);
      setConfirmReset(false);
      openToast(
        t("settings.resetToDefaults", "Đã reset về mặc định"),
        "success"
      );
    } else {
      openToast(result.error?.message || "Không thể reset cài đặt", "error");
    }

    setSaving(false);
  };

  return (
    <div className="space-y-8">
      {loading && (
        <div className="text-center py-8">
          <div className="text-sm text-emerald-600">
            {t("common.loading", "Đang tải...")}
          </div>
        </div>
      )}

      {!loading && (
        <form onSubmit={save} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left column */}
            <div className="space-y-6">
              {/* Site Title */}
              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-emerald-900/70 mb-1">
                  {t("settings.siteTitle", "Tiêu đề website")}
                </label>
                <input
                  type="text"
                  value={values.siteTitle}
                  onChange={(e) => update("siteTitle", e.target.value)}
                  className={`w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${
                    errors.siteTitle ? "border-red-500" : ""
                  }`}
                  placeholder={t(
                    "settings.siteTitle.placeholder",
                    "Tên website của bạn"
                  )}
                  disabled={saving}
                />
                {errors.siteTitle && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.siteTitle}
                  </p>
                )}
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-emerald-900/70 mb-1">
                  {t("settings.brand", "Thương hiệu")}
                </label>
                <input
                  type="text"
                  value={values.brand}
                  onChange={(e) => update("brand", e.target.value)}
                  className={`w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${
                    errors.brand ? "border-red-500" : ""
                  }`}
                  placeholder={t(
                    "settings.brand.placeholder",
                    "Tên thương hiệu"
                  )}
                  disabled={saving}
                />
                {errors.brand && (
                  <p className="text-xs text-red-600 mt-1">{errors.brand}</p>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Site Description */}
              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-emerald-900/70 mb-1">
                  {t("settings.siteDesc", "Mô tả website")}
                </label>
                <textarea
                  value={values.siteDesc}
                  onChange={(e) => update("siteDesc", e.target.value)}
                  className={`w-full min-h-[100px] resize-y rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${
                    errors.siteDesc ? "border-red-500" : ""
                  }`}
                  placeholder={t(
                    "settings.siteDesc.placeholder",
                    "Mô tả ngắn gọn về website"
                  )}
                  disabled={saving}
                />
                {errors.siteDesc && (
                  <p className="text-xs text-red-600 mt-1">{errors.siteDesc}</p>
                )}
              </div>

              {/* Policy */}
              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-emerald-900/70 mb-1">
                  {t("settings.policy", "Chính sách")}
                </label>
                <textarea
                  value={values.policy}
                  onChange={(e) => update("policy", e.target.value)}
                  className={`w-full min-h-[100px] resize-y rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${
                    errors.policy ? "border-red-500" : ""
                  }`}
                  placeholder={t(
                    "settings.policy.placeholder",
                    "Chính sách sử dụng và quy tắc cộng đồng"
                  )}
                  disabled={saving}
                />
                {errors.policy && (
                  <p className="text-xs text-red-600 mt-1">{errors.policy}</p>
                )}
              </div>

              {/* Featured Video */}
              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-emerald-900/70 mb-1">
                  {t("settings.featuredVideo", "Video nổi bật")}
                </label>
                <input
                  type="url"
                  value={values.featuredVideo}
                  onChange={(e) => update("featuredVideo", e.target.value)}
                  className={`w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${
                    errors.featuredVideo ? "border-red-500" : ""
                  }`}
                  placeholder={t(
                    "settings.featuredVideo.placeholder",
                    "URL video nổi bật (YouTube, Vimeo, etc.)"
                  )}
                  disabled={saving}
                />
                {errors.featuredVideo && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.featuredVideo}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!isDirty || saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-white shadow-brand disabled:opacity-40"
            >
              {saving
                ? t("common.saving", "Đang lưu...")
                : t("common.save", "Lưu cài đặt")}
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-40"
            >
              {t("settings.resetToDefaults", "Reset về mặc định")}
            </button>
          </div>

          {/* Confirm & Toast */}
          <ConfirmModal
            open={confirmReset}
            title={t("settings.reset.title", "Reset cài đặt")}
            message={t(
              "settings.reset.message",
              "Reset tất cả cài đặt về mặc định?"
            )}
            confirmLabel={t("settings.reset.confirm", "Reset")}
            onConfirm={resetDefaults}
            onCancel={() => setConfirmReset(false)}
          />

          <Toast
            open={toast.open}
            type={toast.type}
            message={toast.msg}
            onClose={closeToast}
          />
        </form>
      )}
    </div>
  );
}
