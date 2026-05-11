const Customer = require("../models/Customer");
const Offer = require("../models/Offer");
const Product = require("../models/Product");
const { sendMarketingEmail } = require("../services/emailService");

const cleanText = (value = "") => String(value || "").trim();

const createSlug = (value = "") => {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const isOfferVisibleNow = (offer) => {
  if (!offer.isActive) return false;

  const now = new Date();

  if (offer.startsAt && new Date(offer.startsAt) > now) return false;
  if (offer.endsAt && new Date(offer.endsAt) < now) return false;

  return true;
};

const populateOfferProducts = (query) => {
  return query
    .populate("targetProducts", "name slug price colors category isActive")
    .populate("bundleProducts", "name slug price colors category isActive");
};

const getOffers = async (req, res) => {
  const offers = await populateOfferProducts(
    Offer.find({ isActive: true })
  ).sort({ sortOrder: 1, createdAt: -1 });

  const visibleOffers = offers.filter(isOfferVisibleNow);

  res.json({
    success: true,
    count: visibleOffers.length,
    offers: visibleOffers,
  });
};

const getAdminOffers = async (req, res) => {
  const offers = await populateOfferProducts(Offer.find()).sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    count: offers.length,
    offers,
  });
};

const getAdminOfferById = async (req, res) => {
  const offer = await populateOfferProducts(Offer.findById(req.params.id));

  if (!offer) {
    return res.status(404).json({
      success: false,
      message: "Offer not found.",
    });
  }

  res.json({
    success: true,
    offer,
  });
};

const sendOfferNotificationEmails = async ({ offer, audience }) => {
  offer.emailSendingStatus = "sending";
  offer.emailError = "";
  offer.notifiedEmailsCount = 0;
  await offer.save();

  const customerQuery = {
    isActive: true,
  };

  if (audience === "marketing_customers") {
    customerQuery.acceptsMarketing = true;
  }

  const customers = await Customer.find(customerQuery).select("fullName email");

  let sentCount = 0;
  const errors = [];

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const shopUrl = `${clientUrl.replace(/\/$/, "")}/shop`;

  for (const customer of customers) {
    if (!customer.email) continue;

    try {
      const result = await sendMarketingEmail({
        to: customer.email,
        subject: `${offer.title} | AKM`,
        title: offer.title,
        message:
          offer.description ||
          "A new AKM offer is now live. Check it before it ends.",
        couponCode: "",
        ctaText: "Shop the Offer",
        ctaUrl: shopUrl,
      });

      if (result.sent) {
        sentCount += 1;
      } else {
        errors.push(`${customer.email}: ${result.reason || "Email failed"}`);
      }
    } catch (error) {
      errors.push(`${customer.email}: ${error.message}`);
    }
  }

  offer.notifiedEmailsCount = sentCount;
  offer.emailSendingStatus =
    errors.length > 0 && sentCount === 0 ? "failed" : "completed";
  offer.emailError = errors.slice(0, 3).join(" | ");
  await offer.save();
};

const validateProductOffer = async ({
  targetProducts,
  discountType,
  discountValue,
}) => {
  if (!Array.isArray(targetProducts) || targetProducts.length === 0) {
    return "Choose at least one product for this offer.";
  }

  if (!["percentage", "fixed", "salePrice"].includes(discountType)) {
    return "Invalid discount type.";
  }

  if (Number(discountValue) <= 0) {
    return "Discount value must be greater than 0.";
  }

  const uniqueProductIds = [...new Set(targetProducts.map(String))];

  const productCount = await Product.countDocuments({
    _id: { $in: uniqueProductIds },
  });

  if (productCount !== uniqueProductIds.length) {
    return "One or more selected products were not found.";
  }

  return "";
};

