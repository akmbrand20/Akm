import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { getMyOrderById } from "../../services/customerOrderService";
import { formatCurrency } from "../../lib/formatCurrency";
import SEO from "../../components/common/SEO";

export default function MyOrderDetails() {
  const { id } = useParams();
  const { isCustomerLoggedIn, loading } = useCustomerAuth();

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myOrder", id],
    queryFn: () => getMyOrderById(id),
    enabled: isCustomerLoggedIn,
  });

  if (!loading && !isCustomerLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  if (isLoading || loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-20 text-[#f7f2ea]">
        <div className="mx-auto max-w-5xl text-zinc-400">
          Loading order...
        </div>
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-20 text-[#f7f2ea]">
        <div className="mx-auto max-w-5xl">
          <p className="text-red-300">Order not found.</p>
          <Link to="/my-orders" className="mt-5 inline-block text-[#c8b89d]">
            Back to my orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-20 text-[#f7f2ea] md:px-12">
      <SEO
        title={`${order.orderNumber} | AKM`}
        description="View your AKM order details."
      />

      <div className="mx-auto max-w-5xl">
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-2 text-sm text-[#c8b89d] hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to my orders
        </Link>

        <div className="mt-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
            Order Details
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            {order.orderNumber}
          </h1>

          <p className="mt-3 text-zinc-400">
            Status: {order.orderStatus} · Payment: {order.paymentMethod}
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Items</h2>

            <div className="mt-5 space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0"
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

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 lg:self-start">
            <h2 className="text-2xl font-semibold">Summary</h2>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between text-zinc-300">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>

              {order.bundleDiscount > 0 && (
                <div className="flex justify-between text-[#c8b89d]">
                  <span>{order.appliedOffer}</span>
                  <span>-{formatCurrency(order.bundleDiscount)}</span>
                </div>
              )}

              {order.coupon?.discount > 0 && (
                <div className="flex justify-between text-[#c8b89d]">
                  <span>Coupon {order.coupon.code}</span>
                  <span>-{formatCurrency(order.coupon.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-300">
                <span>Delivery</span>
                <span>
                  {order.shippingFee === 0
                    ? "Free"
                    : formatCurrency(order.shippingFee)}
                </span>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}