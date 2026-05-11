const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
      index: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },

    reviewerEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    source: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    adminNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ customerId: 1, productId: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);