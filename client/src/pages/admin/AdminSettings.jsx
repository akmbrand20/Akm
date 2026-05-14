import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Save, Trash2 } from "lucide-react";

import {
  getAdminSettings,
  updateAdminSettings,
} from "../../services/settingsService";
import { uploadMultipleImages } from "../../services/uploadService";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const qrInputRef = useRef(null);

  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadingQr, setUploadingQr] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["adminSettings"],
    queryFn: getAdminSettings,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        brandName: settings.brandName || "AKM",
        tagline: settings.tagline || "Comfort you can feel",
        announcement: {
          enabled: settings.announcement?.enabled !== false,
          text: settings.announcement?.text || "Wear comfort. Move different.",
        },
        deliveryFee: settings.deliveryFee ?? 80,
        freeShippingThreshold: settings.freeShippingThreshold ?? "",
        whatsappNumber: settings.whatsappNumber || "+201014318607",
        phone: settings.phone || "+201014318607",
        instapayNumber: settings.instapayNumber || "+201014318607",
        vodafoneCashNumber:
          settings.vodafoneCashNumber ||
          settings.instapayNumber ||
          "+201014318607",
        instagramUrl: settings.instagramUrl || "",
        tiktokUrl: settings.tiktokUrl || "",
        facebookUrl: settings.facebookUrl || "",
        instapayQr: settings.instapayQr || { url: "", publicId: "" },
        tracking: {
          metaPixelId: settings.tracking?.metaPixelId || "",
          ga4MeasurementId: settings.tracking?.ga4MeasurementId || "",
          gtmId: settings.tracking?.gtmId || "",
          tiktokPixelId: settings.tracking?.tiktokPixelId || "",
          snapPixelId: settings.tracking?.snapPixelId || "",
        },
        policies: {
          shippingPolicy: settings.policies?.shippingPolicy || "",
          returnPolicy: settings.policies?.returnPolicy || "",
          privacyPolicy: settings.policies?.privacyPolicy || "",
          terms: settings.policies?.terms || "",
        },
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: updateAdminSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
      queryClient.invalidateQueries({ queryKey: ["publicSettings"] });

      setMessage("Settings updated successfully.");

      setTimeout(() => {
        setMessage("");
      }, 2200);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAnnouncementChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      announcement: {
        ...prev.announcement,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleTrackingChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      tracking: {
        ...prev.tracking,
        [name]: value,
      },
    }));
  };

  const handlePolicyChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      policies: {
        ...prev.policies,
        [name]: value,
      },
    }));
  };

  const handleQrUpload = async (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    try {
      setUploadError("");
      setUploadingQr(true);

      const uploadedImages = await uploadMultipleImages({
        files: [files[0]],
        folder: "akm/settings/instapay",
        alt: "AKM Instapay QR",
      });

      const uploadedQr = uploadedImages[0];

      setForm((prev) => ({
        ...prev,
        instapayQr: uploadedQr,
      }));
    } catch (err) {
      setUploadError(
        err?.response?.data?.message || "Failed to upload Instapay QR."
      );
    } finally {
      setUploadingQr(false);

      if (qrInputRef.current) {
        qrInputRef.current.value = "";
      }
    }
  };

  const removeQr = () => {
    setForm((prev) => ({
      ...prev,
      instapayQr: {
        url: "",
        publicId: "",
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    updateMutation.mutate({
      ...form,
      deliveryFee: Number(form.deliveryFee),
      freeShippingThreshold:
        form.freeShippingThreshold === ""
          ? null
          : Number(form.freeShippingThreshold),
      instapayQr: form.instapayQr || { url: "", publicId: "" },
    });
  };

  if (isLoading || !form) {
    return <p className="text-zinc-400">Loading settings...</p>;
  }

  if (isError) {
    return <p className="text-red-300">Failed to load settings.</p>;
  }

  const qrPreviewUrl = form.instapayQr?.url || "/images/instapay-qr.webp";
  const isUsingUploadedQr = Boolean(form.instapayQr?.url);

  return (
    <div>
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
          Settings
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Store settings</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Update store details, social links, checkout settings, tracking IDs,
          and policy placeholders.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-8 xl:grid-cols-[1fr_380px]"
      >
        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Brand Details</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-zinc-300">Brand name</label>
                <input
                  name="brandName"
                  value={form.brandName}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">Tagline</label>
                <input
                  name="tagline"
                  value={form.tagline}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  WhatsApp number
                </label>
                <input
                  name="whatsappNumber"
                  value={form.whatsappNumber}
                  onChange={handleChange}
                  placeholder="+201014318607"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Announcement Bar</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              This sentence appears under the navbar and moves from left to
              right across the website.
            </p>

            <div className="mt-5 grid gap-4">
              <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-zinc-300">
                <span>Show announcement bar</span>
                <input
                  name="enabled"
                  type="checkbox"
                  checked={form.announcement.enabled}
                  onChange={handleAnnouncementChange}
                />
              </label>

              <div>
                <label className="text-sm text-zinc-300">
                  Announcement text
                </label>
                <input
                  name="text"
                  value={form.announcement.text}
                  onChange={handleAnnouncementChange}
                  placeholder="Wear comfort. Move different."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#050505]">
                <div className="akm-announcement-bar">
                  <div className="akm-announcement-track">
                    <span>
                      {form.announcement.text ||
                        "Wear comfort. Move different."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Checkout & Delivery</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-zinc-300">Delivery fee</label>
                <input
                  name="deliveryFee"
                  type="number"
                  value={form.deliveryFee}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  Free shipping threshold
                </label>
                <input
                  name="freeShippingThreshold"
                  type="number"
                  value={form.freeShippingThreshold}
                  onChange={handleChange}
                  placeholder="Leave empty if disabled"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  Instapay number
                </label>
                <input
                  name="instapayNumber"
                  value={form.instapayNumber}
                  onChange={handleChange}
                  placeholder="+201014318607"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  Vodafone Cash number
                </label>
                <input
                  name="vodafoneCashNumber"
                  value={form.vodafoneCashNumber}
                  onChange={handleChange}
                  placeholder="+201014318607"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Instapay QR</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    Default QR is loaded from{" "}
                    <span className="text-[#c8b89d]">
                      public/images/instapay-qr.webp
                    </span>
                    . Admin can upload a new one here later through Cloudinary.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => qrInputRef.current?.click()}
                  disabled={uploadingQr}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[#c8b89d]/60 disabled:opacity-60"
                >
                  <ImagePlus size={16} />
                  {uploadingQr ? "Uploading..." : "Upload QR"}
                </button>

                <input
                  ref={qrInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleQrUpload}
                  className="hidden"
                />
              </div>

              {uploadError && (
                <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {uploadError}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="w-40 overflow-hidden rounded-2xl border border-white/10 bg-white">
                  <img
                    src={qrPreviewUrl}
                    alt="Instapay QR"
                    className="w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-400">
                  <p className="font-semibold text-white">
                    {isUsingUploadedQr
                      ? "Using uploaded Cloudinary QR"
                      : "Using local default QR"}
                  </p>

                  <p className="mt-1">
                    Checkout will show this QR when customers choose Instapay
                    Pay Now.
                  </p>

                  {!isUsingUploadedQr && (
                    <p className="mt-2 text-xs text-zinc-500">
                      To change the default QR without Cloudinary, replace:
                      public/images/instapay-qr.webp
                    </p>
                  )}

                  {isUsingUploadedQr && (
                    <button
                      type="button"
                      onClick={removeQr}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-400/20 px-4 py-2 text-sm text-red-200 hover:bg-red-500/10"
                    >
                      <Trash2 size={15} />
                      Remove uploaded QR
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Social Links</h2>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-sm text-zinc-300">Instagram URL</label>
                <input
                  name="instagramUrl"
                  value={form.instagramUrl}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">TikTok URL</label>
                <input
                  name="tiktokUrl"
                  value={form.tiktokUrl}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">Facebook URL</label>
                <input
                  name="facebookUrl"
                  value={form.facebookUrl}
                  onChange={handleChange}
                  placeholder="Paste Facebook page URL"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Tracking IDs</h2>
            <p className="mt-2 text-sm text-zinc-500">
              These values will be used later when we connect Meta Pixel, GA4,
              GTM, TikTok Pixel, and Snapchat Pixel.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-zinc-300">Meta Pixel ID</label>
                <input
                  name="metaPixelId"
                  value={form.tracking.metaPixelId}
                  onChange={handleTrackingChange}
                  placeholder="Example: 123456789"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  GA4 Measurement ID
                </label>
                <input
                  name="ga4MeasurementId"
                  value={form.tracking.ga4MeasurementId}
                  onChange={handleTrackingChange}
                  placeholder="G-XXXXXXXXXX"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">GTM ID</label>
                <input
                  name="gtmId"
                  value={form.tracking.gtmId}
                  onChange={handleTrackingChange}
                  placeholder="GTM-XXXXXXX"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  TikTok Pixel ID
                </label>
                <input
                  name="tiktokPixelId"
                  value={form.tracking.tiktokPixelId}
                  onChange={handleTrackingChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  Snapchat Pixel ID
                </label>
                <input
                  name="snapPixelId"
                  value={form.tracking.snapPixelId}
                  onChange={handleTrackingChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Policies</h2>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-sm text-zinc-300">
                  Shipping policy
                </label>
                <textarea
                  name="shippingPolicy"
                  value={form.policies.shippingPolicy}
                  onChange={handlePolicyChange}
                  rows="4"
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  Return / exchange policy
                </label>
                <textarea
                  name="returnPolicy"
                  value={form.policies.returnPolicy}
                  onChange={handlePolicyChange}
                  rows="4"
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">Privacy policy</label>
                <textarea
                  name="privacyPolicy"
                  value={form.policies.privacyPolicy}
                  onChange={handlePolicyChange}
                  rows="4"
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  Terms & conditions
                </label>
                <textarea
                  name="terms"
                  value={form.policies.terms}
                  onChange={handlePolicyChange}
                  rows="4"
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Save Settings</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Changes will affect store details and checkout settings after
              saving.
            </p>

            {message && (
              <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {message}
              </div>
            )}

            {updateMutation.isError && (
              <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {updateMutation.error?.response?.data?.message ||
                  "Failed to update settings."}
              </div>
            )}

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#f7f2ea] px-6 py-4 font-semibold text-black disabled:opacity-60"
            >
              <Save size={18} />
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
