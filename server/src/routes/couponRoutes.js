const express = require("express");
const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCouponCode,
} = require("../controllers/couponController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/validate", validateCouponCode);

router.get("/", protectAdmin, getCoupons);
router.post("/", protectAdmin, createCoupon);
router.put("/:id", protectAdmin, updateCoupon);
router.delete("/:id", protectAdmin, deleteCoupon);

module.exports = router;