const validateBundleOffer = async ({
  sets,
  regularPrice,
  offerPrice,
  savings,
  bundleProducts,
}) => {
  if (!Array.isArray(bundleProducts) || bundleProducts.length !== 2) {
    return "Choose exactly two products for this bundle.";
  }

  const uniqueProductIds = [...new Set(bundleProducts.map(String))];

  if (uniqueProductIds.length !== 2) {
    return "Bundle products must be two different products.";
  }

  const productCount = await Product.countDocuments({
    _id: { $in: uniqueProductIds },
  });

  if (productCount !== 2) {
    return "One or more selected bundle products were not found.";
  }

  if (Number(sets) <= 0) {
    return "Number of sets must be greater than 0.";
  }

  if (Number(regularPrice) <= 0) {
    return "Regular price must be greater than 0.";
  }

  if (Number(offerPrice) <= 0) {
    return "Offer price must be greater than 0.";
  }

  if (Number(offerPrice) >= Number(regularPrice)) {
    return "Offer price must be lower than regular price.";
  }

  if (Number(savings) <= 0) {
    return "Savings must be greater than 0.";
  }

  return "";
};

const createAdminOffer = async (req, res) => {
  const {
    title,
    slug,
    description,
    type,
    targetProducts,
    bundleProducts,
    discountType,
    discountValue,
    badge,
    startsAt,
    endsAt,
    isActive,
    sortOrder,
    notifyCustomers,
    audience,
    sets,
    regularPrice,
    offerPrice,
    savings,
  } = req.body;

  const finalType = type || "product";
  const cleanTitle = cleanText(title);
  const finalSlug = createSlug(slug || title);

  if (!cleanTitle || !finalSlug) {
    return res.status(400).json({
      success: false,
      message: "Offer title and slug are required.",
    });
  }

  if (!["product", "bundle"].includes(finalType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid offer type.",
    });
  }

  const existingOffer = await Offer.findOne({ slug: finalSlug });

  if (existingOffer) {
    return res.status(400).json({
      success: false,
      message: "An offer with this slug already exists.",
    });
  }

  if (finalType === "product") {
    const productValidationError = await validateProductOffer({
      targetProducts,
      discountType,
      discountValue,
    });

    if (productValidationError) {
      return res.status(400).json({
        success: false,
        message: productValidationError,
      });
    }
  }

  if (finalType === "bundle") {
    const bundleValidationError = await validateBundleOffer({
      sets,
      regularPrice,
      offerPrice,
      savings,
      bundleProducts,
    });

    if (bundleValidationError) {
      return res.status(400).json({
        success: false,
        message: bundleValidationError,
      });
    }
  }

  const offer = await Offer.create({
    title: cleanTitle,
    slug: finalSlug,
    description: cleanText(description || ""),
    type: finalType,

    targetProducts: finalType === "product" ? targetProducts : [],
    bundleProducts: finalType === "bundle" ? bundleProducts : [],

    discountType: finalType === "product" ? discountType : "percentage",
    discountValue: finalType === "product" ? Number(discountValue) : 0,

    badge: cleanText(badge || ""),
    startsAt: startsAt || null,
    endsAt: endsAt || null,
    isActive: isActive !== undefined ? isActive : true,
    sortOrder: Number(sortOrder || 0),

    sets: finalType === "bundle" ? Number(sets) : 0,
    regularPrice: finalType === "bundle" ? Number(regularPrice) : 0,
    offerPrice: finalType === "bundle" ? Number(offerPrice) : 0,
    savings: finalType === "bundle" ? Number(savings) : 0,

    createdBy: req.admin?._id || null,
    emailSendingStatus: notifyCustomers ? "pending" : "not_requested",
  });

  if (notifyCustomers) {
    sendOfferNotificationEmails({
      offer,
      audience: audience || "marketing_customers",
    }).catch((error) => {
      console.log("Offer notification sending failed:", error.message);
    });
  }

  const populatedOffer = await populateOfferProducts(
    Offer.findById(offer._id)
  );

  res.status(201).json({
    success: true,
    message: notifyCustomers
      ? "Offer created. Customer emails are being sent."
      : "Offer created successfully.",
    offer: populatedOffer,
  });
};

