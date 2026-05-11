const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Review = require("../models/Review");
const { sendOwnerNewReviewEmail } = require("../services/emailService");

const MAX_CUSTOMER_REVIEWS_PER_PRODUCT = 3;

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const cleanText = (value = "") => String(value || "").trim();

const normalizeRating = (rating) => {
  const number = Number(rating);
  if (Number.isNaN(number)) return 0;
  return Math.min(5, Math.max(1, Math.round(number)));
};

const checkCustomerBoughtProduct = async ({ customer, productId }) => {
  const order = await Order.findOne({
    $or: [
      { customerId: customer._id },
      { "customer.email": String(customer.email || "").toLowerCase() },
    ],
    "items.productId": productId,
  }).sort({ createdAt: -1 });

  return order;
};

const getProductReviews = async (req, res) => {
  const { productId } = req.params;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID.",
    });
  }

  const reviews = await Review.find({
    productId,
    status: "approved",
  })
    .sort({ createdAt: -1 })
    .select("reviewerName rating comment source createdAt");

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + Number(review.rating || 0), 0) /
        reviews.length
      : 0;

  res.json({
    success: true,
    count: reviews.length,
    averageRating: Number(averageRating.toFixed(1)),
    reviews,
  });
};

const getCustomerReviewStatus = async (req, res) => {
  const { productId } = req.params;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID.",
    });
  }

  const product = await Product.findById(productId).select("_id name isActive");

  if (!product || !product.isActive) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  const order = await checkCustomerBoughtProduct({
    customer: req.customer,
    productId,
  });

  const reviewCount = await Review.countDocuments({
    productId,
    customerId: req.customer._id,
    source: "customer",
  });

  const remainingReviews = Math.max(
    0,
    MAX_CUSTOMER_REVIEWS_PER_PRODUCT - reviewCount
  );

  res.json({
    success: true,
    canReview: Boolean(order) && remainingReviews > 0,
    hasPurchased: Boolean(order),
    reviewCount,
    remainingReviews,
    maxReviews: MAX_CUSTOMER_REVIEWS_PER_PRODUCT,
  });
};

const createCustomerReview = async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID.",
    });
  }

  const product = await Product.findById(productId).select("_id name slug isActive");

  if (!product || !product.isActive) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  const cleanComment = cleanText(comment);
  const finalRating = normalizeRating(rating);

  if (!cleanComment) {
    return res.status(400).json({
      success: false,
      message: "Review comment is required.",
    });
  }

  if (cleanComment.length < 5) {
    return res.status(400).json({
      success: false,
      message: "Review must be at least 5 characters.",
    });
  }

  const order = await checkCustomerBoughtProduct({
    customer: req.customer,
    productId,
  });

  if (!order) {
    return res.status(403).json({
      success: false,
      message: "You can only review products you ordered from this account.",
    });
  }

  const existingReviewCount = await Review.countDocuments({
    productId,
    customerId: req.customer._id,
    source: "customer",
  });

  if (existingReviewCount >= MAX_CUSTOMER_REVIEWS_PER_PRODUCT) {
    return res.status(400).json({
      success: false,
      message: `You can only submit ${MAX_CUSTOMER_REVIEWS_PER_PRODUCT} reviews per product.`,
    });
  }

  const review = await Review.create({
    productId,
    customerId: req.customer._id,
    orderId: order._id,
    reviewerName: req.customer.fullName,
    reviewerEmail: req.customer.email,
    rating: finalRating,
    comment: cleanComment,
    source: "customer",
    status: "pending",
  });

  try {
    await sendOwnerNewReviewEmail({
      review,
      product,
    });
  } catch (error) {
    console.log("New review owner email failed:", error.message);
  }

  res.status(201).json({
    success: true,
    message: "Review submitted. It will appear after admin approval.",
    review,
  });
};

const getAdminReviews = async (req, res) => {
  const { status, productId } = req.query;

  const query = {};

  if (status && ["pending", "approved", "rejected"].includes(status)) {
    query.status = status;
  }

  if (productId && isValidObjectId(productId)) {
    query.productId = productId;
  }

  const reviews = await Review.find(query)
    .populate("productId", "name slug price category colors")
    .populate("customerId", "fullName email phone")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: reviews.length,
    reviews,
  });
};

const createAdminReview = async (req, res) => {
  const { productId, reviewerName, rating, comment } = req.body;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: "Choose a valid product.",
    });
  }

  const product = await Product.findById(productId).select("_id name");

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  const cleanName = cleanText(reviewerName);
  const cleanComment = cleanText(comment);
  const finalRating = normalizeRating(rating);

  if (!cleanName || !cleanComment) {
    return res.status(400).json({
      success: false,
      message: "Reviewer name and review comment are required.",
    });
  }

  const review = await Review.create({
    productId,
    customerId: null,
    orderId: null,
    reviewerName: cleanName,
    reviewerEmail: "",
    rating: finalRating,
    comment: cleanComment,
    source: "admin",
    status: "approved",
    approvedAt: new Date(),
  });

  const populatedReview = await Review.findById(review._id)
    .populate("productId", "name slug price category colors")
    .populate("customerId", "fullName email phone");

  res.status(201).json({
    success: true,
    message: "Review added successfully.",
    review: populatedReview,
  });
};

const updateAdminReviewStatus = async (req, res) => {
  const { status, adminNote } = req.body;

  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid review status.",
    });
  }

  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found.",
    });
  }

  review.status = status;
  review.adminNote = cleanText(adminNote || review.adminNote || "");

  if (status === "approved") {
    review.approvedAt = new Date();
    review.rejectedAt = null;
  }

  if (status === "rejected") {
    review.rejectedAt = new Date();
    review.approvedAt = null;
  }

  if (status === "pending") {
    review.rejectedAt = null;
    review.approvedAt = null;
  }

  const updatedReview = await review.save();

  const populatedReview = await Review.findById(updatedReview._id)
    .populate("productId", "name slug price category colors")
    .populate("customerId", "fullName email phone");

  res.json({
    success: true,
    message: "Review status updated.",
    review: populatedReview,
  });
};

const deleteAdminReview = async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found.",
    });
  }

  await review.deleteOne();

  res.json({
    success: true,
    message: "Review deleted successfully.",
  });
};

module.exports = {
  getProductReviews,
  getCustomerReviewStatus,
  createCustomerReview,
  getAdminReviews,
  createAdminReview,
  updateAdminReviewStatus,
  deleteAdminReview,
};