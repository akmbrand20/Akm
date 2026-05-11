import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../../services/adminOrderService";
import { formatCurrency } from "../../lib/formatCurrency";
import OrderStatusBadge from "../../components/admin/OrderStatusBadge";
import PaymentStatusBadge from "../../components/admin/PaymentStatusBadge";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const PAYMENT_STATUSES = ["Unpaid", "Pending Verification", "Paid"];

export default function AdminOrders() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["adminOrders", { search, status }],
    queryFn: () =>
      getAdminOrders({
        search: search || undefined,
        status: status || undefined,
      }),
  });

  const orderStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });

  const paymentStatusMutation = useMutation({
    mutationFn: updatePaymentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });

  return (
    <div>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
            Orders
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Manage orders</h1>
        </div>

        <div className="grid gap-3 md:grid-cols-[260px_180px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order, name, phone..."
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((statusItem) => (
              <option key={statusItem} value={statusItem}>
                {statusItem}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        {isLoading ? (
          <p className="p-6 text-zinc-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-zinc-400">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.04] text-zinc-400">
                <tr>
                  <th className="px-5 py-4 font-medium">Order</th>
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Payment</th>
                  <th className="px-5 py-4 font-medium">Total</th>
                  <th className="px-5 py-4 font-medium">Order Status</th>
                  <th className="px-5 py-4 font-medium">Payment Status</th>
                  <th className="px-5 py-4 font-medium">Details</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-white/10 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium">{order.customer.fullName}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {order.customer.phone}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p>{order.paymentMethod}</p>
                      {order.instapayTiming && (
                        <p className="mt-1 text-xs text-zinc-500">
                          {order.instapayTiming}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {formatCurrency(order.total)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="mb-2">
                        <OrderStatusBadge status={order.orderStatus} />
                      </div>

                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          orderStatusMutation.mutate({
                            id: order._id,
                            orderStatus: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none"
                      >
                        {ORDER_STATUSES.map((statusItem) => (
                          <option key={statusItem} value={statusItem}>
                            {statusItem}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <div className="mb-2">
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </div>

                      <select
                        value={order.paymentStatus}
                        onChange={(e) =>
                          paymentStatusMutation.mutate({
                            id: order._id,
                            paymentStatus: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none"
                      >
                        {PAYMENT_STATUSES.map((statusItem) => (
                          <option key={statusItem} value={statusItem}>
                            {statusItem}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="text-[#c8b89d] hover:text-white"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}