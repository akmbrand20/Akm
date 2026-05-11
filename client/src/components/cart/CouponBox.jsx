import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Tag, X } from "lucide-react";
import { validateCouponCode } from "../../services/couponService";
import { formatCurrency } from "../../lib/formatCurrency";

export default function CouponBox({
  totals,
  coupon,
  applyCoupon,
  removeCoupon,
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const validateMutation = useMutation({
    mutationFn: validateCouponCode,
    onSuccess: (data) => {
      applyCoupon({
        code: data.coupon.code,
        discount: data.discount,
        type: data.coupon.type,
        value: data.coupon.value,
      });

      setCode("");
      setError("");
    },
    onError: (err) => {
      setError(err?.response?.data?.message || "Invalid coupon code.");
    },
  });

  const handleApply = (e) => {
    e.preventDefault();

    setError("");

    if (!code.trim()) {
      setError("Enter a coupon code first.");
      return;
    }

    validateMutation.mutate({
      code,
      subtotalAfterBundle: totals.subtotalAfterBundle,
    });
  };

  if (coupon) {
    return (
      <div className="rounded-3xl border border-[#c8b89d]/30 bg-[#c8b89d]/10 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#c8b89d]">
              Coupon Applied
            </p>

            <h2 className="mt-2 text-xl font-semibold">{coupon.code}</h2>

            <p className="mt-2 text-sm text-zinc-300">
              You saved {formatCurrency(coupon.discount)} with this coupon.
            </p>
          </div>

          <button
            type="button"
            onClick={removeCoupon}
            className="rounded-full border border-white/10 p-2 text-zinc-300 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleApply}
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
    >
      <div className="flex items-center gap-2">
        <Tag size={18} className="text-[#c8b89d]" />
        <h2 className="text-xl font-semibold">Have a coupon?</h2>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter coupon code"
          className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm uppercase text-white outline-none placeholder:normal-case placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
        />

        <button
          type="submit"
          disabled={validateMutation.isPending}
          className="rounded-2xl bg-[#f7f2ea] px-5 py-3 text-sm font-semibold text-black disabled:opacity-60"
        >
          {validateMutation.isPending ? "Checking..." : "Apply"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
    </form>
  );
}