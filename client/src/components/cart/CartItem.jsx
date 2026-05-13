import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "../../lib/formatCurrency";
import { useLanguage } from "../../hooks/useLanguage";

export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  const { t } = useLanguage();
  const maxStock = Number(item.maxStock || 0);
  const hasKnownMaxStock = Number.isFinite(maxStock) && maxStock > 0;
  const quantity = Number(item.quantity || 1);
  const reachedMaxStock = hasKnownMaxStock && quantity >= maxStock;

  return (
    <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[110px_1fr_auto]">
      <Link
        to={`/product/${item.slug}`}
        className="overflow-hidden rounded-2xl bg-white/[0.04]"
      >
        <div className="aspect-square">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <img
              src="/images/akm-logo.webp"
              alt="AKM"
              className="h-full w-full object-cover opacity-60"
              loading="lazy"
            />
          )}
        </div>
      </Link>

      <div className="min-w-0">
        <Link
          to={`/product/${item.slug}`}
          className="break-words text-lg font-semibold text-white hover:text-[#c8b89d]"
        >
          {item.name}
        </Link>

        <p className="mt-2 text-sm text-zinc-400">
          {item.color} / {item.size}
        </p>

        <div className="mt-3 text-sm">
  {item.originalPrice && Number(item.originalPrice) > Number(item.price) ? (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-semibold text-zinc-200">
        {formatCurrency(item.price)}
      </span>
      <span className="text-zinc-500 line-through">
        {formatCurrency(item.originalPrice)}
      </span>
      {item.offerBadge && (
        <span className="rounded-full bg-[#c8b89d] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-black">
          {item.offerBadge}
        </span>
      )}
    </div>
  ) : (
    <span className="text-zinc-300">{formatCurrency(item.price)}</span>
  )}
</div>

        {hasKnownMaxStock && (
          <p
            className={`mt-2 text-xs ${
              reachedMaxStock ? "text-[#c8b89d]" : "text-zinc-500"
            }`}
          >
            {reachedMaxStock
              ? t("cart.reachedStock", { count: maxStock })
              : t("cart.available", { count: maxStock })}
          </p>
        )}

        <button
          type="button"
          onClick={() => onRemove(item.cartItemId)}
          className="mt-4 inline-flex items-center gap-2 text-sm text-red-300 hover:text-red-200"
        >
          <Trash2 size={15} />
          {t("common.remove")}
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <div className="flex items-center overflow-hidden rounded-full border border-white/10">
          <button
            type="button"
            onClick={() => onDecrease(item.cartItemId)}
            disabled={quantity <= 1}
            className="p-3 text-zinc-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={15} />
          </button>

          <span className="min-w-10 text-center text-sm">{quantity}</span>

          <button
            type="button"
            onClick={() => onIncrease(item.cartItemId)}
            disabled={reachedMaxStock}
            className="p-3 text-zinc-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={15} />
          </button>
        </div>

        <p className="font-semibold">
          {formatCurrency(Number(item.price || 0) * quantity)}
        </p>
      </div>
    </div>
  );
}
