/** RecipePreviewStep
 * Props: { data }
 */
import React, { useState, useEffect } from "react";
import { useAdminApi } from "../../contexts/AdminApiContext.jsx";
import StatusPill from "../../components/StatusPill.jsx";

export default function RecipePreviewStep({ data }) {
  const { getMedia, getMediaById } = useAdminApi();
  const [processedImages, setProcessedImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [tagNames, setTagNames] = useState([]);
  const adminApi = useAdminApi();

  // Load taxonomy names for display
  useEffect(() => {
    const loadTaxonomyNames = async () => {
      try {
        // Load category name
        if (data.category) {
          const categoriesResult = await adminApi.safeApiCall(
            () => adminApi.getCategories(),
            { defaultErrorMessage: "Không thể tải danh mục" }
          );

          if (categoriesResult.success) {
            const categoryData =
              categoriesResult.data?.data || categoriesResult.data;
            const categoryItems = categoryData.items || categoryData || [];
            const category = categoryItems.find(
              (cat) => cat._id === data.category
            );
            setCategoryName(category?.name || data.category);
          }
        }

        // Load tag names
        if (data.tags && data.tags.length > 0) {
          const tagsResult = await adminApi.safeApiCall(
            () => adminApi.getTags(),
            { defaultErrorMessage: "Không thể tải tags" }
          );

          if (tagsResult.success) {
            const tagData = tagsResult.data?.data || tagsResult.data;
            const tagItems = tagData.items || tagData || [];
            const resolvedTagNames = data.tags.map((tagId) => {
              const tag = tagItems.find((t) => t._id === tagId);
              return tag?.name || tagId;
            });
            setTagNames(resolvedTagNames);
          }
        }
      } catch (error) {
        console.error("Failed to load taxonomy names:", error);
        // Fallback to using IDs
        setCategoryName(data.category);
        setTagNames(data.tags || []);
      }
    };

    loadTaxonomyNames();
  }, [data.category, data.tags, adminApi]);

  // Debug info
  console.log("RecipePreviewStep data:", data);
  console.log("Images:", data.images);
  console.log(
    "Images type check:",
    data.images?.map((img) => ({
      value: img,
      type: typeof img,
      isObject: typeof img === "object",
      hasUrl: typeof img === "object" && img?.url,
      keys: typeof img === "object" ? Object.keys(img) : "not object",
    }))
  );

  useEffect(() => {
    const processImages = async () => {
      if (!data.images || data.images.length === 0) {
        setProcessedImages([]);
        return;
      }

      setIsLoadingImages(true);
      const processed = [];

      for (const image of data.images) {
        // If it's already an object with url, use it directly
        if (typeof image === "object" && image.url) {
          processed.push(image);
        }
        // If it's a string ID, try to fetch the media object from API
        else if (typeof image === "string") {
          console.warn("Found old format image ID, fetching from API:", image);
          try {
            // Try direct fetch by ID first
            let mediaItem = null;
            try {
              const directResponse = await getMediaById(image);
              if (directResponse?.data) {
                mediaItem = directResponse.data;
                console.log("Successfully fetched media by ID:", mediaItem);
              }
            } catch (directError) {
              console.log(
                "Direct fetch failed, trying search method:",
                directError.message
              );
              // Fallback to search method
              const searchResponse = await getMedia({
                search: image,
                limit: 10,
              });
              if (searchResponse?.data?.length > 0) {
                // Try to find exact match by ID or filename
                mediaItem =
                  searchResponse.data.find(
                    (item) =>
                      item._id === image ||
                      item.filename?.includes(image) ||
                      item.originalFilename?.includes(image)
                  ) || searchResponse.data[0];
                console.log("Found media via search:", mediaItem);
              }
            }

            if (mediaItem) {
              processed.push({
                _id: mediaItem._id,
                url: mediaItem.url,
                alt: mediaItem.alt || mediaItem.filename,
                filename: mediaItem.filename,
              });
              console.log(
                "Successfully converted old format ID to object:",
                mediaItem
              );
            } else {
              console.warn("Could not find media item for ID:", image);
            }
          } catch (error) {
            console.error(
              "Error fetching media for old format ID:",
              image,
              error
            );
          }
        }
      }

      setProcessedImages(processed);
      setIsLoadingImages(false);
    };

    processImages();
  }, [data.images, getMedia, getMediaById]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl overflow-hidden bg-white border border-emerald-900/10 shadow-sm">
        {isLoadingImages ? (
          <div className="aspect-video w-full bg-emerald-900/10 flex items-center justify-center">
            <div className="text-center text-emerald-600">
              <div className="text-2xl mb-2">⏳</div>
              <div className="text-sm">Đang tải hình ảnh...</div>
            </div>
          </div>
        ) : processedImages && processedImages.length > 0 ? (
          <div className="aspect-video w-full bg-emerald-900/10">
            <img
              src={processedImages[0].thumbnailUrl || processedImages[0].url}
              alt={processedImages[0].alt || data.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div
              className="w-full h-full flex items-center justify-center text-emerald-600 bg-emerald-50"
              style={{ display: "none" }}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🖼️</div>
                <div className="text-sm">Không thể tải media</div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-start">
            <h1 className="text-2xl font-semibold text-emerald-900 flex-1">
              {data.title || "Công thức chưa có tiêu đề"}
            </h1>
            <StatusPill status={data.status || "draft"} />
          </div>

          {data.summary && (
            <p className="text-sm text-emerald-800/80 leading-relaxed font-medium">
              {data.summary}
            </p>
          )}

          {data.content && (
            <div className="prose prose-sm max-w-none text-emerald-900/90">
              <p className="whitespace-pre-line">{data.content}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-4 text-center">
            {data.category && (
              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="text-xs text-emerald-600 uppercase tracking-wide font-medium">
                  Danh mục
                </div>
                <div className="text-sm font-semibold text-emerald-800 capitalize">
                  {categoryName || data.category}
                </div>
              </div>
            )}
            {data.prepTime > 0 && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-600 uppercase tracking-wide font-medium">
                  Chuẩn bị
                </div>
                <div className="text-sm font-semibold text-blue-800">
                  {data.prepTime} phút
                </div>
              </div>
            )}
            {data.cookTime > 0 && (
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="text-xs text-orange-600 uppercase tracking-wide font-medium">
                  Nấu nướng
                </div>
                <div className="text-sm font-semibold text-orange-800">
                  {data.cookTime} phút
                </div>
              </div>
            )}
            {data.servings > 0 && (
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-xs text-purple-600 uppercase tracking-wide font-medium">
                  Khẩu phần
                </div>
                <div className="text-sm font-semibold text-purple-800">
                  {data.servings} người
                </div>
              </div>
            )}
          </div>

          {data.tags && data.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-900/70">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tagNames.map((tagName, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full"
                  >
                    #{tagName}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-900/70">
              Nguyên liệu
            </h3>
            <div className="space-y-1">
              {data.ingredients && data.ingredients.length > 0 ? (
                data.ingredients.map((ing, idx) => (
                  <div
                    key={ing._id || idx}
                    className="flex justify-between items-start py-1 border-b border-emerald-100 last:border-0"
                  >
                    <span className="text-sm text-emerald-900/90 font-medium">
                      {ing.name}
                    </span>
                    <div className="text-right text-sm">
                      <span className="text-emerald-700">
                        {ing.amount} {ing.unit}
                      </span>
                      {ing.notes && (
                        <div className="text-xs text-emerald-600/70">
                          {ing.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-emerald-800/60 italic">
                  Chưa có nguyên liệu nào
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-900/70">
              Các bước thực hiện
            </h3>
            <div className="space-y-3">
              {data.steps && data.steps.length > 0 ? (
                data.steps.map((step, idx) => (
                  <div key={step._id || idx} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0 mt-1">
                      {step.order}
                    </div>
                    <div className="flex-1">
                      {step.title && (
                        <h4 className="text-sm font-medium text-emerald-900 mb-1">
                          {step.title}
                        </h4>
                      )}
                      <p className="text-sm text-emerald-900/90 leading-relaxed">
                        {step.description}
                      </p>
                      <div className="flex gap-4 mt-1 text-xs text-emerald-700/70">
                        {step.duration > 0 && (
                          <span>⏱ {step.duration} phút</span>
                        )}
                        {step.temperature && <span>🌡 {step.temperature}</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-emerald-800/60 italic">
                  Chưa có bước thực hiện nào
                </p>
              )}
            </div>
          </div>

          {processedImages && processedImages.length > 1 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-900/70">
                Media bổ sung
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {processedImages.slice(1).map((image, idx) => (
                  <div
                    key={image._id || idx}
                    className="aspect-video rounded-lg overflow-hidden bg-emerald-50"
                  >
                    <img
                      src={image.thumbnailUrl || image.url}
                      alt={image.alt || `Media ${idx + 2}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div
                      className="w-full h-full flex items-center justify-center text-emerald-600"
                      style={{ display: "none" }}
                    >
                      <div className="text-center">
                        <div className="text-xl mb-1">🖼️</div>
                        <div className="text-xs">Không thể tải media</div>
                      </div>
                    </div>
                    {image.caption && (
                      <p className="text-xs text-emerald-700/70 mt-1">
                        {image.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
