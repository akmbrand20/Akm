import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import ProductImageManager from "./ProductImageManager";
import {
  DEFAULT_CATEGORY_SUGGESTIONS,
  DEFAULT_COLOR_SUGGESTIONS,
  DEFAULT_SIZE_SUGGESTIONS,
  formatProductLabel,
} from "../../lib/constants";

const createSlug = (value = "") => {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const createEmptySize = (size = "M") => {
  return {
    size,
    stock: 0,
  };
};

const createEmptyColor = (name = "Black") => {
  return {
    name,
    images: [],
    sizes: ["M", "L", "XL"].map((size) => createEmptySize(size)),
  };
};

export const createDefaultProductForm = () => {
  return {
    name: "",
    slug: "",
    category: "tshirt",
    price: "",
    oldPrice: "",
    description: "",
    fabric: "",
    fit: "",
    careInstructions: "",
    colors: [createEmptyColor("Black")],
    featured: true,
    isActive: true,
  };
};

export default function ProductForm({
  title,
  subtitle,
  initialForm,
  submitLabel,
  loadingLabel,
  mutation,
  onSubmit,
}) {
  const [form, setForm] = useState(initialForm || createDefaultProductForm());
  const [manualSlug, setManualSlug] = useState(Boolean(initialForm?.slug));
  const [newColorName, setNewColorName] = useState("");
  const [newSizeByColor, setNewSizeByColor] = useState({});

  const selectedColorNames = useMemo(() => {
    return form.colors.map((color) => color.name.toLowerCase());
  }, [form.colors]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      const nextForm = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "name" && !manualSlug) {
        nextForm.slug = createSlug(value);
      }

      if (name === "slug") {
        nextForm.slug = createSlug(value);
      }

      if (name === "category") {
        nextForm.category = createSlug(value);
      }

      return nextForm;
    });
  };

  const setSuggestedCategory = (category) => {
    setForm((prev) => ({
      ...prev,
      category: category,
    }));
  };

  const addColor = (colorName) => {
    const cleanColorName = String(colorName || "").trim();

    if (!cleanColorName) return;

    const exists = form.colors.some(
      (color) => color.name.toLowerCase() === cleanColorName.toLowerCase()
    );

    if (exists) {
      setNewColorName("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      colors: [...prev.colors, createEmptyColor(cleanColorName)],
    }));

    setNewColorName("");
  };

  const removeColor = (colorIndex) => {
    setForm((prev) => {
      if (prev.colors.length === 1) return prev;

      return {
        ...prev,
        colors: prev.colors.filter((_, index) => index !== colorIndex),
      };
    });
  };

  const changeColorName = (colorIndex, value) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.map((color, index) =>
        index === colorIndex ? { ...color, name: value } : color
      ),
    }));
  };

  const addSize = (colorIndex, sizeName) => {
    const cleanSizeName = String(sizeName || "").trim();

    if (!cleanSizeName) return;

    setForm((prev) => ({
      ...prev,
      colors: prev.colors.map((color, index) => {
        if (index !== colorIndex) return color;

        const exists = color.sizes.some(
          (sizeItem) =>
            sizeItem.size.toLowerCase() === cleanSizeName.toLowerCase()
        );

        if (exists) return color;

        return {
          ...color,
          sizes: [...color.sizes, createEmptySize(cleanSizeName)],
        };
      }),
    }));

    setNewSizeByColor((prev) => ({
      ...prev,
      [colorIndex]: "",
    }));
  };

  const removeSize = (colorIndex, sizeIndex) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.map((color, index) => {
        if (index !== colorIndex) return color;
        if (color.sizes.length === 1) return color;

        return {
          ...color,
          sizes: color.sizes.filter((_, currentIndex) => currentIndex !== sizeIndex),
        };
      }),
    }));
  };

  const changeSizeName = (colorIndex, sizeIndex, value) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.map((color, index) => {
        if (index !== colorIndex) return color;

        return {
          ...color,
          sizes: color.sizes.map((sizeItem, currentIndex) =>
            currentIndex === sizeIndex
              ? { ...sizeItem, size: value }
              : sizeItem
          ),
        };
      }),
    }));
  };

  const changeStock = (colorIndex, sizeIndex, value) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.map((color, index) => {
        if (index !== colorIndex) return color;

        return {
          ...color,
          sizes: color.sizes.map((sizeItem, currentIndex) =>
            currentIndex === sizeIndex
              ? {
                  ...sizeItem,
                  stock: Math.max(0, Number(value || 0)),
                }
              : sizeItem
          ),
        };
      }),
    }));
  };

  const handleImagesChange = (colorIndex, images) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.map((color, index) =>
        index === colorIndex ? { ...color, images } : color
      ),
    }));
  };

  const prepareForm = () => {
    return {
      ...form,
      name: form.name.trim(),
      slug: createSlug(form.slug || form.name),
      category: createSlug(form.category),
      price: Number(form.price),
      oldPrice: form.oldPrice === "" ? null : Number(form.oldPrice),
      description: form.description.trim(),
      fabric: form.fabric.trim(),
      fit: form.fit.trim(),
      careInstructions: form.careInstructions.trim(),
      colors: form.colors.map((color) => ({
        ...color,
        name: color.name.trim(),
        sizes: color.sizes.map((sizeItem) => ({
          size: sizeItem.size.trim(),
          stock: Math.max(0, Number(sizeItem.stock || 0)),
        })),
      })),
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(prepareForm());
  };

  return (
    <div>
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-[#c8b89d] hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to products
      </Link>

      <div className="mt-8">
        <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
          Products
        </p>
        <h1 className="mt-3 text-4xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-zinc-400">{subtitle}</p>}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-8 xl:grid-cols-[1fr_380px]"
      >
        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Basic Info</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-zinc-300">Product name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Example: AKM Hoodie"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">Slug</label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={(e) => {
                    setManualSlug(true);
                    handleChange(e);
                  }}
                  placeholder="example: akm-hoodie"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-zinc-300">Category</label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="hoodie, sweater, shorts..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {DEFAULT_CATEGORY_SUGGESTIONS.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSuggestedCategory(category)}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:border-[#c8b89d]/60 hover:text-white"
                    >
                      {formatProductLabel(category)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-300">Price</label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="850"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  Old price, optional
                </label>
                <input
                  name="oldPrice"
                  type="number"
                  min="0"
                  value={form.oldPrice}
                  onChange={handleChange}
                  placeholder="Leave empty if no old price"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Product Content</h2>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-sm text-zinc-300">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Write the product description..."
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">Fabric</label>
                <textarea
                  name="fabric"
                  value={form.fabric}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Premium fabric details..."
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">Fit</label>
                <input
                  name="fit"
                  value={form.fit}
                  onChange={handleChange}
                  placeholder="Relaxed fit, oversized fit..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  Care instructions
                </label>
                <textarea
                  name="careInstructions"
                  value={form.careInstructions}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Wash with similar colors..."
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Colors, Sizes & Stock</h2>

            <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
              <label className="text-sm text-zinc-300">Add color</label>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Example: Navy"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />

                <button
                  type="button"
                  onClick={() => addColor(newColorName)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f7f2ea] px-5 py-3 text-sm font-semibold text-black hover:bg-white"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {DEFAULT_COLOR_SUGGESTIONS.map((colorName) => (
                  <button
                    key={colorName}
                    type="button"
                    onClick={() => addColor(colorName)}
                    disabled={selectedColorNames.includes(colorName.toLowerCase())}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:border-[#c8b89d]/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {colorName}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {form.colors.map((color, colorIndex) => (
                <div
                  key={`${color.name}-${colorIndex}`}
                  className="rounded-3xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-full">
                      <label className="text-sm text-zinc-300">
                        Color name
                      </label>
                      <input
                        value={color.name}
                        onChange={(e) =>
                          changeColorName(colorIndex, e.target.value)
                        }
                        placeholder="Color name"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                      />
                    </div>

                    {form.colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColor(colorIndex)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-red-400/20 px-4 py-2 text-sm text-red-200 hover:bg-red-500/10"
                      >
                        <X size={15} />
                        Remove Color
                      </button>
                    )}
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <label className="text-sm text-zinc-300">Add size</label>

                    <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                      <input
                        value={newSizeByColor[colorIndex] || ""}
                        onChange={(e) =>
                          setNewSizeByColor((prev) => ({
                            ...prev,
                            [colorIndex]: e.target.value,
                          }))
                        }
                        placeholder="Example: XXL or One Size"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          addSize(colorIndex, newSizeByColor[colorIndex])
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm text-white hover:border-[#c8b89d]/60"
                      >
                        <Plus size={16} />
                        Add Size
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {DEFAULT_SIZE_SUGGESTIONS.map((sizeName) => (
                        <button
                          key={sizeName}
                          type="button"
                          onClick={() => addSize(colorIndex, sizeName)}
                          disabled={color.sizes.some(
                            (item) =>
                              item.size.toLowerCase() === sizeName.toLowerCase()
                          )}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:border-[#c8b89d]/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {sizeName}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {color.sizes.map((sizeItem, sizeIndex) => (
                      <div
                        key={`${sizeItem.size}-${sizeIndex}`}
                        className="rounded-2xl border border-white/10 bg-black/25 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="w-full">
                            <label className="text-xs text-zinc-400">
                              Size
                            </label>
                            <input
                              value={sizeItem.size}
                              onChange={(e) =>
                                changeSizeName(
                                  colorIndex,
                                  sizeIndex,
                                  e.target.value
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                            />
                          </div>

                          {color.sizes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSize(colorIndex, sizeIndex)}
                              className="mt-6 rounded-full p-2 text-red-200 hover:bg-red-500/10"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>

                        <div className="mt-3">
                          <label className="text-xs text-zinc-400">
                            Stock
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={sizeItem.stock}
                            onChange={(e) =>
                              changeStock(colorIndex, sizeIndex, e.target.value)
                            }
                            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <ProductImageManager
                    productName={form.name || "AKM Product"}
                    color={color}
                    colorIndex={colorIndex}
                    images={color.images}
                    onImagesChange={handleImagesChange}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6 xl:sticky xl:top-8 xl:self-start">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Publishing</h2>

            <div className="mt-5 grid gap-4">
              <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-4">
                <span>Featured</span>
                <input
                  name="featured"
                  type="checkbox"
                  checked={form.featured}
                  onChange={handleChange}
                  className="h-5 w-5"
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-4">
                <span>Active on store</span>
                <input
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-5 w-5"
                />
              </label>
            </div>

            {mutation.isError && (
              <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {mutation.error?.response?.data?.message ||
                  "Failed to save product."}
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#f7f2ea] px-6 py-4 font-semibold text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {mutation.isPending ? loadingLabel : submitLabel}
            </button>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-zinc-400">
            <p>
              You can add any product type, any color, and any size. The
              suggestions are only shortcuts, not limits.
            </p>
          </section>
        </div>
      </form>
    </div>
  );
}