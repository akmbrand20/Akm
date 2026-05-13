import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { getMyOrders } from "../../services/customerOrderService";
import { formatCurrency } from "../../lib/formatCurrency";
import SEO from "../../components/common/SEO";
import { useLanguage } from "../../hooks/useLanguage";

export default function MyOrders() {
  const { isCustomerLoggedIn, loading } = useCustomerAuth();
  const { t, isArabic } = useLanguage();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["myOrders"],
    queryFn: getMyOrders,
    enabled: isCustomerLoggedIn,
  });

  if (!loading && !isCustomerLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-20 text-[#f7f2ea] md:px-12">
      <SEO
        title={`${t("orders.myOrders")} | AKM`}
        description={t("orders.viewDetailsDescription")}
      />

      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
          {t("orders.account")}
        </p>

        <h1 className="mt-3 text-4xl font-semibold md:text-6xl">
          {t("orders.myOrders")}
        </h1>

        {isLoading || loading ? (
          <p className="mt-8 text-zinc-400">{t("orders.loadingMany")}</p>
        ) : orders.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.04]">
              <Package />
            </div>

            <h2 className="mt-5 text-2xl font-semibold">{t("orders.noOrders")}</h2>

            <p className="mt-3 text-zinc-400">
              {t("orders.noOrdersText")}
            </p>

            <Link
              to="/shop"
              className="mt-8 inline-block rounded-full bg-[#f7f2ea] px-7 py-3 font-medium text-black"
            >
              {t("home.shopCollection")}
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/my-orders/${order._id}`}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#c8b89d]/50"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xl font-semibold">
                      {order.orderNumber}
                    </p>

                    <p className="mt-2 text-sm text-zinc-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div
                    className={`grid gap-2 text-sm ${
                      isArabic ? "md:text-left" : "md:text-right"
                    }`}
                  >
                    <p className="text-zinc-300">{order.orderStatus}</p>
                    <p className="text-zinc-400">{order.paymentMethod}</p>
                    <p className="font-semibold">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
