import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, MessageCircle } from "lucide-react";

import { BRAND } from "../../lib/constants";
import { formatCurrency } from "../../lib/formatCurrency";
import { getOrderByNumber } from "../../services/orderService";
import SEO from "../../components/common/SEO";
import { useLanguage } from "../../hooks/useLanguage";

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const { t, isArabic } = useLanguage();

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => getOrderByNumber(orderNumber),
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-20 text-[#f7f2ea]">
        <div className="mx-auto max-w-4xl text-zinc-400">
          {t("orders.loading")}
        </div>
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-20 text-[#f7f2ea]">
        <div className="mx-auto max-w-4xl">
          <p className="text-red-300">{t("orders.notFound")}</p>
          <Link to="/shop" className="mt-5 inline-block text-[#c8b89d]">
            {t("orders.backToShop")}
          </Link>
        </div>
      </main>
    );
  }

  const whatsappMessage = encodeURIComponent(
    t("orders.whatsappMessage", { orderNumber: order.orderNumber })
  );

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-20 text-[#f7f2ea] md:px-12">
        <SEO
  title={`Order ${order.orderNumber} Confirmed | AKM`}
  description={t("orders.successSeoDescription")}
/>
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
            <CheckCircle2 size={38} />
          </div>

          <p className="mt-8 text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
            {t("orders.confirmed")}
          </p>

          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
            {t("orders.thankYou")}
          </h1>

          <p className="mt-4 text-zinc-400">
            {t("orders.received")}
          </p>

          <div
            className={`mx-auto mt-8 max-w-md rounded-3xl border border-white/10 bg-black/30 p-5 ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-zinc-400">{t("orders.number")}</span>
              <span className="font-semibold">{order.orderNumber}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/10 py-3">
              <span className="text-zinc-400">{t("common.payment")}</span>
              <span className="font-semibold">{order.paymentMethod}</span>
            </div>

            {order.instapayTiming && (
              <div className="flex items-center justify-between border-b border-white/10 py-3">
                <span className="text-zinc-400">
                  {t("orders.paymentTiming")}
                </span>
                <span className="font-semibold">{order.instapayTiming}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3">
              <span className="text-zinc-400">{t("common.total")}</span>
              <span className="font-semibold">{formatCurrency(order.total)}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={`https://wa.me/${BRAND.whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f7f2ea] px-7 py-3 font-semibold text-black"
            >
              <MessageCircle size={18} />
              {t("orders.confirmWhatsapp")}
            </a>

            <Link
              to="/shop"
              className="rounded-full border border-white/10 px-7 py-3 font-medium text-white hover:border-[#c8b89d]/60"
            >
              {t("common.continueShopping")}
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-semibold">{t("orders.items")}</h2>

          <div className="mt-5 space-y-3">
            {order.items.map((item, index) => (
              <div
                key={`${item.productId}-${index}`}
                className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {item.color} / {item.size} × {item.quantity}
                  </p>
                </div>

                <p className="font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
