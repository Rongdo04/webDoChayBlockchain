import React, { useMemo, useState, useEffect, useCallback } from "react";
import { recipesAPI } from "../../../services/recipesAPI.js";
import { taxonomyAPI } from "../../../services/taxonomyAPI.js";

// Local lightweight slugify (Vietnamese accent fold + safe chars) to avoid external dependency
function localSlugify(input) {
  if (!input) return "";
  return input
    .normalize("NFD") // separate accents
    .replace(/\p{Diacritic}+/gu, "") // remove accents
    .replace(/đ/gi, (m) => (m === "đ" ? "d" : "D"))
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function ensureUniqueSlug(base, existing) {
  if (!base) return "";
  let candidate = base;
  let i = 2;
  while (existing.has(candidate)) {
    candidate = `${base}-${i++}`;
  }
  return candidate;
}

const toNumberOrEmpty = (v) => (v === "" ? "" : Number(v));

export default function StepInfo({ data, onChange, errors }) {
  const [existingSlugs, setExistingSlugs] = useState(new Set());
  const [loadingSlugs, setLoadingSlugs] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(false);

  // Fetch existing slugs from API
  useEffect(() => {
    const fetchExistingSlugs = async () => {
      try {
        setLoadingSlugs(true);
        const response = await recipesAPI.getRecipes({
          limit: 1000, // Get all to check for duplicates
          sort: "newest",
        });

        const slugSet = new Set(response.data?.map((r) => r.slug) || []);

        // Also include locally submitted recipes
        try {
          const queued = JSON.parse(
            localStorage.getItem("submitted_recipes") || "[]"
          );
          queued.forEach((r) => r.slug && slugSet.add(r.slug));
        } catch {}

        setExistingSlugs(slugSet);
      } catch (err) {
        console.error("Error fetching existing slugs:", err);
        // Fallback to local data only
        const set = new Set();
        try {
          const queued = JSON.parse(
            localStorage.getItem("submitted_recipes") || "[]"
          );
          queued.forEach((r) => r.slug && set.add(r.slug));
        } catch {}
        setExistingSlugs(set);
      } finally {
        setLoadingSlugs(false);
      }
    };

    fetchExistingSlugs();
  }, []);

  // Load taxonomy data (categories and tags)
  useEffect(() => {
    const loadTaxonomy = async () => {
      setLoadingTaxonomy(true);
      try {
        const [categoriesResponse, tagsResponse] = await Promise.all([
          taxonomyAPI.getCategories(),
          taxonomyAPI.getTags(),
        ]);

        // Handle categories - expect array or object with data property
        const categoryData =
          categoriesResponse?.data || categoriesResponse || [];
        const categoryItems = Array.isArray(categoryData)
          ? categoryData
          : categoryData.items || [];
        // Normalize to have both _id and id
        setCategories(
          categoryItems.map((c) => ({
            ...c,
            _id: c._id || c.id,
            id: c.id || c._id,
          }))
        );

        // Handle tags - expect array or object with data property
        const tagData = tagsResponse?.data || tagsResponse || [];
        const tagItems = Array.isArray(tagData) ? tagData : tagData.items || [];
        setTags(
          tagItems.map((t) => ({ ...t, _id: t._id || t.id, id: t.id || t._id }))
        );
        console.log(
          "[SubmitRecipe] Loaded tags:",
          tagItems.map((t) => ({ id: t._id || t.id, name: t.name }))
        );
      } catch (error) {
        console.error("Failed to load taxonomy:", error);
        // Fallback to hardcoded values
        setCategories([
          { _id: "khai-vi", name: "Khai vị" },
          { _id: "mon-chinh", name: "Món chính" },
          { _id: "trang-mieng", name: "Tráng miệng" },
          { _id: "nuoc-uong", name: "Nước uống" },
        ]);
        // If API fails, leave empty to avoid mismatch with server IDs
        setTags([]);
      } finally {
        setLoadingTaxonomy(false);
      }
    };

    loadTaxonomy();
  }, []);

  const slugDuplicate =
    data.slug &&
    existingSlugs.has(data.slug) &&
    !existingSlugs.has(data.originalSlug);

  const update = useCallback(
    (field, value) => {
      if (field === "title") {
        const raw = localSlugify(value || "");
        const unique = data.userEditedSlug
          ? data.slug
          : ensureUniqueSlug(raw, existingSlugs);
        onChange({ ...data, title: value, slug: unique });
      } else if (field === "slug") {
        const cleaned = localSlugify(value);
        onChange({ ...data, slug: cleaned, userEditedSlug: true });
      } else {
        onChange({ ...data, [field]: value });
      }
    },
    [data, onChange, existingSlugs]
  );

  // Helper: get id from either _id or id
  const getId = useCallback((obj) => obj?._id || obj?.id || "", []);

  return (
    <div className="space-y-6">
      <Section
        title="Thông tin cơ bản"
        desc="Điền các trường bắt buộc (*) để tiếp tục."
      >
        <Field label="Tiêu đề *" error={errors.title}>
          <input
            className="input"
            value={data.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Ví dụ: Đậu hũ xốt cà chua"
          />
        </Field>
        <Field
          label="Slug"
          error={
            errors.slug ||
            (slugDuplicate ? "Slug đã tồn tại (mô phỏng)" : undefined)
          }
          hint="Có thể chỉnh sửa nếu muốn URL đẹp."
        >
          <input
            className="input"
            value={data.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="se-tu-tao-tu-tieu-de"
          />
        </Field>
        <Field label="Tóm tắt *" error={errors.summary}>
          <textarea
            className="input min-h-[80px]"
            value={data.summary}
            onChange={(e) => update("summary", e.target.value)}
            placeholder="Tóm tắt ngắn gọn về món ăn (hiển thị trong danh sách)..."
          />
        </Field>
        <Field label="Mô tả chi tiết *" error={errors.content}>
          <textarea
            className="input min-h-[120px]"
            value={data.content}
            onChange={(e) => update("content", e.target.value)}
            placeholder="Mô tả chi tiết về món ăn, nguồn gốc, cách thưởng thức..."
          />
        </Field>
        {/* Keep backward compatibility field but hide it */}
        {data.description && (
          <Field label="Mô tả (cũ)" error={errors.description}>
            <textarea
              className="input min-h-[80px]"
              value={data.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Mô tả cũ (sẽ chuyển sang summary/content)"
            />
          </Field>
        )}
      </Section>
      <Section title="Phân loại" desc="Giúp người dùng lọc & khám phá.">
        <div className="grid gap-4">
          <Field label="Danh mục *" error={errors.category}>
            <select
              className="input"
              value={data.category}
              onChange={(e) => update("category", e.target.value)}
              disabled={loadingTaxonomy}
            >
              <option value="">
                {loadingTaxonomy ? "Đang tải..." : "-- Chọn --"}
              </option>
              {categories.map((category) => (
                <option key={getId(category)} value={getId(category)}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Khẩu phần *" error={errors.servings}>
              <input
                type="number"
                min={1}
                className="input"
                value={data.servings}
                onChange={(e) =>
                  update("servings", toNumberOrEmpty(e.target.value))
                }
                placeholder="1"
              />
            </Field>
            <Field
              label="Chuẩn bị (phút) *"
              error={errors.prepTime || errors.durationPrep}
            >
              <input
                type="number"
                min={0}
                className="input"
                value={data.prepTime || data.durationPrep}
                onChange={(e) => {
                  const value = toNumberOrEmpty(e.target.value);
                  update("prepTime", value);
                  update("durationPrep", value); // Keep backward compatibility
                }}
                placeholder="0"
              />
            </Field>
            <Field
              label="Nấu (phút) *"
              error={errors.cookTime || errors.durationCook}
            >
              <input
                type="number"
                min={0}
                className="input"
                value={data.cookTime || data.durationCook}
                onChange={(e) => {
                  const value = toNumberOrEmpty(e.target.value);
                  update("cookTime", value);
                  update("durationCook", value); // Keep backward compatibility
                }}
                placeholder="0"
              />
            </Field>
          </div>
        </div>
      </Section>
      <Section title="Tags" desc="Chọn các tags mô tả món ăn.">
        <div className="space-y-2">
          {console.log(
            "[SubmitRecipe] Selected tags: ",
            data.tags,
            " | Available:",
            tags.map((t) => getId(t))
          )}
          {/* Selected tags display */}
          {Array.isArray(data.tags) && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {data.tags.map((tagId, index) => {
                const tag = tags.find((t) => getId(t) === tagId);
                return (
                  <span
                    key={tagId || index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800"
                  >
                    {tag?.name || tagId}
                    <button
                      type="button"
                      onClick={() => {
                        const newTags = (data.tags || []).filter(
                          (_, i) => i !== index
                        );
                        const newTasteTags = (data.tasteTags || []).filter(
                          (_, i) => i !== index
                        );
                        console.log("[SubmitRecipe] Removing tag:", tagId);
                        onChange({
                          ...data,
                          tags: newTags,
                          tasteTags: newTasteTags,
                        });
                      }}
                      className="ml-1 text-emerald-600 hover:text-emerald-800"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Tag selection */}
          <select
            onChange={(e) => {
              console.log("[SubmitRecipe] Tag select changed:", e.target.value);
              if (e.target.value && !data.tags.includes(e.target.value)) {
                console.log(
                  "[SubmitRecipe] Adding tag to draft:",
                  e.target.value
                );
                const newTags = [...(data.tags || []), e.target.value];
                const newTasteTags = [
                  ...(data.tasteTags || []),
                  e.target.value,
                ];
                onChange({ ...data, tags: newTags, tasteTags: newTasteTags });
              } else {
                console.log(
                  "[SubmitRecipe] Tag not added (empty or duplicate):",
                  e.target.value
                );
              }
              e.target.value = "";
            }}
            className="input"
            disabled={loadingTaxonomy}
          >
            <option value="">
              {loadingTaxonomy ? "Đang tải..." : "Thêm tag"}
            </option>
            {tags
              .filter((tag) => !data.tags || !data.tags.includes(getId(tag)))
              .map((tag) => (
                <option key={getId(tag)} value={getId(tag)}>
                  {tag.name}
                </option>
              ))}
          </select>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, desc, children }) {
  return (
    <section className="p-5 rounded-2xl border border-emerald-900/10 bg-white shadow-sm space-y-4">
      <header>
        <h3 className="text-sm font-semibold text-emerald-900">{title}</h3>
        {desc && <p className="text-xs text-emerald-700/70 mt-0.5">{desc}</p>}
      </header>
      {children}
    </section>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-emerald-800">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-emerald-700/70">{hint}</p>}
      {error && (
        <p className="text-[11px] text-rose-600 font-medium">{error}</p>
      )}
    </div>
  );
}
