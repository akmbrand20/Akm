import { useLanguage } from "../../hooks/useLanguage";

export default function SizeSelector({
  sizes = [],
  selectedSize,
  onSelect,
  onOpenSizeGuide,
}) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-white">{t("common.size")}</p>

        <button
          type="button"
          onClick={onOpenSizeGuide}
          className="text-sm text-[#c8b89d] hover:text-white"
        >
          {t("sizeGuide.label")}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {sizes.map((sizeItem) => {
          const active = selectedSize === sizeItem.size;
          const outOfStock = Number(sizeItem.stock || 0) <= 0;

          return (
            <button
              key={sizeItem.size}
              type="button"
              onClick={() => !outOfStock && onSelect(sizeItem.size)}
              disabled={outOfStock}
              className={`rounded-full border px-5 py-2 text-sm transition ${
                active
                  ? "border-[#c8b89d] bg-[#c8b89d] text-black"
                  : outOfStock
                  ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-zinc-600 line-through"
                  : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/30"
              }`}
            >
              {sizeItem.size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
