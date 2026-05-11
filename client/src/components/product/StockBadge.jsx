export default function StockBadge({ stock }) {
  const count = Number(stock || 0);

  if (count <= 0) {
    return (
      <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        Out of stock for this selection.
      </p>
    );
  }

  if (count <= 3) {
    return (
      <p className="rounded-2xl border border-[#c8b89d]/30 bg-[#c8b89d]/10 px-4 py-3 text-sm text-[#e8d6b8]">
        Only {count} left in this color and size.
      </p>
    );
  }

  return (
    <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
      In stock and ready to order.
    </p>
  );
}