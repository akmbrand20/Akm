import { AlertTriangle } from "lucide-react";

export default function CancelOrderDialog({
  order,
  isOpen,
  isLoading = false,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#c8b89d]/30 bg-[#090806] p-6 text-[#f7f2ea] shadow-2xl shadow-black/50">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 text-red-200">
            <AlertTriangle size={22} />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#c8b89d]">
              Cancel Order
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {order.orderNumber}
            </h2>
          </div>
        </div>

        <p className="mt-5 leading-7 text-zinc-300">
          This will mark the order as cancelled, return the items to stock, and
          remove it from dashboard totals.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300">
          <p>
            <span className="text-[#c8b89d]">Customer:</span>{" "}
            {order.customer?.fullName || "Unknown"}
          </p>
          <p className="mt-2">
            <span className="text-[#c8b89d]">Total:</span>{" "}
            {Number(order.total || 0).toLocaleString()} EGP
          </p>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-[#c8b89d]/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Keep Order
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-full border border-red-300/40 bg-red-500/15 px-5 py-3 text-sm font-semibold text-red-100 transition hover:border-red-200/70 hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Cancelling..." : "Cancel Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
