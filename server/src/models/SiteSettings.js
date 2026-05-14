const mongoose = require("mongoose");
const { DELIVERY_FEE } = require("../utils/constants");

const siteSettingsSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      default: "AKM",
    },

    tagline: {
      type: String,
      default: "Comfort you can feel",
    },

    announcement: {
      enabled: {
        type: Boolean,
        default: true,
      },
      text: {
        type: String,
        default: "Wear comfort. Move different.",
        trim: true,
      },
    },

    deliveryFee: {
      type: Number,
      default: DELIVERY_FEE,
    },

    freeShippingThreshold: {
      type: Number,
      default: null,
    },

    whatsappNumber: {
      type: String,
      default: "+201014318607",
    },

    phone: {
      type: String,
      default: "+201014318607",
    },

    instapayNumber: {
      type: String,
      default: "01014318607",
      trim: true,
    },

    vodafoneCashNumber: {
      type: String,
      default: "+201014318607",
      trim: true,
    },

    instagramUrl: {
      type: String,
      default: "https://www.instagram.com/akmbrand74",
    },

    tiktokUrl: {
      type: String,
      default: "https://www.tiktok.com/@akmbrand74",
    },

    facebookUrl: {
      type: String,
      default: "",
    },

    // Kept for old data compatibility.
    // Checkout will use this if it exists, otherwise it falls back to /images/instapay-qr.webp
    instapayQr: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

    tracking: {
      metaPixelId: {
        type: String,
        default: "",
      },
      ga4MeasurementId: {
        type: String,
        default: "",
      },
      gtmId: {
        type: String,
        default: "",
      },
      tiktokPixelId: {
        type: String,
        default: "",
      },
      snapPixelId: {
        type: String,
        default: "",
      },
    },

    policies: {
      shippingPolicy: {
        type: String,
        default:
          "Delivery is available across selected areas in Egypt. Estimated delivery time will be confirmed after order placement.",
      },
      returnPolicy: {
        type: String,
        default: "Exchange and return policy details will be updated soon.",
      },
      privacyPolicy: {
        type: String,
        default:
          "This website may use analytics and advertising tracking tools to improve customer experience and marketing performance.",
      },
      terms: {
        type: String,
        default: "Terms and conditions will be updated soon.",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
