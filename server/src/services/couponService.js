const Coupon = require("../models/Coupon");

const validateCoupon = async ({ code, subtotalAfterBundle }) => {
  if (!code) {
    return {
      valid: false,
      coupon: null,
      discount: 0,
      message: "Coupon code is required.",
    };
  }

  const normalizedCode = String(code).trim().toUpperCase();

  const coupon = await Coupon.findOne({ code: normalizedCode });

  if (!coupon) {
    return {
      valid: false,
      coupon: null,
      discount: 0,
      message: "Invalid coupon code.",
    };
  }

  if (!coupon.isActive) {
    return {
      valid: false,
      coupon: null,
      discount: 0,
      message: "This coupon is not active.",
    };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return {
      valid: false,
      coupon: null,
      discount: 0,
      message: "This coupon has expired.",
    };
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return {
      valid: false,
      coupon: null,
      discount: 0,
      message: "This coupon has reached its usage limit.",
    };
  }

  if (Number(subtotalAfterBundle) < Number(coupon.minOrderAmount || 0)) {
    return {
      valid: false,
      coupon: null,
      discount: 0,
      message: `Minimum order amount is ${coupon.minOrderAmount} EGP.`,
    };
  }

  let discount = 0;

  if (coupon.type === "percentage") {
    discount = (Number(subtotalAfterBundle) * Number(coupon.value)) / 100;
  }

  if (coupon.type === "fixed") {
    discount = Number(coupon.value);
  }

  discount = Math.min(discount, Number(subtotalAfterBundle));
  discount = Math.round(discount);

  return {
    valid: true,
    coupon,
    discount,
    message: "Coupon applied successfully.",
  };
};

module.exports = {
  validateCoupon,
};