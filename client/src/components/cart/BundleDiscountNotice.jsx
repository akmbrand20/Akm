import { useLanguage } from "../../hooks/useLanguage";

export default function BundleDiscountNotice({ totals }) {
  const { t } = useLanguage();

  if (totals.discount > 0) {
    return (
      <div className="rounded-3xl border border-[#c8b89d]/30 bg-[#c8b89d]/10 p-5">
        <p className="text-sm uppercase tracking-[0.25em] text-[#c8b89d]">
          {t("bundle.unlocked")}
        </p>
        <h2 className="mt-2 text-2xl font-semibold">{totals.appliedOffer}</h2>
        <p className="mt-2 text-zinc-300">{totals.bundleMessage}</p>
        <p className="mt-3 font-semibold text-[#e8d6b8]">
          {t("bundle.saved", { amount: totals.discount.toLocaleString() })}
        </p>
      </div>
    );
  }

  if (totals.completeSets === 1) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm uppercase tracking-[0.25em] text-[#c8b89d]">
          {t("bundle.tip")}
        </p>
        <h2 className="mt-2 text-xl font-semibold">
          {t("bundle.addOneMore")}
        </h2>
        <p className="mt-2 text-zinc-400">
          {t("bundle.duoPrice")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm uppercase tracking-[0.25em] text-[#c8b89d]">
        {t("bundle.completeSet")}
      </p>
      <h2 className="mt-2 text-xl font-semibold">
        {t("bundle.unlock")}
      </h2>
      <p className="mt-2 text-zinc-400">
        {t("bundle.pricing")}
      </p>
    </div>
  );
}
