const Offer = require("../models/Offer");

const isOfferCurrentlyActive = (offer) => {
  if (!offer || !offer.isActive) return false;

  const now = new Date();

  if (offer.startsAt && new Date(offer.startsAt) > now) return false;
  if (offer.endsAt && new Date(offer.endsAt) < now) return false;

  return true;
};

const calculateOfferPrice = (price, offer) => {
  const originalPrice = Number(price || 0);

  if (!offer || !isOfferCurrentlyActive(offer)) {
    return {
      originalPrice,
      finalPrice: originalPrice,
      discountAmount: 0,
      hasOffer: false,
      offer: null,
    };
  }

  let finalPrice = originalPrice;

  if (offer.discountType === "percentage") {
    finalPrice =
      originalPrice -
      (originalPrice * Number(offer.discountValue || 0)) / 100;
  }

  if (offer.discountType === "fixed") {
    finalPrice = originalPrice - Number(offer.discountValue || 0);
  }

  if (offer.discountType === "salePrice") {
    finalPrice = Number(offer.discountValue || originalPrice);
  }

  finalPrice = Math.max(0, Math.round(finalPrice));

  const discountAmount = Math.max(0, originalPrice - finalPrice);

  return {
    originalPrice,
    finalPrice,
    discountAmount,
    hasOffer: discountAmount > 0 && finalPrice < originalPrice,
    offer: {
      _id: offer._id,
      title: offer.title,
      slug: offer.slug,
      badge: offer.badge,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
    },
  };
};

const getActiveProductOffers = async () => {
  const now = new Date();

  return Offer.find({
    type: "product",
    isActive: true,
    $and: [
      {
        $or: [{ startsAt: null }, { startsAt: { $lte: now } }],
      },
      {
        $or: [{ endsAt: null }, { endsAt: { $gte: now } }],
      },
    ],
  }).sort({ sortOrder: 1, createdAt: -1 });
};

const getBestActiveOfferForProduct = async (productId, productPrice) => {
  const offers = await getActiveProductOffers();
  const productIdString = String(productId);

  const matchingOffers = offers.filter((offer) =>
    (offer.targetProducts || []).some(
      (targetProductId) => String(targetProductId) === productIdString
    )
  );

  if (matchingOffers.length === 0) return null;

  let bestOffer = null;
  let bestDiscount = 0;

  matchingOffers.forEach((offer) => {
    const pricing = calculateOfferPrice(productPrice, offer);

    if (pricing.discountAmount > bestDiscount) {
      bestDiscount = pricing.discountAmount;
      bestOffer = offer;
    }
  });

  return bestOffer;
};

const attachOfferPricingToProduct = async (product) => {
  if (!product) return product;

  const productObject =
    typeof product.toObject === "function" ? product.toObject() : product;

  const offer = await getBestActiveOfferForProduct(
    productObject._id,
    productObject.price
  );

  const pricing = calculateOfferPrice(productObject.price, offer);

  return {
    ...productObject,
    originalPrice: pricing.originalPrice,
    salePrice: pricing.finalPrice,
    activeOffer: pricing.hasOffer ? pricing.offer : null,
  };
};

const attachOfferPricingToProducts = async (products = []) => {
  return Promise.all(
    products.map((product) => attachOfferPricingToProduct(product))
  );
};

module.exports = {
  isOfferCurrentlyActive,
  calculateOfferPrice,
  getBestActiveOfferForProduct,
  attachOfferPricingToProduct,
  attachOfferPricingToProducts,
};