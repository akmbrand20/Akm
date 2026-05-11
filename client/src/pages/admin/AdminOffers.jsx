import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Mail, Plus, Save, Trash2, X } from "lucide-react";

import {
  createAdminOffer,
  deleteAdminOffer,
  getAdminOffers,
  sendAdminOfferNotification,
  updateAdminOffer,
} from "../../services/adminOfferService";
import { getAdminProducts } from "../../services/adminProductService";
import { formatCurrency } from "../../lib/formatCurrency";

const createSlug = (value = "") => {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const defaultForm = {
  type: "product",
  title: "",
  slug: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  badge: "",
  targetProducts: [],
  bundleProducts: [],
  sets: "",
  regularPrice: "",
  offerPrice: "",
  savings: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
  notifyCustomers: false,
  audience: "marketing_customers",
};

const formatDateForInput = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  const offset = parsedDate.getTimezoneOffset();
  const localDate = new Date(parsedDate.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
};

function DeleteOfferModal({ offer, isDeleting, onClose, onConfirm }) {
  if (!offer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#c8b89d]">
              Delete Offer
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Are you sure?</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Close delete offer modal"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-5 leading-7 text-zinc-300">
          You are about to delete{" "}
          <span className="font-semibold text-white">“{offer.title}”</span>.
          This offer will stop applying immediately.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white hover:border-[#c8b89d]/60 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-200 px-5 py-3 text-sm font-semibold text-black hover:bg-red-100 disabled:opacity-60"
          >
            <Trash2 size={16} />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOffers() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState(defaultForm);
  const [manualSlug, setManualSlug] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [offerToDelete, setOfferToDelete] = useState(null);

  const isEditing = Boolean(editingOfferId);

  const { data: offers = [], isLoading: offersLoading } = useQuery({
    queryKey: ["adminOffers"],
    queryFn: getAdminOffers,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: getAdminProducts,
  });

  const selectedProductNames = useMemo(() => {
    return products
      .filter((product) => form.targetProducts.includes(product._id))
      .map((product) => product.name);
  }, [products, form.targetProducts]);

  const selectedBundleProductNames = useMemo(() => {
    return products
      .filter((product) => form.bundleProducts.includes(product._id))
      .map((product) => product.name);
  }, [products, form.bundleProducts]);

  const invalidateOfferQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["adminOffers"] });
    queryClient.invalidateQueries({ queryKey: ["offers"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["featuredProducts"] });
    queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    queryClient.invalidateQueries({ queryKey: ["productFilters"] });
    queryClient.invalidateQueries({ queryKey: ["product"] });
  };

  const resetForm = () => {
    setForm(defaultForm);
    setManualSlug(false);
    setEditingOfferId(null);
  };

  const createMutation = useMutation({
    mutationFn: createAdminOffer,
    onSuccess: () => {
      invalidateOfferQueries();
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAdminOffer,
    onSuccess: () => {
      invalidateOfferQueries();
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminOffer,
    onSuccess: () => {
      invalidateOfferQueries();
      setOfferToDelete(null);
    },
  });

  const notifyMutation = useMutation({
    mutationFn: sendAdminOfferNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOffers"] });
    },
  });

  const activeMutation = isEditing ? updateMutation : createMutation;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      const nextForm = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "type" && value === "bundle") {
        nextForm.targetProducts = [];
        nextForm.bundleProducts = [];
        nextForm.discountValue = "";
        nextForm.discountType = "percentage";
      }

      if (name === "type" && value === "product") {
        nextForm.bundleProducts = [];
        nextForm.sets = "";
        nextForm.regularPrice = "";
        nextForm.offerPrice = "";
        nextForm.savings = "";
      }

      if (name === "title" && !manualSlug) {
        nextForm.slug = createSlug(value);
      }

      if (name === "slug") {
        nextForm.slug = createSlug(value);
      }

      if (name === "regularPrice" || name === "offerPrice") {
        const regular =
          name === "regularPrice"
            ? Number(value || 0)
            : Number(prev.regularPrice || 0);
        const offer =
          name === "offerPrice"
            ? Number(value || 0)
            : Number(prev.offerPrice || 0);

        if (regular > 0 && offer > 0 && offer < regular) {
          nextForm.savings = String(regular - offer);
        }
      }

      return nextForm;
    });
  };

  const toggleProduct = (productId) => {
    setForm((prev) => {
      const exists = prev.targetProducts.includes(productId);

      return {
        ...prev,
        targetProducts: exists
          ? prev.targetProducts.filter((id) => id !== productId)
          : [...prev.targetProducts, productId],
      };
    });
  };

  const toggleBundleProduct = (productId) => {
    setForm((prev) => {
      const exists = prev.bundleProducts.includes(productId);

      if (exists) {
        return {
          ...prev,
          bundleProducts: prev.bundleProducts.filter((id) => id !== productId),
        };
      }

      if (prev.bundleProducts.length >= 2) {
        return prev;
      }

      return {
        ...prev,
        bundleProducts: [...prev.bundleProducts, productId],
      };
    });
  };

  const startEditing = (offer) => {
    setEditingOfferId(offer._id);
    setManualSlug(true);

    setForm({
      type: offer.type || "product",
      title: offer.title || "",
      slug: offer.slug || "",
      description: offer.description || "",
      discountType: offer.discountType || "percentage",
      discountValue: offer.discountValue || "",
      badge: offer.badge || "",
      targetProducts:
        offer.targetProducts?.map((product) =>
          typeof product === "string" ? product : product._id
        ) || [],
      bundleProducts:
        offer.bundleProducts?.map((product) =>
          typeof product === "string" ? product : product._id
        ) || [],
      sets: offer.sets || "",
      regularPrice: offer.regularPrice || "",
      offerPrice: offer.offerPrice || "",
      savings: offer.savings || "",
      startsAt: formatDateForInput(offer.startsAt),
      endsAt: formatDateForInput(offer.endsAt),
      isActive: Boolean(offer.isActive),
      notifyCustomers: false,
      audience: "marketing_customers",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayload = () => ({
    ...form,
    slug: createSlug(form.slug || form.title),
    targetProducts: form.targetProducts,
    bundleProducts: form.bundleProducts,
    discountValue: Number(form.discountValue || 0),
    sets: Number(form.sets || 0),
    regularPrice: Number(form.regularPrice || 0),
    offerPrice: Number(form.offerPrice || 0),
    savings: Number(form.savings || 0),
    startsAt: form.startsAt || null,
    endsAt: form.endsAt || null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditing) {
      updateMutation.mutate({
        id: editingOfferId,
        offerData: buildPayload(),
      });
      return;
    }

    createMutation.mutate(buildPayload());
  };

  const isDeletingSelectedOffer =
    deleteMutation.isPending && deleteMutation.variables === offerToDelete?._id;

  return (
    <div>
      <DeleteOfferModal
        offer={offerToDelete}
        isDeleting={isDeletingSelectedOffer}
        onClose={() => {
          if (!deleteMutation.isPending) setOfferToDelete(null);
        }}
        onConfirm={() => {
          if (offerToDelete?._id) deleteMutation.mutate(offerToDelete._id);
        }}
      />

      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
          Offers
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Offers</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Manage product sale offers and bundle offers from one place.
        </p>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[440px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 xl:self-start"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-semibold">
              {isEditing ? "Edit Offer" : "Create Offer"}
            </h2>

            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:border-[#c8b89d]/60"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-4">
            {!isEditing && (
              <div>
                <label className="text-sm text-zinc-300">Offer type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                >
                  <option value="product">Product offer</option>
                  <option value="bundle">Bundle offer</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-sm text-zinc-300">Offer title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder={
                  form.type === "bundle" ? "AKM Set Bundle" : "Winter Drop Offer"
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Slug</label>
              <input
                name="slug"
                value={form.slug}
                onChange={(e) => {
                  setManualSlug(true);
                  handleChange(e);
                }}
                placeholder="akm-set-bundle"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Write the offer description..."
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Badge</label>
              <input
                name="badge"
                value={form.badge}
                onChange={handleChange}
                placeholder="Save 250 EGP"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />
            </div>

            {form.type === "product" ? (
              <>
                <div>
                  <label className="text-sm text-zinc-300">Discount type</label>
                  <select
                    name="discountType"
                    value={form.discountType}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                  >
                    <option value="percentage">Percentage discount</option>
                    <option value="fixed">Fixed discount</option>
                    <option value="salePrice">Fixed sale price</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-zinc-300">
                    {form.discountType === "percentage"
                      ? "Percentage"
                      : form.discountType === "fixed"
                      ? "Discount amount"
                      : "Sale price"}
                  </label>
                  <input
                    name="discountValue"
                    type="number"
                    min="0"
                    value={form.discountValue}
                    onChange={handleChange}
                    placeholder="20"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm text-zinc-300">
                    Number of complete bundles
                  </label>
                  <input
                    name="sets"
                    type="number"
                    min="1"
                    value={form.sets}
                    onChange={handleChange}
                    placeholder="1"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                  <p className="mt-2 text-xs text-zinc-500">
                    Example: 1 means the customer needs 1 of each selected bundle
                    product. 2 means 2 of each selected product.
                  </p>
                </div>

                <div>
                  <label className="text-sm text-zinc-300">Regular price</label>
                  <input
                    name="regularPrice"
                    type="number"
                    min="0"
                    value={form.regularPrice}
                    onChange={handleChange}
                    placeholder="1250"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-300">Offer price</label>
                  <input
                    name="offerPrice"
                    type="number"
                    min="0"
                    value={form.offerPrice}
                    onChange={handleChange}
                    placeholder="1000"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-300">Savings</label>
                  <input
                    name="savings"
                    type="number"
                    min="0"
                    value={form.savings}
                    onChange={handleChange}
                    placeholder="250"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-300">
                    Selected bundle products
                  </label>
                  <div className="mt-2 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-zinc-400">
                    {selectedBundleProductNames.length > 0
                      ? selectedBundleProductNames.join(" + ")
                      : "Choose exactly two products below."}
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    The bundle applies only when the cart contains these exact
                    two products.
                  </p>
                </div>
              </>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm text-zinc-300">Starts at</label>
                <input
                  name="startsAt"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-300">Ends at</label>
                <input
                  name="endsAt"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                />
              </div>
            </div>

            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-zinc-300">
              <span>Active offer</span>
              <input
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={handleChange}
              />
            </label>

            {!isEditing && (
              <>
                <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-zinc-300">
                  <span>Notify customers by email</span>
                  <input
                    name="notifyCustomers"
                    type="checkbox"
                    checked={form.notifyCustomers}
                    onChange={handleChange}
                  />
                </label>

                {form.notifyCustomers && (
                  <div>
                    <label className="text-sm text-zinc-300">
                      Email audience
                    </label>
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
                )}
              </>
            )}

            {form.type === "product" && (
              <div>
                <label className="text-sm text-zinc-300">
                  Selected products
                </label>
                <div className="mt-2 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-zinc-400">
                  {selectedProductNames.length > 0
                    ? selectedProductNames.join(", ")
                    : "No products selected yet."}
                </div>
              </div>
            )}
          </div>

          {activeMutation.isError && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {activeMutation.error?.response?.data?.message ||
                "Failed to save offer."}
            </div>
          )}

          <button
            type="submit"
            disabled={activeMutation.isPending}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#f7f2ea] px-6 py-4 font-semibold text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEditing ? <Save size={17} /> : <Plus size={17} />}
            {activeMutation.isPending
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
              ? "Save Offer"
              : "Create Offer"}
          </button>
        </form>

        <div className="space-y-8">
          {form.type === "product" && (
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-2xl font-semibold">Choose Products</h2>

              {productsLoading ? (
                <p className="mt-5 text-zinc-400">Loading products...</p>
              ) : (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {products.map((product) => {
                    const selected = form.targetProducts.includes(product._id);

                    return (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => toggleProduct(product._id)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-[#c8b89d] bg-[#c8b89d]/10"
                            : "border-white/10 bg-black/20 hover:border-white/30"
                        }`}
                      >
                        <p className="font-semibold">{product.name}</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {formatCurrency(product.price)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {form.type === "bundle" && (
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-2xl font-semibold">Choose Bundle Products</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Choose exactly two products. The bundle discount applies only
                when both selected products are in the cart.
              </p>

              {productsLoading ? (
                <p className="mt-5 text-zinc-400">Loading products...</p>
              ) : (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {products.map((product) => {
                    const selected = form.bundleProducts.includes(product._id);
                    const disabled =
                      !selected && form.bundleProducts.length >= 2;

                    return (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => toggleBundleProduct(product._id)}
                        disabled={disabled}
                        className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          selected
                            ? "border-[#c8b89d] bg-[#c8b89d]/10"
                            : "border-white/10 bg-black/20 hover:border-white/30"
                        }`}
                      >
                        <p className="font-semibold">{product.name}</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {formatCurrency(product.price)}
                        </p>
                        {selected && (
                          <p className="mt-2 text-xs text-[#c8b89d]">
                            Selected
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            {offersLoading ? (
              <p className="p-6 text-zinc-400">Loading offers...</p>
            ) : offers.length === 0 ? (
              <p className="p-6 text-zinc-400">No offers created yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.04] text-zinc-400">
                    <tr>
                      <th className="px-5 py-4 font-medium">Offer</th>
                      <th className="px-5 py-4 font-medium">Type</th>
                      <th className="px-5 py-4 font-medium">Value</th>
                      <th className="px-5 py-4 font-medium">Products/Sets</th>
                      <th className="px-5 py-4 font-medium">Email</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                      <th className="px-5 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {offers.map((offer) => (
                      <tr
                        key={offer._id}
                        className="border-b border-white/10 last:border-0"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold">{offer.title}</p>
                          {offer.badge && (
                            <p className="mt-1 text-xs text-[#c8b89d]">
                              {offer.badge}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 capitalize">{offer.type}</td>

                        <td className="px-5 py-4">
                          {offer.type === "bundle"
                            ? `${formatCurrency(offer.offerPrice)} bundle`
                            : offer.discountType === "percentage"
                            ? `${offer.discountValue}%`
                            : offer.discountType === "fixed"
                            ? `${offer.discountValue} EGP off`
                            : `${offer.discountValue} EGP sale price`}
                        </td>

                        <td className="px-5 py-4">
                          {offer.type === "bundle" ? (
                            <div>
                              <p>
                                {offer.sets} bundle
                                {Number(offer.sets) > 1 ? "s" : ""} of{" "}
                                {offer.bundleProducts?.length || 0} products
                              </p>
                              {offer.bundleProducts?.length > 0 && (
                                <p className="mt-1 max-w-xs text-xs text-zinc-500">
                                  {offer.bundleProducts
                                    .map((product) => product.name)
                                    .join(" + ")}
                                </p>
                              )}
                            </div>
                          ) : (
                            `${offer.targetProducts?.length || 0} product${
                              (offer.targetProducts?.length || 0) === 1
                                ? ""
                                : "s"
                            }`
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p>{offer.emailSendingStatus}</p>
                          {offer.notifiedEmailsCount > 0 && (
                            <p className="mt-1 text-xs text-zinc-500">
                              {offer.notifiedEmailsCount} sent
                            </p>
                          )}
                          {offer.emailError && (
                            <p className="mt-1 max-w-xs text-xs text-red-200">
                              {offer.emailError}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs ${
                              offer.isActive
                                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                                : "border-red-400/20 bg-red-500/10 text-red-200"
                            }`}
                          >
                            {offer.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEditing(offer)}
                              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white hover:border-[#c8b89d]/60"
                            >
                              <Edit size={14} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                notifyMutation.mutate({
                                  id: offer._id,
                                  audience: "marketing_customers",
                                })
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white hover:border-[#c8b89d]/60"
                            >
                              <Mail size={14} />
                              Notify
                            </button>

                            <button
                              type="button"
                              onClick={() => setOfferToDelete(offer)}
                              className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 px-3 py-2 text-xs text-red-200 hover:bg-red-500/10"
                            >
                              <Trash2 size={14} />
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
          </section>
        </div>
      </div>
    </div>
  );
}