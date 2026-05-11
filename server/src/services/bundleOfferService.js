const Offer = require("../models/Offer");

const getActiveBundleOffers = async () => {
  const now = new Date();

  return Offer.find({
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
};

module.exports = {
  getActiveBundleOffers,
};