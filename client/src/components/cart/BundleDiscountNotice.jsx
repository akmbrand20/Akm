import { useMemo, useState } from "react";
import { CheckCircle2, PackagePlus } from "lucide-react";
import { formatCurrency } from "../../lib/formatCurrency";
import { useLanguage } from "../../hooks/useLanguage";

const normalizeProductId = (value) => {
  if (!value) return "";
  return String(value._id || value.id || value);
};

const getOfferKey = (offer) => {
  return offer?._id || offer?.slug || `${offer?.title}-${offer?.sets}`;
};

const getVariantStock = (product, color, size) => {
  const colorData = product?.colors?.find(
    (productColor) => productColor.name === color
  );
  const sizeData = colorData?.sizes?.find((sizeItem) => sizeItem.size === size);

  return Number(sizeData?.stock || 0);
};

const getPartnerProduct = (offer, cartItem) => {
  const bundleProducts = Array.isArray(offer?.bundleProducts)
    ? offer.bundleProducts
    : [];
  const cartProductId = normalizeProductId(cartItem?.productId);

  return bundleProducts.find(
    (product) => normalizeProductId(product) !== cartProductId
  );
};

const getCandidateDetails = ({ cartItem, offer, cartItems, t }) => {
  const targetQuantity = Number(offer?.sets || 0);
  const partnerProduct = getPartnerProduct(offer, cartItem);

  if (!partnerProduct || targetQuantity <= 0) {
    return {
      disabledReason: t("bundle.missingPartner"),
      partnerProduct: null,
      helperText: "",
    };
  }

  const baseMaxStock = Number(cartItem.maxStock || 0);
  const hasKnownBaseStock = Number.isFinite(baseMaxStock) && baseMaxStock > 0;
  const partnerProductId = normalizeProductId(partnerProduct);
  const existingPartner = cartItems.find(
    (item) =>
      normalizeProductId(item.productId) === partnerProductId &&
      item.color === cartItem.color &&
      item.size === cartItem.size
  );
  const partnerVariantStock =
    getVariantStock(partnerProduct, cartItem.color, cartItem.size) ||
    Number(existingPartner?.maxStock || 0);
  const partnerAvailable = Number.isFinite(partnerVariantStock)
    ? partnerVariantStock
    : 0;

  if (hasKnownBaseStock && baseMaxStock < targetQuantity) {
    return {
      disabledReason: t("bundle.notEnoughStock", { count: baseMaxStock }),
      partnerProduct,
      helperText: "",
    };
  }

  if (partnerAvailable <= 0) {
    return {
      disabledReason: t("bundle.missingVariant", {
        color: cartItem.color,
        size: cartItem.size,
      }),
      partnerProduct,
      helperText: "",
    };
  }

  if (partnerAvailable < targetQuantity) {
    return {
      disabledReason: t("bundle.notEnoughStock", { count: partnerAvailable }),
      partnerProduct,
      helperText: "",
    };
  }

  return {
    disabledReason: "",
    partnerProduct,
    helperText: t("bundle.matchingItem", {
      product: partnerProduct.name,
      color: cartItem.color,
      size: cartItem.size,
    }),
  };
};

export default function BundleDiscountNotice({
  totals,
  cartItems = [],
  bundleOffers = [],
  onCompleteBundle,
}) {
  const { t } = useLanguage();
  const [activeOfferKey, setActiveOfferKey] = useState("");
  const [selectedCartItemId, setSelectedCartItemId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const offerButtons = useMemo(() => {
    return bundleOffers
      .filter(
        (offer) =>
          offer?.type === "bundle" &&
          offer?.isActive !== false &&
          Number(offer.sets || 0) > 0
      )
      .sort((a, b) => Number(a.sets || 0) - Number(b.sets || 0));
  }, [bundleOffers]);

  const activeOffer = useMemo(() => {
    return offerButtons.find((offer) => getOfferKey(offer) === activeOfferKey);
  }, [activeOfferKey, offerButtons]);

  const candidateItems = useMemo(() => {
    if (!activeOffer) return [];

    const bundleProductIds = (activeOffer.bundleProducts || []).map(
      normalizeProductId
    );

    return cartItems
      .filter((item) => bundleProductIds.includes(normalizeProductId(item.productId)))
      .map((item) => ({
        item,
        ...getCandidateDetails({
          cartItem: item,
          offer: activeOffer,
          cartItems,
          t,
        }),
      }));
  }, [activeOffer, cartItems, t]);

  const selectedCandidate = candidateItems.find(
    (candidate) => candidate.item.cartItemId === selectedCartItemId
  );
  const hasBundleDiscount = Number(totals.bundleDiscount || 0) > 0;

  const handleOfferClick = (offer) => {
    setActiveOfferKey(getOfferKey(offer));
    setSelectedCartItemId("");
    setStatusMessage("");
  };

  const handleCompleteBundle = () => {
    if (!activeOffer || !selectedCandidate || selectedCandidate.disabledReason) {
      setStatusMessage(t("bundle.chooseFirst"));
      return;
    }

    onCompleteBundle?.({
      offer: activeOffer,
      baseCartItemId: selectedCandidate.item.cartItemId,
    });

    setStatusMessage(
      t("bundle.applied", {
        offer: activeOffer.title,
      })
    );
    setActiveOfferKey("");
    setSelectedCartItemId("");
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

          {candidateItems.length > 0 ? (
            <div className="mt-4 grid gap-3">
              {candidateItems.map(({ item, disabledReason, helperText }) => {
                const selected = item.cartItemId === selectedCartItemId;

                return (
                  <button
                    key={item.cartItemId}
                    type="button"
                    onClick={() => {
                      if (!disabledReason) {
                        setSelectedCartItemId(item.cartItemId);
                        setStatusMessage("");
                      }
                    }}
                    disabled={Boolean(disabledReason)}
                    className={`grid gap-3 rounded-2xl border p-3 text-left transition sm:grid-cols-[64px_1fr_auto] sm:items-center ${
                      selected
                        ? "border-[#c8b89d] bg-[#c8b89d]/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/30"
                    } ${
                      disabledReason
                        ? "cursor-not-allowed opacity-50 hover:border-white/10"
                        : ""
                    }`}
                  >
                    <span className="block overflow-hidden rounded-xl bg-white/[0.04]">
                      <span className="block aspect-square">
                        <img
                          src={item.image || "/images/akm-logo.webp"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </span>
                    </span>

                    <span>
                      <span className="block font-semibold text-white">
                        {item.name}
                      </span>
                      <span className="mt-1 block text-sm text-zinc-400">
                        {item.color} / {item.size} -{" "}
                        {t("bundle.currentQuantity", {
                          count: Number(item.quantity || 0),
                        })}
                      </span>
                      <span className="mt-1 block text-xs text-zinc-500">
                        {disabledReason || helperText}
                      </span>
                    </span>

                    {selected && (
                      <span className="inline-flex items-center justify-center text-[#c8b89d]">
                        <CheckCircle2 size={20} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
              {t("bundle.noCartCandidates")}
            </p>
          )}

          <button
            type="button"
            onClick={handleCompleteBundle}
            disabled={!selectedCandidate || Boolean(selectedCandidate.disabledReason)}
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
