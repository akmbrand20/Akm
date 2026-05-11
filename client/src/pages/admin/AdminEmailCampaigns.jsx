import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEmailCampaign,
  deleteEmailCampaign,
  getEmailCampaigns,
  getMarketingCustomersCount,
  sendEmailCampaign,
} from "../../services/emailCampaignService";

export default function AdminEmailCampaigns() {
  const queryClient = useQueryClient();

  const defaultShopUrl = useMemo(() => {
    if (typeof window === "undefined") return "/shop";
    return `${window.location.origin}/shop`;
  }, []);

  const [form, setForm] = useState({
    type: "coupon",
    subject: "",
    title: "",
    message: "",
    couponCode: "",
    ctaText: "Shop Now",
    ctaUrl: defaultShopUrl,
    audience: "marketing_customers",
  });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["emailCampaigns"],
    queryFn: getEmailCampaigns,
  });

  const { data: counts } = useQuery({
    queryKey: ["marketingCustomersCount"],
    queryFn: getMarketingCustomersCount,
  });

  const resetForm = () => {
    setForm({
      type: "coupon",
      subject: "",
      title: "",
      message: "",
      couponCode: "",
      ctaText: "Shop Now",
      ctaUrl: defaultShopUrl,
      audience: "marketing_customers",
    });
  };

  const createMutation = useMutation({
    mutationFn: createEmailCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailCampaigns"] });
      resetForm();
    },
  });

  const sendMutation = useMutation({
    mutationFn: sendEmailCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailCampaigns"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmailCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailCampaigns"] });
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fillCouponTemplate = () => {
    setForm((prev) => ({
      ...prev,
      type: "coupon",
      subject: "A private AKM coupon for you",
      title: "Your AKM coupon is ready",
      message:
        "We prepared a special discount for your next AKM order. Use the code below before checkout and upgrade your everyday rotation.",
      ctaText: "Shop the Collection",
      ctaUrl: defaultShopUrl,
    }));
  };

  const fillOfferTemplate = () => {
    setForm((prev) => ({
      ...prev,
      type: "offer",
      subject: "AKM bundle offer is live",
      title: "Build your AKM set for less",
      message:
        "Our bundle offer is now available. Choose your colors, complete your set, and get better value on your AKM essentials.",
      couponCode: "",
      ctaText: "View Offers",
      ctaUrl: defaultShopUrl,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    createMutation.mutate({
      ...form,
      couponCode: form.couponCode.trim().toUpperCase(),
      ctaUrl: form.ctaUrl.trim() || defaultShopUrl,
    });
  };

  return (
    <div>
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
          Email Campaigns
        </p>

        <h1 className="mt-3 text-4xl font-semibold">Send customer emails</h1>

        <p className="mt-3 max-w-2xl text-zinc-400">
          Send offer or coupon emails to customers who signed up and accepted
          marketing updates.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-zinc-400">Marketing customers</p>
          <h2 className="mt-2 text-3xl font-semibold">
            {counts?.marketingCustomers || 0}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-zinc-400">All customers</p>
          <h2 className="mt-2 text-3xl font-semibold">
            {counts?.allCustomers || 0}
          </h2>
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[440px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 xl:self-start"
        >
          <h2 className="text-2xl font-semibold">Create Campaign</h2>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={fillCouponTemplate}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#c8b89d]/60"
            >
              Coupon Template
            </button>

            <button
              type="button"
              onClick={fillOfferTemplate}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#c8b89d]/60"
            >
              Offer Template
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <div>
              <label className="text-sm text-zinc-300">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
              >
                <option value="coupon">Coupon</option>
                <option value="offer">Offer</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-300">Audience</label>
              <select
                name="audience"
                value={form.audience}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
              >
                <option value="marketing_customers">
                  Marketing customers only
                </option>
                <option value="all_customers">All customers</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-300">Email subject</label>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Example: AKM bundle offer is live"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Email title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Main email heading"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="5"
                placeholder="Write the campaign message..."
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">
                Coupon code, optional
              </label>
              <input
                name="couponCode"
                value={form.couponCode}
                onChange={handleChange}
                placeholder="AKM10"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm uppercase text-white outline-none placeholder:normal-case placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">CTA text</label>
              <input
                name="ctaText"
                value={form.ctaText}
                onChange={handleChange}
                placeholder="Shop Now"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">CTA URL</label>
              <input
                name="ctaUrl"
                value={form.ctaUrl}
                onChange={handleChange}
                placeholder="https://your-domain.com/shop"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />
              <p className="mt-2 text-xs text-zinc-500">
                This now uses the current website domain by default instead of
                localhost.
              </p>
            </div>
          </div>

          {createMutation.isError && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {createMutation.error?.response?.data?.message ||
                "Failed to create campaign."}
            </div>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="mt-6 w-full rounded-full bg-[#f7f2ea] px-6 py-4 font-semibold text-black disabled:opacity-60"
          >
            {createMutation.isPending ? "Creating..." : "Create Campaign"}
          </button>
        </form>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          {isLoading ? (
            <p className="p-6 text-zinc-400">Loading campaigns...</p>
          ) : campaigns.length === 0 ? (
            <p className="p-6 text-zinc-400">No campaigns created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.04] text-zinc-400">
                  <tr>
                    <th className="px-5 py-4 font-medium">Campaign</th>
                    <th className="px-5 py-4 font-medium">Type</th>
                    <th className="px-5 py-4 font-medium">Audience</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Sent</th>
                    <th className="px-5 py-4 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign._id}
                      className="border-b border-white/10 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold">{campaign.subject}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {campaign.title}
                        </p>
                        {campaign.couponCode && (
                          <p className="mt-2 text-xs text-[#c8b89d]">
                            Coupon: {campaign.couponCode}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 capitalize">
                        {campaign.type}
                      </td>

                      <td className="px-5 py-4">
                        {campaign.audience === "marketing_customers"
                          ? "Marketing customers"
                          : "All customers"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs ${
                            campaign.status === "sent"
                              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                              : campaign.status === "failed"
                              ? "border-red-400/20 bg-red-500/10 text-red-200"
                              : campaign.status === "sending"
                              ? "border-yellow-400/20 bg-yellow-500/10 text-yellow-200"
                              : "border-white/10 bg-white/5 text-zinc-300"
                          }`}
                        >
                          {campaign.status}
                        </span>

                        {campaign.errorMessages?.length > 0 && (
                          <p className="mt-2 max-w-xs text-xs text-red-200">
                            {campaign.errorMessages[0]}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p>{campaign.sentCount} sent</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {campaign.failedCount} failed
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => sendMutation.mutate(campaign._id)}
                            disabled={
                              sendMutation.isPending ||
                              campaign.status === "sending"
                            }
                            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white hover:border-[#c8b89d]/60 disabled:opacity-50"
                          >
                            Send
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteMutation.mutate(campaign._id)}
                            className="text-xs text-red-300 hover:text-red-200"
                          >
                            Delete
                          </button>
                        </div>
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