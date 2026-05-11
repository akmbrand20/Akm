import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminCoupons,
} from "../../services/couponService";

export default function AdminCoupons() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    code: "",
    type: "fixed",
    value: "",
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
    isActive: true,
  });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["adminCoupons"],
    queryFn: getAdminCoupons,
  });

  const createMutation = useMutation({
    mutationFn: createAdminCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCoupons"] });
      setForm({
        code: "",
        type: "fixed",
        value: "",
        minOrderAmount: "",
        maxUses: "",
        expiresAt: "",
        isActive: true,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCoupons"] });
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    createMutation.mutate({
      ...form,
      code: form.code.trim().toUpperCase(),
      value: Number(form.value),
      minOrderAmount: Number(form.minOrderAmount || 0),
      maxUses: form.maxUses === "" ? null : Number(form.maxUses),
      expiresAt: form.expiresAt || null,
    });
  };

  return (
    <div>
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
          Coupons
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Discount coupons</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Create campaign codes for ads, creators, or seasonal offers.
        </p>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 xl:self-start"
        >
          <h2 className="text-2xl font-semibold">Create Coupon</h2>

          <div className="mt-5 grid gap-4">
            <div>
              <label className="text-sm text-zinc-300">Code</label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="AKM10"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm uppercase text-white outline-none placeholder:normal-case placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
              >
                <option value="fixed">Fixed amount</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-300">Value</label>
              <input
                name="value"
                type="number"
                value={form.value}
                onChange={handleChange}
                placeholder={form.type === "percentage" ? "10" : "100"}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">
                Minimum order amount
              </label>
              <input
                name="minOrderAmount"
                type="number"
                value={form.minOrderAmount}
                onChange={handleChange}
                placeholder="Optional"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Max uses</label>
              <input
                name="maxUses"
                type="number"
                value={form.maxUses}
                onChange={handleChange}
                placeholder="Leave empty for unlimited"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Expiry date</label>
              <input
                name="expiresAt"
                type="date"
                value={form.expiresAt}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
              />
            </div>

            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-4">
              <span>Active</span>
              <input
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={handleChange}
                className="h-5 w-5"
              />
            </label>
          </div>

          {createMutation.isError && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {createMutation.error?.response?.data?.message ||
                "Failed to create coupon."}
            </div>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="mt-6 w-full rounded-full bg-[#f7f2ea] px-6 py-4 font-semibold text-black disabled:opacity-60"
          >
            {createMutation.isPending ? "Creating..." : "Create Coupon"}
          </button>
        </form>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          {isLoading ? (
            <p className="p-6 text-zinc-400">Loading coupons...</p>
          ) : coupons.length === 0 ? (
            <p className="p-6 text-zinc-400">No coupons created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.04] text-zinc-400">
                  <tr>
                    <th className="px-5 py-4 font-medium">Code</th>
                    <th className="px-5 py-4 font-medium">Discount</th>
                    <th className="px-5 py-4 font-medium">Min Order</th>
                    <th className="px-5 py-4 font-medium">Uses</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon._id}
                      className="border-b border-white/10 last:border-0"
                    >
                      <td className="px-5 py-4 font-semibold">
                        {coupon.code}
                      </td>

                      <td className="px-5 py-4">
                        {coupon.type === "percentage"
                          ? `${coupon.value}%`
                          : `${coupon.value} EGP`}
                      </td>

                      <td className="px-5 py-4">
                        {coupon.minOrderAmount || 0} EGP
                      </td>

                      <td className="px-5 py-4">
                        {coupon.usedCount}
                        {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ""}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs ${
                            coupon.isActive
                              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                              : "border-red-400/20 bg-red-500/10 text-red-200"
                          }`}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(coupon._id)}
                          className="text-red-300 hover:text-red-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}