const Offer = require("../models/Offer");

const getActiveOfferQuery = (typeFilter) => {
  const now = new Date();

  return {
    type: typeFilter,
    isActive: true,
    $and: [
      {
        $or: [{ startsAt: null }, { startsAt: { $lte: now } }],
      },
      {
        $or: [{ endsAt: null }, { endsAt: { $gte: now } }],
      },
    ],
  };
};

const populateCheckoutOfferProducts = (query) => {
  return query
    .populate("targetProducts", "_id")
    .populate("bundleProducts", "price");
};

const getActiveBundleOffers = async () => {
  return populateCheckoutOfferProducts(
    Offer.find(getActiveOfferQuery("bundle")).sort({
      sets: -1,
      savings: -1,
      sortOrder: 1,
    })
  );
};

const getActiveCheckoutOffers = async () => {
  return populateCheckoutOfferProducts(
    Offer.find(getActiveOfferQuery({ $in: ["bundle", "product"] })).sort({
      sets: -1,
      savings: -1,
      sortOrder: 1,
      createdAt: -1,
    })
  );
};

module.exports = {
  getActiveBundleOffers,
  getActiveCheckoutOffers,
};
