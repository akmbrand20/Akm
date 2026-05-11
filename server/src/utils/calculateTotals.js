const calculateSubtotal = (items = []) => {
  return items.reduce((total, item) => {
    return total + Number(item.price || 0) * Number(item.quantity || 0);
  }, 0);
};

const normalizeProductId = (value) => {
  if (!value) return "";
  return String(value._id || value);
};

const normalizeBundleOffers = (bundleOffers = []) => {
  return bundleOffers
    .filter((offer) => offer && offer.type === "bundle" && offer.isActive)
    .map((offer) => ({
      title: offer.title || "Bundle Offer",
      sets: Number(offer.sets || 0),
      regularPrice: Number(offer.regularPrice || 0),
      offerPrice: Number(offer.offerPrice || 0),
      savings: Number(
        offer.savings ||
          Math.max(
            0,
            Number(offer.regularPrice || 0) - Number(offer.offerPrice || 0)
          )
      ),
      badge: offer.badge || "",
      bundleProducts: Array.isArray(offer.bundleProducts)
        ? offer.bundleProducts.map(normalizeProductId).filter(Boolean)
        : [],
    }))
    .filter(
      (offer) =>
        offer.sets > 0 &&
        offer.savings > 0 &&
        offer.bundleProducts.length >= 2
    )
    .sort((a, b) => {
      if (b.sets !== a.sets) return b.sets - a.sets;
      return b.savings - a.savings;
    });
};

const getItemQuantityByProductId = (items = [], productId) => {
  const targetId = normalizeProductId(productId);

  return items
    .filter((item) => normalizeProductId(item.productId) === targetId)
    .reduce((total, item) => total + Number(item.quantity || 0), 0);
};

const getCompleteSetsForBundle = (items = [], bundleProducts = []) => {
  if (!Array.isArray(bundleProducts) || bundleProducts.length === 0) {
    return 0;
  }

  const quantities = bundleProducts.map((productId) =>
    getItemQuantityByProductId(items, productId)
  );

  return Math.min(...quantities);
};

const calculateBundleDiscount = (items = [], bundleOffers = []) => {
  const activeBundleOffers = normalizeBundleOffers(bundleOffers);

  let bestResult = {
    appliedOffer: null,
    completeSets: 0,
    discount: 0,
    message: "",
  };

  activeBundleOffers.forEach((offer) => {
    const completeSets = getCompleteSetsForBundle(items, offer.bundleProducts);

    if (completeSets < offer.sets) return;

    const timesApplied = Math.floor(completeSets / offer.sets);
    const discount = offer.savings * timesApplied;

    if (discount > bestResult.discount) {
      bestResult = {
        appliedOffer: offer.title,
        completeSets,
        discount,
        message: `${offer.title} applied: ${timesApplied} bundle${
          timesApplied > 1 ? "s" : ""
        }.`,
      };
    }
  });

  return bestResult;
};

const calculateTotals = (
  items = [],
  deliveryFee = 80,
  freeShippingThreshold = null,
  couponDiscount = 0,
  bundleOffers = []
) => {
  const subtotal = calculateSubtotal(items);
  const bundle = calculateBundleDiscount(items, bundleOffers);

  const afterBundle = Math.max(0, subtotal - bundle.discount);
  const safeCouponDiscount = Math.min(Number(couponDiscount || 0), afterBundle);
  const afterAllDiscounts = Math.max(0, afterBundle - safeCouponDiscount);

  const hasItems = items.length > 0;
  const freeShippingUnlocked =
    hasItems &&
    freeShippingThreshold !== null &&
    Number(freeShippingThreshold) > 0 &&
    afterAllDiscounts >= Number(freeShippingThreshold);

  const shippingFee =
    hasItems && !freeShippingUnlocked ? Number(deliveryFee) : 0;

  const total = afterAllDiscounts + shippingFee;

  return {
    subtotal,
    shippingFee,
    discount: bundle.discount + safeCouponDiscount,
    bundleDiscount: bundle.discount,
    couponDiscount: safeCouponDiscount,
    appliedOffer: bundle.appliedOffer,
    completeSets: bundle.completeSets,
    bundleMessage: bundle.message,
    freeShippingUnlocked,
    freeShippingThreshold,
    total,
    subtotalAfterBundle: afterBundle,
  };
};

module.exports = {
  calculateSubtotal,
  calculateBundleDiscount,
  calculateTotals,
};