const updateAdminOffer = async (req, res) => {
  const offer = await Offer.findById(req.params.id);

  if (!offer) {
    return res.status(404).json({
      success: false,
      message: "Offer not found.",
    });
  }

  const {
    title,
    slug,
    description,
    targetProducts,
    bundleProducts,
    discountType,
    discountValue,
    badge,
    startsAt,
    endsAt,
    isActive,
    sortOrder,
    sets,
    regularPrice,
    offerPrice,
    savings,
  } = req.body;

  if (title !== undefined) {
    const cleanTitle = cleanText(title);

    if (!cleanTitle) {
      return res.status(400).json({
        success: false,
        message: "Offer title cannot be empty.",
      });
    }

    offer.title = cleanTitle;
  }

  if (description !== undefined) {
    offer.description = cleanText(description);
  }

  if (slug !== undefined) {
    const finalSlug = createSlug(slug);

    if (!finalSlug) {
      return res.status(400).json({
        success: false,
        message: "Offer slug cannot be empty.",
      });
    }

    const existingOffer = await Offer.findOne({
      slug: finalSlug,
      _id: { $ne: offer._id },
    });

    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: "An offer with this slug already exists.",
      });
    }

    offer.slug = finalSlug;
  }

  if (offer.type === "product") {
    const nextTargetProducts =
      targetProducts !== undefined ? targetProducts : offer.targetProducts;
    const nextDiscountType =
      discountType !== undefined ? discountType : offer.discountType;
    const nextDiscountValue =
      discountValue !== undefined ? Number(discountValue) : offer.discountValue;

    const productValidationError = await validateProductOffer({
      targetProducts: nextTargetProducts,
      discountType: nextDiscountType,
      discountValue: nextDiscountValue,
    });

    if (productValidationError) {
      return res.status(400).json({
        success: false,
        message: productValidationError,
      });
    }

    offer.targetProducts = nextTargetProducts;
    offer.discountType = nextDiscountType;
    offer.discountValue = nextDiscountValue;
    offer.bundleProducts = [];
  }

  if (offer.type === "bundle") {
    const nextSets = sets !== undefined ? Number(sets) : offer.sets;
    const nextRegularPrice =
      regularPrice !== undefined ? Number(regularPrice) : offer.regularPrice;
    const nextOfferPrice =
      offerPrice !== undefined ? Number(offerPrice) : offer.offerPrice;
    const nextSavings =
      savings !== undefined ? Number(savings) : offer.savings;
    const nextBundleProducts =
      bundleProducts !== undefined ? bundleProducts : offer.bundleProducts;

    const bundleValidationError = await validateBundleOffer({
      sets: nextSets,
      regularPrice: nextRegularPrice,
      offerPrice: nextOfferPrice,
      savings: nextSavings,
      bundleProducts: nextBundleProducts,
    });

    if (bundleValidationError) {
      return res.status(400).json({
        success: false,
        message: bundleValidationError,
      });
    }

    offer.sets = nextSets;
    offer.regularPrice = nextRegularPrice;
    offer.offerPrice = nextOfferPrice;
    offer.savings = nextSavings;
    offer.bundleProducts = nextBundleProducts;
    offer.targetProducts = [];
    offer.discountType = "percentage";
    offer.discountValue = 0;
  }

  if (badge !== undefined) offer.badge = cleanText(badge);
  if (startsAt !== undefined) offer.startsAt = startsAt || null;
  if (endsAt !== undefined) offer.endsAt = endsAt || null;
  if (isActive !== undefined) offer.isActive = isActive;
  if (sortOrder !== undefined) offer.sortOrder = Number(sortOrder || 0);

  const updatedOffer = await offer.save();

  const populatedOffer = await populateOfferProducts(
    Offer.findById(updatedOffer._id)
  );

  res.json({
    success: true,
    message: "Offer updated successfully.",
    offer: populatedOffer,
  });
};

const deleteAdminOffer = async (req, res) => {
  const offer = await Offer.findById(req.params.id);

  if (!offer) {
    return res.status(404).json({
      success: false,
      message: "Offer not found.",
    });
  }

  await offer.deleteOne();

  res.json({
    success: true,
    message: "Offer deleted successfully.",
  });
};

const sendAdminOfferNotification = async (req, res) => {
  const { audience } = req.body;

  const offer = await Offer.findById(req.params.id);

  if (!offer) {
    return res.status(404).json({
      success: false,
      message: "Offer not found.",
    });
  }

  sendOfferNotificationEmails({
    offer,
    audience: audience || "marketing_customers",
  }).catch((error) => {
    console.log("Offer notification sending failed:", error.message);
  });

  res.json({
    success: true,
    message: "Offer notification emails started.",
  });
};

module.exports = {
  getOffers,
  getAdminOffers,
  getAdminOfferById,
  createAdminOffer,
  updateAdminOffer,
  deleteAdminOffer,
  sendAdminOfferNotification,
};