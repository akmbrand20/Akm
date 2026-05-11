const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["bundle", "product", "discount", "custom"],
      default: "product",
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Old bundle fields, kept so your existing Duo/Signature bundle cards do not break.
    sets: {
      type: Number,
      default: 0,
    },

    regularPrice: {
      type: Number,
      default: 0,
    },

    offerPrice: {
      type: Number,
      default: 0,
    },

    savings: {
      type: Number,
      default: 0,
    },

    // Product-offer fields.
    targetProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // Bundle-offer fields.
// These are the exact products required to complete one bundle set.
bundleProducts: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
],

    discountType: {
      type: String,
      enum: ["percentage", "fixed", "salePrice"],
      default: "percentage",
    },

    discountValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    badge: {
      type: String,
      default: "",
      trim: true,
    },

    startsAt: {
      type: Date,
      default: null,
    },

    endsAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    emailSendingStatus: {
      type: String,
      enum: ["not_requested", "pending", "sending", "completed", "failed"],
      default: "not_requested",
    },

    notifiedEmailsCount: {
      type: Number,
      default: 0,
    },

    emailError: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);