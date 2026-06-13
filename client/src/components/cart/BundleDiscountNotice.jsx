import { useMemo, useState } from "react";
import { CheckCircle2, PackagePlus } from "lucide-react";
import { formatCurrency } from "../../lib/formatCurrency";
import { useLanguage } from "../../hooks/useLanguage";
import {
  getAvailableColors,
  getAvailableSizesForColor,
  getBundleRequiredItems,
  getCartVariantQuantity,
  getMissingBundleSlots,
  getProductVariantImage,
  getVariantStock,
  hasBundleProductData,
} from "../../lib/bundleCompletion";

const getOfferKey = (offer) => {
  return offer?._id || offer?.slug || `${offer?.title}-${offer?.sets}`;
};

const isCompletableBundleOffer = (offer) => {
  const requiredItems = getBundleRequiredItems(offer);

  return (
    requiredItems.length >= 2 &&
    requiredItems.every((item) => hasBundleProductData(item.product))
  );
};

const getVariantKey = ({ productId, color, size }) => {
  return `${productId}-${color}-${size}`;
};

export default function BundleDiscountNotice({
  totals,
  cartItems = [],
  bundleOffers = [],
  onCompleteBundle,
}) {
  const { t } = useLanguage();
  const [activeOfferKey, setActiveOfferKey] = useState("");
  const [slotSelections, setSlotSelections] = useState({});
  const [statusMessage, setStatusMessage] = useState("");

  const offerButtons = useMemo(() => {
    return bundleOffers
      .filter(
        (offer) =>
          offer?.type === "bundle" &&
          offer?.isActive !== false &&
          Number(offer.sets || 0) > 0 &&
          isCompletableBundleOffer(offer)
      )
      .sort((a, b) => Number(a.sets || 0) - Number(b.sets || 0));
  }, [bundleOffers]);

  const activeOffer = useMemo(() => {
    return offerButtons.find((offer) => getOfferKey(offer) === activeOfferKey);
  }, [activeOfferKey, offerButtons]);

  const missingSlots = useMemo(() => {
    return activeOffer ? getMissingBundleSlots(activeOffer, cartItems) : [];
  }, [activeOffer, cartItems]);

  const selectedSlots = useMemo(() => {
    return missingSlots.map((slot) => ({
      ...slot,
      ...(slotSelections[slot.slotId] || {}),
    }));
  }, [missingSlots, slotSelections]);

  const missingCounts = useMemo(() => {
    const countsByProduct = new Map();

    missingSlots.forEach((slot) => {
      const currentCount = countsByProduct.get(slot.productId);

      countsByProduct.set(slot.productId, {
        product: slot.product,
        count: Number(currentCount?.count || 0) + 1,
      });
    });

    return Array.from(countsByProduct.values());
  }, [missingSlots]);

  const hasBundleDiscount = Number(totals.bundleDiscount || 0) > 0;

  const getRemainingStockForSlot = (slot, color, size) => {
    if (!color || !size) return 0;

    const stock = getVariantStock(slot.product, color, size);
    const cartQuantity = getCartVariantQuantity({
      cartItems,
      productId: slot.productId,
      color,
      size,
    });
    const otherSelectedQuantity = selectedSlots.filter(
      (selectedSlot) =>
        selectedSlot.slotId !== slot.slotId &&
        selectedSlot.productId === slot.productId &&
        selectedSlot.color === color &&
        selectedSlot.size === size
    ).length;

    return stock - cartQuantity - otherSelectedQuantity;
  };

  const getSelectionError = () => {
    if (!activeOffer) return t("bundle.chooseOfferFirst");
    if (missingSlots.length === 0) return t("bundle.noMissingItems");

    const variantPlans = new Map();

    for (const slot of selectedSlots) {
      if (!slot.color || !slot.size) {
        return t("bundle.chooseAllVariants");
      }

      const variantKey = getVariantKey(slot);
      const currentPlan = variantPlans.get(variantKey);

      variantPlans.set(variantKey, {
        product: slot.product,
        productId: slot.productId,
        color: slot.color,
        size: slot.size,
        count: Number(currentPlan?.count || 0) + 1,
      });
    }

    for (const plan of variantPlans.values()) {
      const stock = getVariantStock(plan.product, plan.color, plan.size);
      const cartQuantity = getCartVariantQuantity({
        cartItems,
        productId: plan.productId,
        color: plan.color,
        size: plan.size,
      });

      if (cartQuantity + plan.count > stock) {
        return t("bundle.notEnoughStock", {
          count: Math.max(0, stock - cartQuantity),
        });
      }
    }

    return "";
  };

  const handleOfferClick = (offer) => {
    setActiveOfferKey(getOfferKey(offer));
    setSlotSelections({});
    setStatusMessage("");
  };

  const handleColorChange = (slotId, color) => {
    setSlotSelections((currentSelections) => ({
      ...currentSelections,
      [slotId]: {
        color,
        size: "",
      },
    }));
    setStatusMessage("");
  };

  const handleSizeChange = (slotId, size) => {
    setSlotSelections((currentSelections) => ({
      ...currentSelections,
      [slotId]: {
        ...(currentSelections[slotId] || {}),
        size,
      },
    }));
    setStatusMessage("");
  };

  const handleCompleteBundle = () => {
    const selectionError = getSelectionError();

    if (selectionError) {
      setStatusMessage(selectionError);
      return;
    }

    const result = onCompleteBundle?.({
      offer: activeOffer,
      selectedItems: selectedSlots.map((slot) => ({
        slotId: slot.slotId,
        productId: slot.productId,
        color: slot.color,
        size: slot.size,
      })),
    });

    if (result?.success) {
      setStatusMessage(
        t("bundle.addedItems", {
          count: result.addedCount || selectedSlots.length,
          offer: activeOffer.title,
        })
      );
      setActiveOfferKey("");
      setSlotSelections({});
      return;
    }

    setStatusMessage(
      result?.reason === "complete"
        ? t("bundle.noMissingItems")
        : t("bundle.stockChanged")
    );
  };

  const hasOfferButtons = offerButtons.length > 0;

  return (
    <div
      className={`rounded-3xl border p-5 ${
        hasBundleDiscount
          ? "border-[#c8b89d]/30 bg-[#c8b89d]/10"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <p className="text-sm uppercase tracking-[0.25em] text-[#c8b89d]">
        {hasBundleDiscount ? t("bundle.unlocked") : t("bundle.completeSet")}
      </p>

      <h2 className="mt-2 text-xl font-semibold">
        {hasBundleDiscount
          ? totals.appliedOffer
          : totals.completeSets === 1
          ? t("bundle.addOneMore")
          : t("bundle.unlock")}
      </h2>

      <p className="mt-2 text-zinc-400">
        {hasBundleDiscount
          ? totals.bundleMessage
          : totals.completeSets === 1
          ? t("bundle.duoPrice")
          : t("bundle.pricing")}
      </p>

      {hasBundleDiscount && (
        <p className="mt-3 font-semibold text-[#e8d6b8]">
          {t("bundle.saved", {
            amount: totals.bundleDiscount.toLocaleString(),
          })}
        </p>
      )}

      {hasOfferButtons ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {offerButtons.map((offer) => {
            const active = getOfferKey(offer) === activeOfferKey;

            return (
              <button
                key={getOfferKey(offer)}
                type="button"
                onClick={() => handleOfferClick(offer)}
                className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  active
                    ? "border-[#c8b89d] bg-[#c8b89d] text-black"
                    : "border-white/10 bg-black/20 text-white hover:border-[#c8b89d]/60"
                }`}
              >
                <span>
                  <span className="block font-semibold">{offer.title}</span>
                  <span
                    className={`mt-1 block text-xs ${
                      active ? "text-black/70" : "text-zinc-400"
                    }`}
                  >
                    {t("bundle.setsForPrice", {
                      count: Number(offer.sets || 0),
                      price: formatCurrency(offer.offerPrice),
                    })}
                  </span>
                  {offer.freeDelivery && (
                    <span
                      className={`mt-1 block text-xs font-semibold ${
                        active ? "text-black" : "text-emerald-200"
                      }`}
                    >
                      {t("bundle.freeDelivery")}
                    </span>
                  )}
                </span>
                <PackagePlus size={18} />
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
          {t("bundle.noConfiguredOffers")}
        </p>
      )}

      {activeOffer && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">
              {t("bundle.chooseItemFor", { offer: activeOffer.title })}
            </p>
            <p className="text-sm text-zinc-400">
              {t("bundle.willSetQuantities", {
                count: Number(activeOffer.sets || 0),
              })}
            </p>
          </div>

          {missingSlots.length > 0 ? (
            <>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-[#c8b89d]/30 bg-[#c8b89d]/10 px-3 py-1 font-semibold text-[#e8d6b8]">
                  {t("bundle.missingItemsCount", {
                    count: missingSlots.length,
                  })}
                </span>
                {missingCounts.map(({ product, count }) => (
                  <span
                    key={product._id || product.slug || product.name}
                    className="rounded-full border border-white/10 px-3 py-1 text-zinc-300"
                  >
                    {t("bundle.missingProductCount", {
                      product: product.name,
                      count,
                    })}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid gap-3">
                {selectedSlots.map((slot, index) => {
                  const colors = getAvailableColors(slot.product);
                  const sizes = slot.color
                    ? getAvailableSizesForColor(slot.product, slot.color)
                    : [];
                  const displayImage =
                    getProductVariantImage(slot.product, slot.color) ||
                    "/images/akm-logo.webp";
                  const slotIsComplete = Boolean(slot.color && slot.size);
                  const selectedCartQuantity =
                    slot.color && slot.size
                      ? getCartVariantQuantity({
                          cartItems,
                          productId: slot.productId,
                          color: slot.color,
                          size: slot.size,
                        })
                      : 0;
                  const selectedRemaining =
                    slot.color && slot.size
                      ? getRemainingStockForSlot(slot, slot.color, slot.size)
                      : 0;

                  return (
                    <div
                      key={slot.slotId}
                      className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-[64px_1fr] sm:items-center"
                    >
                      <span className="block overflow-hidden rounded-xl bg-white/[0.04]">
                        <span className="block aspect-square">
                          <img
                            src={displayImage}
                            alt={slot.product.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </span>
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="break-words font-semibold text-white">
                              {slot.product.name}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {t("bundle.itemNumber", { count: index + 1 })}
                            </p>
                          </div>

                          {slotIsComplete && selectedRemaining > 0 && (
                            <span className="inline-flex text-[#c8b89d]">
                              <CheckCircle2 size={19} />
                            </span>
                          )}
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <select
                            value={slot.color}
                            onChange={(event) =>
                              handleColorChange(slot.slotId, event.target.value)
                            }
                            className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
                            aria-label={t("bundle.chooseColor")}
                          >
                            <option value="">{t("bundle.chooseColor")}</option>
                            {colors.map((color) => (
                              <option key={color.name} value={color.name}>
                                {color.name}
                              </option>
                            ))}
                          </select>

                          <select
                            value={slot.size}
                            onChange={(event) =>
                              handleSizeChange(slot.slotId, event.target.value)
                            }
                            disabled={!slot.color}
                            className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={t("bundle.chooseSize")}
                          >
                            <option value="">{t("bundle.chooseSize")}</option>
                            {sizes.map((sizeItem) => {
                              const remaining = getRemainingStockForSlot(
                                slot,
                                slot.color,
                                sizeItem.size
                              );

                              return (
                                <option
                                  key={sizeItem.size}
                                  value={sizeItem.size}
                                  disabled={
                                    remaining <= 0 &&
                                    slot.size !== sizeItem.size
                                  }
                                >
                                  {sizeItem.size}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {slot.color && slot.size && (
                          <p
                            className={`mt-2 text-xs ${
                              selectedRemaining > 0
                                ? "text-zinc-500"
                                : "text-red-200"
                            }`}
                          >
                            {selectedRemaining > 0
                              ? t("bundle.currentQuantity", {
                                  count: selectedCartQuantity,
                                })
                              : t("bundle.notEnoughStock", { count: 0 })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
              {t("bundle.noMissingItems")}
            </p>
          )}

          <button
            type="button"
            onClick={handleCompleteBundle}
            disabled={missingSlots.length === 0}
            className="mt-4 w-full rounded-full bg-[#f7f2ea] px-5 py-3 font-semibold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("bundle.completeOffer", { offer: activeOffer.title })}
          </button>
        </div>
      )}

      {statusMessage && (
        <p className="mt-4 rounded-2xl border border-[#c8b89d]/30 bg-[#c8b89d]/10 px-4 py-3 text-sm text-[#e8d6b8]">
          {statusMessage}
        </p>
      )}
    </div>
  );
}
