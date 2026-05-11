const statusClasses = {
  Unpaid: "border-red-400/20 bg-red-500/10 text-red-200",
  "Pending Verification":
    "border-yellow-400/20 bg-yellow-500/10 text-yellow-200",
  Paid: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
};

export default function PaymentStatusBadge({ status }) {
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