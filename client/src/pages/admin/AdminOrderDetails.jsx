import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import {
  getAdminOrderById,
  updateOrderStatus,
} from "../../services/adminOrderService";
import { formatCurrency } from "../../lib/formatCurrency";
import CancelOrderDialog from "../../components/admin/CancelOrderDialog";
import OrderStatusBadge from "../../components/admin/OrderStatusBadge";
import PaymentStatusBadge from "../../components/admin/PaymentStatusBadge";

export default function AdminOrderDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["adminOrder", id],
    queryFn: () => getAdminOrderById(id),
  });

  const orderStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      setIsCancelDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["adminOrder", id] });
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });

  const handleCancelOrder = () => {
    if (!order || order.orderStatus === "Cancelled") return;
    setIsCancelDialogOpen(true);
  };

  const confirmCancelOrder = () => {
    if (!order) return;

    orderStatusMutation.mutate({
      id: order._id,
      orderStatus: "Cancelled",
    });
  };

  if (isLoading) {
    return <p className="text-zinc-400">Loading order...</p>;
  }

  if (isError || !order) {
    return <p className="text-red-300">Order not found.</p>;
  }

  return (
    <div>
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-[#c8b89d] hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to orders
      </Link>

      <div className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
            Order Details
          </p>
          <h1 className="mt-3 text-4xl font-semibold">{order.orderNumber}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <OrderStatusBadge status={order.orderStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />

          {order.orderStatus !== "Cancelled" && (
            <button
              type="button"
              onClick={handleCancelOrder}
              disabled={orderStatusMutation.isPending}
              className="rounded-full border border-red-400/30 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-200 transition hover:border-red-300/60 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Items</h2>

            <div className="mt-5 space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:grid-cols-[90px_1fr_auto]"
                >
                  <div className="overflow-hidden rounded-2xl bg-white/[0.04]">
                    <div className="aspect-square">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-2 text-sm text-zinc-400">
                      {item.color} / {item.size}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Customer</h2>

            <div className="mt-5 grid gap-3 text-sm text-zinc-300">
              <p>
                <span className="text-[#c8b89d]">Name:</span>{" "}
                {order.customer.fullName}
              </p>
              <p>
                <span className="text-[#c8b89d]">Phone:</span>{" "}
                {order.customer.phone}
              </p>
              {order.customer.secondPhone && (
                <p>
                  <span className="text-[#c8b89d]">Second phone:</span>{" "}
                  {order.customer.secondPhone}
                </p>
              )}
              {order.customer.email && (
                <p>
                  <span className="text-[#c8b89d]">Email:</span>{" "}
                  {order.customer.email}
                </p>
              )}
              <p>
                <span className="text-[#c8b89d]">City:</span>{" "}
                {order.customer.city}
              </p>
              <p>
                <span className="text-[#c8b89d]">Address:</span>{" "}
                {order.customer.address}
              </p>
              {order.customer.notes && (
                <p>
                  <span className="text-[#c8b89d]">Notes:</span>{" "}
                  {order.customer.notes}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 xl:self-start">
          <h2 className="text-2xl font-semibold">Summary</h2>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between text-zinc-300">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-[#c8b89d]">
                <span>{order.appliedOffer}</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-zinc-300">
              <span>Delivery</span>
              <span>{formatCurrency(order.shippingFee)}</span>
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 text-zinc-300">
              <p>
                <span className="text-[#c8b89d]">Payment:</span>{" "}
                {order.paymentMethod}
              </p>
              {order.instapayTiming && (
                <p className="mt-2">
                  <span className="text-[#c8b89d]">Instapay:</span>{" "}
                  {order.instapayTiming}
                </p>
              )}
              {order.transactionReference && (
                <p className="mt-2">
                  <span className="text-[#c8b89d]">Reference:</span>{" "}
                  {order.transactionReference}
                </p>
              )}
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
  <p className="font-semibold text-white">Notifications</p>

  <p className="mt-2 text-sm">
    <span className="text-[#c8b89d]">Owner email:</span>{" "}
    {order.notifications?.ownerEmailSent ? "Sent" : "Not sent"}
  </p>

  {order.notifications?.ownerEmailError && (
    <p className="mt-2 text-sm text-red-200">
      {order.notifications.ownerEmailError}
    </p>
  )}

  <p className="mt-4 text-sm">
    <span className="text-[#c8b89d]">Customer email:</span>{" "}
    {order.notifications?.customerEmailSent ? "Sent" : "Not sent"}
  </p>

  {order.notifications?.customerEmailError && (
    <p className="mt-2 text-sm text-red-200">
      {order.notifications.customerEmailError}
    </p>
  )}
</div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
  <p className="font-semibold text-white">Tracking</p>

  <p className="mt-2 text-sm">
    <span className="text-[#c8b89d]">Event ID:</span>{" "}
    {order.tracking?.eventId || "Not available"}
  </p>

  <p className="mt-2 text-sm">
    <span className="text-[#c8b89d]">Meta CAPI:</span>{" "}
    {order.tracking?.metaCapiSent ? "Sent" : "Not sent"}
  </p>

  {order.tracking?.metaCapiError && (
    <p className="mt-2 text-sm text-red-200">
      {order.tracking.metaCapiError}
    </p>
  )}
</div>
            </div>
          </div>
        </div>
      </div>

      <CancelOrderDialog
        order={order}
        isOpen={isCancelDialogOpen}
        isLoading={orderStatusMutation.isPending}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={confirmCancelOrder}
      />
    </div>
  );
}
