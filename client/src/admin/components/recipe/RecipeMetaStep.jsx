/** RecipeMetaStep
 * Props: { data, onChange, errors }
 */
import React, { useEffect, useState } from "react";
import { useAdminApi } from "../../contexts/AdminApiContext.jsx";

export default function RecipeMetaStep({ data, onChange, errors = {} }) {
  const adminApi = useAdminApi();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(false);

  // Load categories and tags from API
  useEffect(() => {
    const loadTaxonomy = async () => {
      setLoadingTaxonomy(true);
      try {
        // Load categories
        const categoriesResult = await adminApi.safeApiCall(
          () => adminApi.getCategories(),
          { defaultErrorMessage: "Không thể tải danh mục" }
        );

        if (categoriesResult.success) {
          const categoryData =
            categoriesResult.data?.data || categoriesResult.data;
          const categoryItems = categoryData.items || categoryData || [];
          setCategories(Array.isArray(categoryItems) ? categoryItems : []);
        }

        // Load tags
        const tagsResult = await adminApi.safeApiCall(
          () => adminApi.getTags(),
          { defaultErrorMessage: "Không thể tải tags" }
        );

        if (tagsResult.success) {
          const tagData = tagsResult.data?.data || tagsResult.data;
          const tagItems = tagData.items || tagData || [];
          setTags(Array.isArray(tagItems) ? tagItems : []);
        }
      } catch (error) {
        console.error("Failed to load taxonomy:", error);
      } finally {
        setLoadingTaxonomy(false);
      }
    };

    loadTaxonomy();
  }, [adminApi]);
  // Auto slug from title
  useEffect(() => {
    if (data.title && !data.slugTouched) {
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      onChange({ ...data, slug, slugTouched: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.title]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
            Tiêu đề
          </label>
          <input
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            className={`input ${errors.title ? "border-red-500" : ""}`}
            placeholder="Tiêu đề công thức"
          />
          {errors.title && (
            <p className="text-xs text-red-600">{errors.title}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
            Đường dẫn
          </label>
          <input
            value={data.slug}
            onChange={(e) =>
              onChange({ ...data, slug: e.target.value, slugTouched: true })
            }
            className={`input ${errors.slug ? "border-red-500" : ""}`}
            placeholder="tự động tạo"
          />
          {errors.slug && <p className="text-xs text-red-600">{errors.slug}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
          Tóm tắt
        </label>
        <textarea
          value={data.summary}
          onChange={(e) => onChange({ ...data, summary: e.target.value })}
          className={`input min-h-[80px] resize-y ${
            errors.summary ? "border-red-500" : ""
          }`}
          placeholder="Tóm tắt ngắn gọn về công thức"
        />
        {errors.summary && (
          <p className="text-xs text-red-600">{errors.summary}</p>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
          Nội dung
        </label>
        <textarea
          value={data.content}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          className={`input min-h-[120px] resize-y ${
            errors.content ? "border-red-500" : ""
          }`}
          placeholder="Nội dung chi tiết về công thức"
        />
        {errors.content && (
          <p className="text-xs text-red-600">{errors.content}</p>
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
            Danh mục
          </label>
          <select
            value={data.category}
            onChange={(e) => onChange({ ...data, category: e.target.value })}
            className={`input ${errors.category ? "border-red-500" : ""}`}
            disabled={loadingTaxonomy}
          >
            <option value="">
              {loadingTaxonomy ? "Đang tải..." : "Chọn danh mục"}
            </option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-red-600">{errors.category}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
            Thời gian chuẩn bị (phút)
          </label>
          <input
            type="number"
            min="0"
            value={data.prepTime}
            onChange={(e) =>
              onChange({ ...data, prepTime: parseInt(e.target.value) || 0 })
            }
            className={`input ${errors.prepTime ? "border-red-500" : ""}`}
            placeholder="0"
          />
          {errors.prepTime && (
            <p className="text-xs text-red-600">{errors.prepTime}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
            Thời gian nấu (phút)
          </label>
          <input
            type="number"
            min="0"
            value={data.cookTime}
            onChange={(e) =>
              onChange({ ...data, cookTime: parseInt(e.target.value) || 0 })
            }
            className={`input ${errors.cookTime ? "border-red-500" : ""}`}
            placeholder="0"
          />
          {errors.cookTime && (
            <p className="text-xs text-red-600">{errors.cookTime}</p>
          )}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
            Số khẩu phần
          </label>
          <input
            type="number"
            min="1"
            value={data.servings}
            onChange={(e) =>
              onChange({ ...data, servings: parseInt(e.target.value) || 1 })
            }
            className={`input ${errors.servings ? "border-red-500" : ""}`}
            placeholder="1"
          />
          {errors.servings && (
            <p className="text-xs text-red-600">{errors.servings}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
            Tags
          </label>

          {/* Selected tags display */}
          {Array.isArray(data.tags) && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {data.tags.map((tagId, index) => {
                const tag = tags.find((t) => t._id === tagId);
                return (
                  <span
                    key={tagId || index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800"
                  >
                    {tag?.name || tagId}
                    <button
                      type="button"
                      onClick={() => {
                        const newTags = data.tags.filter((_, i) => i !== index);
                        onChange({ ...data, tags: newTags });
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
              if (e.target.value && !data.tags.includes(e.target.value)) {
                const newTags = [...(data.tags || []), e.target.value];
                onChange({ ...data, tags: newTags });
              }
              e.target.value = "";
            }}
            className={`input ${errors.tags ? "border-red-500" : ""}`}
            disabled={loadingTaxonomy}
          >
            <option value="">
              {loadingTaxonomy ? "Đang tải..." : "Thêm tag"}
            </option>
            {tags
              .filter((tag) => !data.tags || !data.tags.includes(tag._id))
              .map((tag) => (
                <option key={tag._id} value={tag._id}>
                  {tag.name}
                </option>
              ))}
          </select>

          {errors.tags && <p className="text-xs text-red-600">{errors.tags}</p>}
        </div>
      </div>
    </div>
  );
}
