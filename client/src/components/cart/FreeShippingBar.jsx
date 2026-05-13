import { formatCurrency } from "../../lib/formatCurrency";
import { useLanguage } from "../../hooks/useLanguage";

export default function FreeShippingBar({ totals }) {
  const { t } = useLanguage();
  const threshold = totals.freeShippingThreshold;

  if (!threshold || Number(threshold) <= 0) return null;

  const afterDiscount = totals.subtotal - totals.discount;
  const remaining = Math.max(0, Number(threshold) - afterDiscount);
  const progress = Math.min(100, (afterDiscount / Number(threshold)) * 100);

  if (totals.freeShippingUnlocked) {
    return (
      <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">
          {t("shipping.unlocked")}
        </p>
        <h2 className="mt-2 text-xl font-semibold">
          {t("shipping.qualifies")}
        </h2>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full rounded-full bg-emerald-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm uppercase tracking-[0.25em] text-[#c8b89d]">
        {t("shipping.offer")}
      </p>

      <h2 className="mt-2 text-xl font-semibold">
        {t("shipping.addMore", { amount: formatCurrency(remaining) })}
      </h2>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#c8b89d]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-zinc-400">
        {t("shipping.startsAt", { amount: formatCurrency(threshold) })}
      </p>
    </div>
  );
}
