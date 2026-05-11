const statusClasses = {
  Pending: "border-yellow-400/20 bg-yellow-500/10 text-yellow-200",
  Confirmed: "border-blue-400/20 bg-blue-500/10 text-blue-200",
  Preparing: "border-purple-400/20 bg-purple-500/10 text-purple-200",
  Shipped: "border-cyan-400/20 bg-cyan-500/10 text-cyan-200",
  Delivered: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
  Cancelled: "border-red-400/20 bg-red-500/10 text-red-200",
};

export default function OrderStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
        statusClasses[status] || "border-white/10 bg-white/5 text-zinc-300"
      }`}
    >
      {status}
    </span>
  );
}