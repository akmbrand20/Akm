import { Link } from "react-router-dom";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatProductLabel } from "../../lib/constants";
import { useLanguage } from "../../hooks/useLanguage";

export default function ProductCard({ product }) {
  const { t, isArabic } = useLanguage();
  const blackColor = product.colors?.find(
    (color) => color.name?.toLowerCase() === "black"
  );
  const firstColor = product.colors?.[0];

  const firstImage =
    blackColor?.images?.[0]?.url ||
    firstColor?.images?.[0]?.url ||
    "/images/akm-logo.webp";

  const hasOffer =
    product.activeOffer && Number(product.salePrice) < Number(product.price);

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition duration-300 hover:border-[#c8b89d]/50 hover:bg-white/[0.05]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-white/[0.04]">
        {hasOffer && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-[#c8b89d] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-black">
            {product.activeOffer.badge || t("common.offer")}
          </span>
        )}

        <img
          src={firstImage}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.25em] text-[#c8b89d]">
              {isArabic
                ? t(`categories.${product.category}`)
                : formatProductLabel(product.category)}
            </p>

            <h3 className="mt-2 break-words text-xl font-semibold text-[#f7f2ea]">
              {product.name}
            </h3>
          </div>

          <div className={`shrink-0 ${isArabic ? "text-left" : "text-right"}`}>
            {hasOffer ? (
              <>
                <p className="text-xs text-zinc-500 line-through">
                  {formatCurrency(product.price)}
                </p>
                <p className="whitespace-nowrap text-sm font-semibold text-[#f7f2ea]">
                  {formatCurrency(product.salePrice)}
                </p>
              </>
            ) : (
              <p className="whitespace-nowrap text-sm font-medium text-[#f7f2ea]">
                {formatCurrency(product.price)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {product.colors?.map((color) => (
            <span
              key={color.name}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300"
            >
              {color.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
