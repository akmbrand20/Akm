import { useLanguage } from "../../hooks/useLanguage";

export default function StockBadge({ stock }) {
  const { t } = useLanguage();
  const count = Number(stock || 0);

  if (count <= 0) {
    return (
      <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {t("stock.out")}
      </p>
    );
  }

  if (count <= 3) {
    return (
      <p className="rounded-2xl border border-[#c8b89d]/30 bg-[#c8b89d]/10 px-4 py-3 text-sm text-[#e8d6b8]">
        {t("stock.low", { count })}
      </p>
    );
  }

  return (
    <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
      {t("stock.in")}
    </p>
  );
}
