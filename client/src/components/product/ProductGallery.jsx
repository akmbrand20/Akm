import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function ProductGallery({ images = [], productName }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeImages = useMemo(() => {
    const filteredImages = Array.isArray(images)
      ? images.filter((image) => image?.url)
      : [];

    if (filteredImages.length > 0) return filteredImages;

    return [
      {
        url: "/images/akm-logo.webp",
        alt: productName || "AKM product",
      },
    ];
  }, [images, productName]);

  useEffect(() => {
    setActiveIndex(0);
  }, [safeImages]);

  const safeActiveIndex =
    activeIndex >= 0 && activeIndex < safeImages.length ? activeIndex : 0;

  const activeImage =
    safeImages[safeActiveIndex] || {
      url: "/images/akm-logo.webp",
      alt: productName || "AKM product",
    };

  const goPrevious = () => {
    setActiveIndex((prev) => {
      if (safeImages.length <= 1) return 0;
      return prev <= 0 ? safeImages.length - 1 : prev - 1;
    });
  };

  const goNext = () => {
    setActiveIndex((prev) => {
      if (safeImages.length <= 1) return 0;
      return prev >= safeImages.length - 1 ? 0 : prev + 1;
    });
  };

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-hidden">
      <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="aspect-[4/5]">
          <img
            src={activeImage.url}
            alt={activeImage.alt || productName || "AKM product"}
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>

        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrevious}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur-md transition hover:bg-black md:h-11 md:w-11"
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur-md transition hover:bg-black md:h-11 md:w-11"
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-zinc-200 backdrop-blur-md">
              {safeActiveIndex + 1} / {safeImages.length}
            </div>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="w-full max-w-full overflow-x-auto overscroll-x-contain pb-2">
          <div className="flex w-max max-w-none gap-3">
            {safeImages.map((image, index) => (
              <button
                key={`${image.url}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border transition ${
                  safeActiveIndex === index
                    ? "border-[#c8b89d]"
                    : "border-white/10 opacity-70 hover:opacity-100"
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={image.url}
                  alt={image.alt || productName || "AKM product"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}