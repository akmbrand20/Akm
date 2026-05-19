const Offer = require("../models/Offer");
const Product = require("../models/Product");

const normalizeProductId = (value) => {
  if (!value) return "";
  return String(value._id || value);
};

const getDefaultBundleProducts = async () => {
  const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
  const tshirt = products.find((product) =>
    String(product.category || "").includes("tshirt")
  );
  const pants = products.find((product) =>
    String(product.category || "").includes("pants")
  );

  if (tshirt && pants && normalizeProductId(tshirt) !== normalizeProductId(pants)) {
    return [tshirt, pants];
  }

  return products.slice(0, 2);
};

const hydrateLegacyBundleOffers = async (offers = []) => {
  const needsFallback = offers.some(
    (offer) => !Array.isArray(offer.bundleProducts) || offer.bundleProducts.length < 2
  );

  if (!needsFallback) return offers;

  const defaultBundleProducts = await getDefaultBundleProducts();

  if (defaultBundleProducts.length < 2) return offers;

  return offers.map((offer) => {
    if (Array.isArray(offer.bundleProducts) && offer.bundleProducts.length >= 2) {
      return offer;
    }

    const plainOffer = offer.toObject ? offer.toObject() : offer;

    return {
      ...plainOffer,
      bundleProducts: defaultBundleProducts,
    };
  });
};

const getActiveBundleOffers = async () => {
  const now = new Date();

  const offers = await Offer.find({
    type: "bundle",
    isActive: true,
    $and: [
      {
        $or: [{ startsAt: null }, { startsAt: { $lte: now } }],
      },
      {
        $or: [{ endsAt: null }, { endsAt: { $gte: now } }],
      },
    ],
  }).sort({ sets: -1, savings: -1, sortOrder: 1 });

  return hydrateLegacyBundleOffers(offers);
};

module.exports = {
  getActiveBundleOffers,
};
