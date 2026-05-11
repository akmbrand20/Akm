const mongoose = require("mongoose");

const emailCampaignSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["offer", "coupon", "announcement"],
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    couponCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    ctaText: {
      type: String,
      default: "Shop Now",
      trim: true,
    },

    ctaUrl: {
      type: String,
      default: "",
      trim: true,
    },

    audience: {
      type: String,
      enum: ["marketing_customers", "all_customers"],
      default: "marketing_customers",
    },

    status: {
      type: String,
      enum: ["draft", "sending", "sent", "failed"],
      default: "draft",
    },

    sentCount: {
      type: Number,
      default: 0,
    },

    failedCount: {
      type: Number,
      default: 0,
    },

    errorMessages: {
      type: [String],
      default: [],
    },

    sentAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailCampaign", emailCampaignSchema);