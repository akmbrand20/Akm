export const calculateCartSubtotal = (items = []) => {
  return items.reduce((total, item) => {
    return total + Number(item.price || 0) * Number(item.quantity || 0);
  }, 0);
};

const normalizeProductId = (value) => {
  if (!value) return "";
  return String(value._id || value);
};

const normalizeOfferId = (value) => {
  if (!value) return "";
  return String(value._id || value.id || value);
};

const getBundleRegularProductValue = (offer) => {
  const sets = Number(offer?.sets || 0);
  const bundleProductsValue = Array.isArray(offer?.bundleProducts)
    ? offer.bundleProducts.reduce((total, product) => {
        if (!product || typeof product !== "object") return total;
        return total + Number(product.price || 0);
      }, 0)
    : 0;

  if (sets > 0 && bundleProductsValue > 0) {
    return bundleProductsValue * sets;
  }

  return Number(offer?.regularPrice || 0);
};

const getBundleProductSavings = (offer) => {
  const regularProductValue = getBundleRegularProductValue(offer);
  const offerPrice = Number(offer?.offerPrice || 0);

  if (regularProductValue <= 0 || offerPrice <= 0) return 0;

  return Math.max(0, regularProductValue - offerPrice);
};

const normalizeBundleOffers = (bundleOffers = []) => {
  return bundleOffers
    .filter((offer) => offer && offer.type === "bundle" && offer.isActive)
    .map((offer) => ({
      id: normalizeOfferId(offer),
      title: offer.title || "Bundle Offer",
      sets: Number(offer.sets || 0),
      regularPrice: Number(offer.regularPrice || 0),
      offerPrice: Number(offer.offerPrice || 0),
      savings: getBundleProductSavings(offer),
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

const getOfferProductIds = (products = []) => {
  return Array.isArray(products)
    ? products.map(normalizeProductId).filter(Boolean)
    : [];
};

const isBundleOfferEligible = (items = [], offer) => {
  const bundleProducts = getOfferProductIds(offer?.bundleProducts);
  const sets = Number(offer?.sets || 0);

  return (
    sets > 0 &&
    bundleProducts.length >= 2 &&
    getCompleteSetsForBundle(items, bundleProducts) >= sets
  );
};

const getProductFreeDeliveryOffer = (items = [], offers = []) => {
  for (const offer of offers) {
    if (offer.type !== "product") continue;

    const targetProducts = getOfferProductIds(offer.targetProducts);
    const hasTargetProduct = items.some((item) =>
      targetProducts.includes(normalizeProductId(item.productId))
    );

    if (hasTargetProduct) {
      return {
        unlocked: true,
        offerTitle: offer.title || "",
      };
    }
  }

  return {
    unlocked: false,
    offerTitle: "",
  };
};

const getFreeDeliveryOffer = (
  items = [],
  offers = [],
  activeBundleOfferId = ""
) => {
  if (!items.length) {
    return {
      unlocked: false,
      offerTitle: "",
    };
  }

  const activeOfferId = normalizeOfferId(activeBundleOfferId);
  const activeFreeDeliveryOffers = offers.filter(
    (offer) =>
      offer &&
      offer.isActive !== false &&
      offer.freeDelivery &&
      ["bundle", "product"].includes(offer.type)
  );

  if (activeOfferId) {
    const selectedBundleOffer = offers.find(
      (offer) =>
        offer?.type === "bundle" && normalizeOfferId(offer) === activeOfferId
    );

    if (selectedBundleOffer && isBundleOfferEligible(items, selectedBundleOffer)) {
      if (selectedBundleOffer.freeDelivery) {
        return {
          unlocked: true,
          offerTitle: selectedBundleOffer.title || "",
        };
      }

      return getProductFreeDeliveryOffer(items, activeFreeDeliveryOffers);
    }
  }

  for (const offer of activeFreeDeliveryOffers) {
    if (offer.type === "bundle") {
      if (isBundleOfferEligible(items, offer)) {
        return {
          unlocked: true,
          offerTitle: offer.title || "",
        };
      }
    }

    if (offer.type === "product") {
      const productFreeDeliveryOffer = getProductFreeDeliveryOffer(
        items,
        activeFreeDeliveryOffers
      );

      if (productFreeDeliveryOffer.unlocked) {
        return productFreeDeliveryOffer;
      }
    }
  }

  return {
    unlocked: false,
    offerTitle: "",
  };
};

const buildBundleDiscountResult = (offer, completeSets) => {
  const timesApplied = Math.floor(completeSets / offer.sets);
  const discount = offer.savings * timesApplied;

  return {
    appliedOfferId: offer.id,
    appliedOffer: offer.title,
    completeSets,
    discount,
    offerSets: offer.sets,
    message: `${offer.title} applied: ${timesApplied} bundle${
      timesApplied > 1 ? "s" : ""
    }.`,
  };
};

const chooseBetterBundleResult = (currentBest, candidate) => {
  if (candidate.discount > currentBest.discount) return candidate;
  if (candidate.discount < currentBest.discount) return currentBest;
  if (candidate.offerSets > Number(currentBest.offerSets || 0)) return candidate;
  return currentBest;
};

export const calculateBundleDiscount = (
  items = [],
  bundleOffers = [],
  activeBundleOfferId = ""
) => {
  const activeBundleOffers = normalizeBundleOffers(bundleOffers);
  const selectedOfferId = normalizeOfferId(activeBundleOfferId);

  let bestResult = {
    appliedOfferId: "",
    appliedOffer: null,
    completeSets: 0,
    discount: 0,
    offerSets: 0,
    message: "",
  };
  const eligibleResults = [];

  activeBundleOffers.forEach((offer) => {
    const completeSets = getCompleteSetsForBundle(items, offer.bundleProducts);

    if (completeSets < offer.sets) return;

    const result = buildBundleDiscountResult(offer, completeSets);
    eligibleResults.push(result);

    if (selectedOfferId && result.appliedOfferId === selectedOfferId) {
      bestResult = result;
    }
  });

  if (selectedOfferId && bestResult.appliedOfferId === selectedOfferId) {
    return bestResult;
  }

  return eligibleResults.reduce(chooseBetterBundleResult, bestResult);
};

export const calculateCartTotals = (
  items = [],
  deliveryFee = 80,
  freeShippingThreshold = null,
  couponDiscount = 0,
  couponCode = "",
  bundleOffers = [],
  activeBundleOfferId = ""
) => {
  const subtotal = calculateCartSubtotal(items);
  const bundle = calculateBundleDiscount(
    items,
    bundleOffers,
    activeBundleOfferId
  );

  const afterBundle = Math.max(0, subtotal - bundle.discount);
  const safeCouponDiscount = Math.min(Number(couponDiscount || 0), afterBundle);
  const afterAllDiscounts = Math.max(0, afterBundle - safeCouponDiscount);
  const freeDeliveryOffer = getFreeDeliveryOffer(
    items,
    bundleOffers,
    bundle.appliedOfferId
  );

  const hasItems = items.length > 0;
  const thresholdFreeShippingUnlocked =
    hasItems &&
    freeShippingThreshold !== null &&
    Number(freeShippingThreshold) > 0 &&
    afterAllDiscounts >= Number(freeShippingThreshold);
  const freeShippingUnlocked =
    thresholdFreeShippingUnlocked || freeDeliveryOffer.unlocked;

  const shippingFee =
    hasItems && !freeShippingUnlocked ? Number(deliveryFee) : 0;

  const total = afterAllDiscounts + shippingFee;

  return {
    subtotal,
    shippingFee,
    discount: bundle.discount + safeCouponDiscount,
    bundleDiscount: bundle.discount,
    couponDiscount: safeCouponDiscount,
    couponCode,
    appliedOfferId: bundle.appliedOfferId,
    appliedOffer: bundle.appliedOffer,
    completeSets: bundle.completeSets,
    bundleMessage: bundle.message,
    freeShippingUnlocked,
    freeDeliveryByOffer: freeDeliveryOffer.unlocked,
    freeDeliveryOffer: freeDeliveryOffer.offerTitle,
    freeShippingThreshold,
    total,
    subtotalAfterBundle: afterBundle,
  };
};
