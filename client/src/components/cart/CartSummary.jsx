import { Link } from "react-router-dom";
import { formatCurrency } from "../../lib/formatCurrency";
import { useLanguage } from "../../hooks/useLanguage";

export default function CartSummary({ totals, checkoutButton = true }) {
  const { t } = useLanguage();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-2xl font-semibold">{t("cart.orderSummary")}</h2>

      <div className="mt-6 space-y-4 text-sm">
        <div className="flex items-center justify-between text-zinc-300">
          <span>{t("common.subtotal")}</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>

        {totals.bundleDiscount > 0 && (
          <div className="rounded-2xl border border-[#c8b89d]/30 bg-[#c8b89d]/10 p-4">
            <div className="flex items-center justify-between text-[#e8d6b8]">
              <span>{totals.appliedOffer}</span>
              <span>-{formatCurrency(totals.bundleDiscount)}</span>
            </div>

            <p className="mt-2 text-xs text-zinc-300">
              {totals.bundleMessage}
            </p>
          </div>
        )}

        {totals.couponDiscount > 0 && (
          <div className="flex items-center justify-between text-[#c8b89d]">
            <span>{t("cart.couponLine", { code: totals.couponCode })}</span>
            <span>-{formatCurrency(totals.couponDiscount)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-zinc-300">
          <span>{t("common.delivery")}</span>
          <span>
            {totals.shippingFee === 0
              ? t("common.free")
              : formatCurrency(totals.shippingFee)}
          </span>
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>{t("common.total")}</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>
      </div>

      {checkoutButton && (
        <Link
          to="/checkout"
          className="mt-6 block rounded-full bg-[#f7f2ea] px-6 py-4 text-center font-semibold text-black hover:bg-white"
        >
          {t("cart.proceed")}
        </Link>
      )}
    </div>
  );
}
