const SiteSettings = require("../models/SiteSettings");

const getPublicSettings = async (req, res) => {
  let settings = await SiteSettings.findOne();

  if (!settings) {
    settings = await SiteSettings.create({});
  }

  res.json({
    success: true,
    settings,
  });
};

const getAdminSettings = async (req, res) => {
  let settings = await SiteSettings.findOne();

  if (!settings) {
    settings = await SiteSettings.create({});
  }

  res.json({
    success: true,
    settings,
  });
};

const updateSettings = async (req, res) => {
  let settings = await SiteSettings.findOne();

  if (!settings) {
    settings = await SiteSettings.create({});
  }

  const {
    brandName,
    tagline,
    announcement,
    deliveryFee,
    freeShippingThreshold,
    whatsappNumber,
    phone,
    instapayNumber,
    vodafoneCashNumber,
    instagramUrl,
    tiktokUrl,
    facebookUrl,
    instapayQr,
    tracking,
    policies,
  } = req.body;

  if (brandName !== undefined) settings.brandName = brandName;
  if (tagline !== undefined) settings.tagline = tagline;

  if (announcement !== undefined) {
    settings.announcement = {
      enabled:
        announcement.enabled !== undefined ? Boolean(announcement.enabled) : true,
      text: announcement.text || "",
    };
  }

  if (deliveryFee !== undefined) {
    settings.deliveryFee = Number(deliveryFee);
  }

  if (freeShippingThreshold !== undefined) {
    settings.freeShippingThreshold =
      freeShippingThreshold === "" || freeShippingThreshold === null
        ? null
        : Number(freeShippingThreshold);
  }

  if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
  if (phone !== undefined) settings.phone = phone;
  if (instapayNumber !== undefined) settings.instapayNumber = instapayNumber;
  if (vodafoneCashNumber !== undefined) {
    settings.vodafoneCashNumber = vodafoneCashNumber;
  }

  if (instagramUrl !== undefined) settings.instagramUrl = instagramUrl;
  if (tiktokUrl !== undefined) settings.tiktokUrl = tiktokUrl;
  if (facebookUrl !== undefined) settings.facebookUrl = facebookUrl;

  if (instapayQr !== undefined) {
    settings.instapayQr = {
      url: instapayQr.url || "",
      publicId: instapayQr.publicId || "",
    };
  }

  if (tracking !== undefined) {
    settings.tracking = {
      metaPixelId: tracking.metaPixelId || "",
      ga4MeasurementId: tracking.ga4MeasurementId || "",
      gtmId: tracking.gtmId || "",
      tiktokPixelId: tracking.tiktokPixelId || "",
      snapPixelId: tracking.snapPixelId || "",
    };
  }

  if (policies !== undefined) {
    settings.policies = {
      shippingPolicy: policies.shippingPolicy || "",
      returnPolicy: policies.returnPolicy || "",
      privacyPolicy: policies.privacyPolicy || "",
      terms: policies.terms || "",
    };
  }

  const updatedSettings = await settings.save();

  res.json({
    success: true,
    message: "Settings updated successfully.",
    settings: updatedSettings,
  });
};

module.exports = {
  getPublicSettings,
  getAdminSettings,
  updateSettings,
};
