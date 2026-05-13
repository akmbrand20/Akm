import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, ShoppingBag, Zap } from "lucide-react";

import { formatCurrency } from "../../lib/formatCurrency";
import {
  getAvailableSizesForColor,
  getColorImages,
  getVariantStock,
} from "../../lib/getVariantStock";
import { getProductBySlug } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import { useSettings } from "../../context/SettingsContext";
import { trackAddToCart, trackViewContent } from "../../tracking/trackingEvents";
import { formatProductLabel } from "../../lib/constants";

import ProductGallery from "../../components/product/ProductGallery";
import ColorSelector from "../../components/product/ColorSelector";
import SizeSelector from "../../components/product/SizeSelector";
import SizeGuideModal from "../../components/product/SizeGuideModal";
import StockBadge from "../../components/product/StockBadge";
import ProductCard from "../../components/product/ProductCard";
import SEO from "../../components/common/SEO";
import ProductReviews from "../../components/product/ProductReviews";
import { useLanguage } from "../../hooks/useLanguage";

const getFirstAvailableSize = (sizes = []) => {
  return sizes.find((item) => Number(item.stock || 0) > 0)?.size || sizes[0]?.size || "";
};

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, isArabic } = useLanguage();

  const { addToCart, getCartItemQuantity } = useCart();
  const { whatsappNumber } = useSettings();

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [addedMessage, setAddedMessage] = useState("");

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
  });

  const colors = product?.colors || [];

  useEffect(() => {
    if (!product?.colors?.length) return;

    const currentColorExists = product.colors.some(
      (color) => color.name === selectedColor
    );

    if (!selectedColor || !currentColorExists) {
      const firstColor = product.colors[0].name;
      const firstSizes = getAvailableSizesForColor(product, firstColor);

      setSelectedColor(firstColor);
      setSelectedSize(getFirstAvailableSize(firstSizes));
    }
  }, [product, selectedColor]);

  useEffect(() => {
    if (!product) return;
    trackViewContent(product);
  }, [product]);

  const availableSizes = useMemo(() => {
    return getAvailableSizesForColor(product, selectedColor);
  }, [product, selectedColor]);

  useEffect(() => {
    if (!availableSizes.length) {
      if (selectedSize) setSelectedSize("");
      return;
    }

    const selectedSizeStillExists = availableSizes.some(
      (item) => item.size === selectedSize
    );

    if (!selectedSize || !selectedSizeStillExists) {
      setSelectedSize(getFirstAvailableSize(availableSizes));
    }
  }, [availableSizes, selectedSize]);

  const images = useMemo(() => {
    return getColorImages(product, selectedColor);
  }, [product, selectedColor]);

  const selectedStock = useMemo(() => {
    if (!selectedColor || !selectedSize) return 0;
    return getVariantStock(product, selectedColor, selectedSize);
  }, [product, selectedColor, selectedSize]);

  const currentCartQuantity = useMemo(() => {
    if (!product?._id || !selectedColor || !selectedSize) return 0;

    return getCartItemQuantity({
      productId: product._id,
      color: selectedColor,
      size: selectedSize,
    });
  }, [getCartItemQuantity, product?._id, selectedColor, selectedSize]);

  const remainingStock = Math.max(0, Number(selectedStock || 0) - currentCartQuantity);
  const firstImage = images?.[0]?.url || "/images/akm-logo.webp";

  const createCartItem = () => {
    return {
      cartItemId: `${product._id}-${selectedColor}-${selectedSize}`,
      productId: product._id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
      price:
  product.activeOffer && Number(product.salePrice) < Number(product.price)
    ? product.salePrice
    : product.price,
originalPrice: product.price,
offerBadge: product.activeOffer?.badge || "",
offerTitle: product.activeOffer?.title || "",
      image: firstImage,
      maxStock: selectedStock,
    };
  };

  const showTemporaryMessage = (message) => {
    setAddedMessage(message);

    window.clearTimeout(showTemporaryMessage.timeoutId);
    showTemporaryMessage.timeoutId = window.setTimeout(() => {
      setAddedMessage("");
    }, 1800);
  };

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize || selectedStock <= 0) return;

    if (remainingStock <= 0) {
      showTemporaryMessage(t("product.allStockAdded"));
      return;
    }

    const cartItem = createCartItem();
    const wasAdded = addToCart(cartItem);

    if (wasAdded) {
      trackAddToCart(cartItem);
      showTemporaryMessage(t("product.added"));
    } else {
      showTemporaryMessage(t("product.allStockAdded"));
    }
  };

  const handleBuyNow = () => {
    if (!selectedColor || !selectedSize || selectedStock <= 0) return;

    if (remainingStock > 0) {
      const cartItem = createCartItem();
      const wasAdded = addToCart(cartItem);

      if (wasAdded) {
        trackAddToCart(cartItem);
      }
    }

    navigate("/cart");
  };

  const handleColorSelect = (color) => {
    const nextSizes = getAvailableSizesForColor(product, color);

    setSelectedColor(color);
    setSelectedSize(getFirstAvailableSize(nextSizes));
    setAddedMessage("");
  };

  const whatsappMessage = encodeURIComponent(
    t("product.whatsappMessage", {
      product: product?.name || t("product.thisProduct"),
      color: selectedColor || t("product.colorFallback"),
      size: selectedSize || t("product.sizeFallback"),
    })
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#050505] px-5 py-20 text-[#f7f2ea] md:px-12">
        <div className="mx-auto max-w-6xl text-zinc-400">
          {t("product.loading")}
        </div>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="min-h-screen bg-[#050505] px-5 py-20 text-[#f7f2ea] md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-red-300">{t("product.notFound")}</p>

          <Link to="/shop" className="mt-5 inline-block text-[#c8b89d]">
            {t("common.backToShop")}
          </Link>
        </div>
      </main>
    );
  }

  const addDisabled = selectedStock <= 0 || remainingStock <= 0;

  return (
    <>
      <SEO
        title={`${product.name} | AKM`}
        description={
          product.description ||
          t("product.defaultDescription", { name: product.name })
        }
        image={images?.[0]?.url || ""}
        type="product"
      />

      <main className="min-h-screen bg-[#050505] px-5 py-20 pb-28 text-[#f7f2ea] md:px-12 md:pb-20">
        <div className="mx-auto max-w-6xl">
          <Link to="/shop" className="text-sm text-[#c8b89d] hover:text-white">
            {t("product.back")}
          </Link>

          <section className="mt-8 grid min-w-0 gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <ProductGallery images={images} productName={product.name} />

            <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <p className="text-xs uppercase tracking-[0.3em] text-[#c8b89d]">
                {isArabic
                  ? t(`categories.${product.category}`)
                  : formatProductLabel(product.category)}
              </p>

              <h1 className="mt-3 break-words text-4xl font-semibold md:text-5xl">
                {product.name}
              </h1>

              {product.activeOffer && Number(product.salePrice) < Number(product.price) ? (
  <div className="mt-4">
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-2xl font-semibold">
        {formatCurrency(product.salePrice)}
      </p>
      <p className="text-lg text-zinc-500 line-through">
        {formatCurrency(product.price)}
      </p>
      <span className="rounded-full bg-[#c8b89d] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-black">
        {product.activeOffer.badge || t("common.offer")}
      </span>
    </div>

    <p className="mt-2 text-sm text-[#c8b89d]">
      {product.activeOffer.title}
    </p>
  </div>
) : (
  <p className="mt-4 text-2xl font-semibold">
    {formatCurrency(product.price)}
  </p>
)}

              {product.description && (
                <p className="mt-5 leading-7 text-zinc-300">
                  {product.description}
                </p>
              )}

              <div className="mt-8 space-y-7">
                <ColorSelector
                  colors={colors}
                  selectedColor={selectedColor}
                  onSelect={handleColorSelect}
                />

                <SizeSelector
                  sizes={availableSizes}
                  selectedSize={selectedSize}
                  onSelect={(size) => {
                    setSelectedSize(size);
                    setAddedMessage("");
                  }}
                  onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
                />

                <StockBadge stock={selectedStock} />

                {selectedStock > 0 && currentCartQuantity > 0 && (
                  <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
                    {t("product.alreadyInCart", {
                      count: currentCartQuantity,
                    })}
                  </p>
                )}

                {addedMessage && (
                  <p className="rounded-2xl border border-[#c8b89d]/30 bg-[#c8b89d]/10 px-4 py-3 text-sm text-[#e8d6b8]">
                    {addedMessage}
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addDisabled}
                    className="flex items-center justify-center gap-2 rounded-full bg-[#f7f2ea] px-6 py-4 font-semibold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingBag size={18} />
                    {remainingStock <= 0 && selectedStock > 0
                      ? t("product.maxAdded")
                      : t("product.addToCart")}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={selectedStock <= 0}
                    className="flex items-center justify-center gap-2 rounded-full bg-[#c8b89d] px-6 py-4 font-semibold text-black transition hover:bg-[#dfcfb3] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Zap size={18} />
                    {t("product.buyNow")}
                  </button>
                </div>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-4 font-medium text-white transition hover:border-[#c8b89d]/60"
                >
                  <MessageCircle size={18} />
                  {t("product.askWhatsapp")}
                </a>
              </div>

              <div className="mt-8 grid gap-3 text-sm text-zinc-300">
                {product.fabric && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <span className="text-[#c8b89d]">
                      {t("common.fabric")}
                    </span>{" "}
                    {product.fabric}
                  </div>
                )}

                {product.fit && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <span className="text-[#c8b89d]">{t("common.fit")}</span>{" "}
                    {product.fit}
                  </div>
                )}

                {product.careInstructions && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <span className="text-[#c8b89d]">{t("common.care")}</span>{" "}
                    {product.careInstructions}
                  </div>
                )}
              </div>
            </div>
          </section>

          <ProductReviews product={product} />

          {product.shopTheLook?.length > 0 && (
            <section className="mt-24">
              <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
                  {t("product.completeLook")}
                </p>

                <h2 className="mt-3 text-3xl font-semibold">
                  {t("product.completeLookTitle")}
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {product.shopTheLook.map((item) => (
                  <ProductCard key={item._id} product={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#050505]/95 p-4 backdrop-blur-xl md:hidden">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={addDisabled}
          className="w-full rounded-full bg-[#f7f2ea] px-6 py-4 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {remainingStock <= 0 && selectedStock > 0
            ? t("product.mobileMax")
            : t("product.mobileAdd", {
                price: formatCurrency(
                  product.activeOffer &&
                    Number(product.salePrice) < Number(product.price)
                    ? product.salePrice
                    : product.price
                ),
              })}
        </button>
      </div>

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </>
  );
}
