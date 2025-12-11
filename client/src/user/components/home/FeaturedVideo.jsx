import React, { useState, useEffect } from "react";
import { recipesAPI } from "../../../services/recipesAPI.js";
import settingsAPI from "../../../services/settingsAPI";

function VideoSkeleton() {
  return (
    <div className="animate-pulse aspect-video w-full rounded-2xl bg-emerald-900/10" />
  );
}

export default function FeaturedVideo() {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedVideo = async () => {
      try {
        setLoading(true);

        // Trước tiên kiểm tra settings để lấy featuredVideo
        const settingsResponse = await settingsAPI.getPublicSettings();
        if (settingsResponse.success && settingsResponse.data?.featuredVideo) {
          const videoUrl = settingsResponse.data.featuredVideo;
          let thumbnailUrl = "/api/placeholder/800/450";

          // Extract YouTube video ID and create thumbnail URL
          const youtubeMatch = videoUrl.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
          );
          if (youtubeMatch) {
            const videoId = youtubeMatch[1];
            thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          }

          // Sử dụng video từ settings
          setVideo({
            title: "Video nổi bật",
            description: "Video đặc biệt được chọn bởi quản trị viên",
            videoUrl: videoUrl,
            poster: thumbnailUrl,
            duration: "▶",
            slug: null,
            isExternalVideo: true,
          });
          setLoading(false);
          return;
        }

        // Nếu không có featuredVideo trong settings, fallback về logic cũ
        const response = await recipesAPI.getRecipes({
          limit: 10,
          sort: "newest",
        });

        // Tìm recipe đầu tiên có video hoặc ảnh
        const recipeWithMedia = response.data?.find(
          (recipe) => recipe.images && recipe.images.length > 0
        );

        if (recipeWithMedia) {
          let imageUrl = null;
          if (recipeWithMedia.images[0]) {
            if (typeof recipeWithMedia.images[0] === "string") {
              imageUrl = recipeWithMedia.images[0];
            } else if (recipeWithMedia.images[0]?.url) {
              imageUrl = recipeWithMedia.images[0].url;
            } else if (recipeWithMedia.images[0]?.filename) {
              imageUrl = `/uploads/${recipeWithMedia.images[0].filename}`;
            }
          }

          setVideo({
            title: recipeWithMedia.title,
            description:
              recipeWithMedia.summary ||
              recipeWithMedia.description ||
              "Công thức nấu ăn chay ngon và bổ dưỡng",
            poster: imageUrl || "/api/placeholder/800/450",
            duration: `${
              (recipeWithMedia.prepTime || 0) + (recipeWithMedia.cookTime || 0)
            }′`,
            slug: recipeWithMedia.slug,
            isExternalVideo: false,
          });
        } else {
          // Fallback nếu không có recipe nào
          setVideo({
            title: "Khám phá ẩm thực chay",
            description: "Tận hưởng những món ăn chay ngon miệng và bổ dưỡng",
            poster: "/api/placeholder/800/450",
            duration: "5′",
            slug: null,
            isExternalVideo: false,
          });
        }
      } catch (err) {
        console.error("Error loading featured video:", err);
        setError(err);
        // Fallback data
        setVideo({
          title: "Khám phá ẩm thực chay",
          description: "Tận hưởng những món ăn chay ngon miệng và bổ dưỡng",
          poster: "/api/placeholder/800/450",
          duration: "5′",
          slug: null,
          isExternalVideo: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedVideo();
  }, []);

  if (error) {
    return null; // Ẩn component nếu có lỗi
  }
  return (
    <section className="space-y-4" aria-labelledby="featured-video-title">
      <h2
        id="featured-video-title"
        className="text-lg font-semibold tracking-tight text-emerald-950"
      >
        Video nổi bật
      </h2>
      {loading ? (
        <VideoSkeleton />
      ) : (
        <div className="relative group rounded-3xl overflow-hidden bg-emerald-900/10 aspect-video">
          <img
            src={video.poster}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/60 via-emerald-900/20 to-transparent" />
          <div className="absolute left-0 right-0 bottom-0 p-6 flex flex-col gap-3">
            <h3 className="text-xl font-semibold text-lime-50 drop-shadow-lg">
              {video.title}
            </h3>
            <p className="text-sm text-lime-100/80 max-w-2xl line-clamp-3">
              {video.description}
            </p>
            {video.isExternalVideo ? (
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Xem video nổi bật"
                className="mt-2 w-14 h-14 rounded-full bg-gradient-to-br from-lime-300 via-lime-400 to-emerald-300 text-emerald-950 flex items-center justify-center text-lg font-bold shadow-brand hover:scale-105 focus:outline-none focus:ring-4 focus:ring-lime-200/60"
              >
                ▶
              </a>
            ) : video.slug ? (
              <a
                href={`/recipes/${video.slug}`}
                aria-label="Xem công thức"
                className="mt-2 w-14 h-14 rounded-full bg-gradient-to-br from-lime-300 via-lime-400 to-emerald-300 text-emerald-950 flex items-center justify-center text-lg font-bold shadow-brand hover:scale-105 focus:outline-none focus:ring-4 focus:ring-lime-200/60"
              >
                ▶
              </a>
            ) : (
              <button
                aria-label="Phát video"
                className="mt-2 w-14 h-14 rounded-full bg-gradient-to-br from-lime-300 via-lime-400 to-emerald-300 text-emerald-950 flex items-center justify-center text-lg font-bold shadow-brand hover:scale-105 focus:outline-none focus:ring-4 focus:ring-lime-200/60"
              >
                ▶
              </button>
            )}
          </div>
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-medium bg-black/50 text-lime-200 backdrop-blur">
            {video.duration}
          </div>
        </div>
      )}
    </section>
  );
}
