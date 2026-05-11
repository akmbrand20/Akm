import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { uploadMultipleImages } from "../../services/uploadService";

export default function ProductImageManager({
  productName,
  color,
  colorIndex,
  images,
  onImagesChange,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    try {
      setError("");
      setUploading(true);

      const uploadedImages = await uploadMultipleImages({
        files: selectedFiles,
        folder: `akm/products/${productName}/${color.name}`,
        alt: `${productName} ${color.name}`,
      });

      onImagesChange(colorIndex, [...images, ...uploadedImages]);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to upload images. Check Cloudinary settings."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (imageIndex) => {
    const updatedImages = images.filter((_, index) => index !== imageIndex);
    onImagesChange(colorIndex, updatedImages);
  };

  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="font-semibold">{color.name} Images</h4>
          <p className="mt-1 text-sm text-zinc-500">
            Upload product photos for this color.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#c8b89d]/60 disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ImagePlus size={16} />
              Upload Images
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {images.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
          No images added for {color.name}.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, imageIndex) => (
            <div
              key={`${image.url}-${imageIndex}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
            >
              <div className="aspect-square">
                <img
                  src={image.url}
                  alt={image.alt || `${productName} ${color.name}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemoveImage(imageIndex)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-red-200 opacity-100 transition hover:bg-red-500 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Trash2 size={15} />
              </button>

              {imageIndex === 0 && (
                <span className="absolute bottom-2 left-2 rounded-full bg-[#c8b89d] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-black">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs leading-5 text-zinc-500">
        The first image is used as the main product image for this color. Drag
        sorting is not added yet, so upload the best image first.
      </p>
    </div>
  );
}