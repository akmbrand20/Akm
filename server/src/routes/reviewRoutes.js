const express = require("express");
const {
  getProductReviews,
  getCustomerReviewStatus,
  createCustomerReview,
  getAdminReviews,
  createAdminReview,
  updateAdminReviewStatus,
  deleteAdminReview,
} = require("../controllers/reviewController");
const { protectAdmin, protectCustomer } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/product/:productId", getProductReviews);

router.get("/customer/status/:productId", protectCustomer, getCustomerReviewStatus);
router.post("/customer/:productId", protectCustomer, createCustomerReview);

router.get("/admin", protectAdmin, getAdminReviews);
router.post("/admin", protectAdmin, createAdminReview);
router.patch("/admin/:id/status", protectAdmin, updateAdminReviewStatus);
router.delete("/admin/:id", protectAdmin, deleteAdminReview);

module.exports = router;