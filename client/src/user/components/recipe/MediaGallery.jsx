import React, { useEffect, useRef, useState } from "react";

// Simple lightbox for images & optional video
export default function MediaGallery({ images = [], videoUrl }) {
  // images: có thể là [{ _id, url, alt, ... }] (API) hoặc chuỗi URL hoặc {src, alt}
  const [openIdx, setOpenIdx] = useState(null); // number | 'video'
  const dialogRef = useRef(null);
  const prevActive = useRef(null);

  // Helpers to normalize various image shapes
  const getSrc = (img) => {
    if (!img) return null;
    if (typeof img === "string") return img;
    return img.url || img.src || null;
  };
  const getAlt = (img, i) => {
    if (!img) return `Hình ${i + 1}`;
    if (typeof img === "string") return `Hình ${i + 1}`;
    return img.alt || img.originalName || `Hình ${i + 1}`;
  };
  const getKey = (img, i) => img?._id || img?.id || i;

  // Detect video item from images
  const isVideoItem = (item) => {
    if (!item || typeof item === "string") return false;
    if (item.type === "video") return true;
    if (item.mimeType && String(item.mimeType).startsWith("video")) return true;
    const src = getSrc(item) || "";
    return /(\.mp4|\.webm|\.mov|\.avi)$/i.test(src);
  };
  const firstVideo = Array.isArray(images)
    ? images.find((m) => isVideoItem(m))
    : null;
  const imageItems = Array.isArray(images)
    ? images.filter((m) => !isVideoItem(m))
    : [];
  const resolvedVideoUrl = videoUrl || getSrc(firstVideo);
  const resolvedVideoThumb =
    firstVideo?.thumbnailUrl || firstVideo?.thumb || null;

  const open = (idx) => {
    prevActive.current = document.activeElement;
    setOpenIdx(idx);
  };
  const close = () => {
    setOpenIdx(null);
    setTimeout(() => {
      prevActive.current && prevActive.current.focus?.();
    }, 0);
  };

  // Keyboard navigation
  useEffect(() => {
    if (openIdx !== null && dialogRef.current) {
      const handleKey = (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          close();
        }
        if (e.key === "ArrowRight") {
          setOpenIdx((prev) => {
            if (imageItems.length === 0) return prev;
            if (prev === "video") return 0;
            if (typeof prev === "number") {
              const next = prev + 1;
              return next >= imageItems.length ? 0 : next;
            }
            return prev;
          });
        }
        if (e.key === "ArrowLeft") {
          setOpenIdx((prev) => {
            if (imageItems.length === 0) return prev;
            if (prev === "video") return imageItems.length - 1;
            if (typeof prev === "number") {
              const next = prev - 1;
              return next < 0 ? imageItems.length - 1 : next;
            }
            return prev;
          });
        }
      };
      window.addEventListener("keydown", handleKey, true);
      return () => window.removeEventListener("keydown", handleKey, true);
    }
  }, [openIdx, imageItems.length]);

  // Prevent body scroll when open
  useEffect(() => {
    if (openIdx !== null) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => (document.body.style.overflow = prev);
    }
  }, [openIdx]);

  const mediaCount = imageItems.length + (resolvedVideoUrl ? 1 : 0);
  if (mediaCount === 0) {
    return (
      <div className="rounded-xl border border-emerald-900/10 p-6 text-center text-sm text-emerald-800/60 bg-white shadow-sm">
        Chưa có hình ảnh hoặc video minh hoạ.
      </div>
    );
  }

  return (
    <div className="space-y-3" aria-labelledby="media-title">
      <h3
        id="media-title"
        className="text-sm font-semibold uppercase tracking-wide text-emerald-900/70"
      >
        Hình ảnh & Video
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {resolvedVideoUrl && (
          <button
            onClick={() => open("video")}
            className="relative group aspect-video rounded-xl overflow-hidden ring-1 ring-emerald-900/15 bg-emerald-950/5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            aria-label="Mở video"
          >
            <div className="absolute inset-0">
              {resolvedVideoThumb ? (
                <img
                  src={resolvedVideoThumb}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-12 h-12 rounded-full bg-emerald-950/70 text-lime-300 flex items-center justify-center text-xs font-semibold shadow-inner group-hover:scale-105 transition">
                  ▶
                </span>
              </div>
            </div>
            <div className="absolute bottom-1 left-1 bg-emerald-950/70 text-[10px] px-2 py-0.5 rounded text-lime-200 font-medium">
              VIDEO
            </div>
          </button>
        )}

        {imageItems.map((img, i) => {
          const src = getSrc(img);
          const alt = getAlt(img, i);
          const key = getKey(img, i);
          return (
            <button
              key={key}
              onClick={() => open(i)}
              className="relative group aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-emerald-900/15 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
              aria-label={`Mở hình ${i + 1}`}
            >
              <div className="absolute inset-0 w-full h-full flex items-center justify-center text-[10px] font-medium text-emerald-700">
                {src ? (
                  <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.textContent = "IMG";
                    }}
                  />
                ) : (
                  "IMG"
                )}
              </div>
            </button>
          );
        })}
      </div>

      {openIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Xem media"
        >
          <div
            className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
          <div
            ref={dialogRef}
            className="relative w-full max-w-4xl mx-auto bg-emerald-950/30 rounded-2xl overflow-hidden ring-1 ring-lime-100/10 shadow-2xl"
          >
            <button
              onClick={close}
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-emerald-950/70 text-lime-200 flex items-center justify-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-lime-300/60"
              aria-label="Đóng"
            >
              ✕
            </button>

            {openIdx === "video" ? (
              <div className="aspect-video bg-black">
                {(() => {
                  const src = resolvedVideoUrl;
                  const isEmbed =
                    typeof src === "string" &&
                    /youtube|youtu\.be|vimeo/.test(src || "");
                  return isEmbed ? (
                    <iframe
                      src={src}
                      title="Video công thức"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={src || ""}
                      controls
                      className="w-full h-full"
                      preload="metadata"
                    />
                  );
                })()}
              </div>
            ) : (
              <div className="relative">
                {(() => {
                  const src = getSrc(imageItems[openIdx]);
                  const alt = getAlt(imageItems[openIdx], openIdx);
                  return (
                    <div className="max-h-[80vh] w-full bg-emerald-950/40 flex items-center justify-center">
                      {src ? (
                        <img
                          src={src}
                          alt={alt}
                          className="max-h-[80vh] w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.textContent = "IMG";
                          }}
                        />
                      ) : (
                        <div className="text-lime-200 text-sm font-medium">
                          IMG
                        </div>
                      )}
                    </div>
                  );
                })()}

                {imageItems.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setOpenIdx((prev) =>
                          typeof prev === "number"
                            ? (prev - 1 + imageItems.length) % imageItems.length
                            : prev
                        )
                      }
                      className="absolute top-1/2 -translate-y-1/2 left-2 w-10 h-10 rounded-full bg-emerald-950/70 text-lime-200 flex items-center justify-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-lime-300/60"
                      aria-label="Hình trước"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() =>
                        setOpenIdx((prev) =>
                          typeof prev === "number"
                            ? (prev + 1) % imageItems.length
                            : prev
                        )
                      }
                      className="absolute top-1/2 -translate-y-1/2 right-2 w-10 h-10 rounded-full bg-emerald-950/70 text-lime-200 flex items-center justify-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-lime-300/60"
                      aria-label="Hình kế tiếp"
                    >
                      ▶
                    </button>
                  </>
                )}

                {imageItems.length > 1 && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                    {imageItems.map((img, dotIdx) => (
                      <button
                        key={getKey(img, dotIdx)}
                        onClick={() => setOpenIdx(dotIdx)}
                        aria-label={`Chuyển tới hình ${dotIdx + 1}`}
                        className={`w-2.5 h-2.5 rounded-full border border-lime-200/40 transition ${
                          openIdx === dotIdx
                            ? "bg-lime-300 scale-110"
                            : "bg-lime-100/20 hover:bg-lime-200/40"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
