const Coupon = require("../models/Coupon");
const { validateCoupon } = require("../services/couponService");

const getCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    count: coupons.length,
    coupons,
  });
};

const createCoupon = async (req, res) => {
  const {
    code,
    type,
    value,
    minOrderAmount,
    maxUses,
    expiresAt,
    isActive,
  } = req.body;

  if (!code || !type || value === undefined) {
    return res.status(400).json({
      success: false,
      message: "Code, type, and value are required.",
    });
  }

  const coupon = await Coupon.create({
    code: String(code).trim().toUpperCase(),
    type,
    value: Number(value),
    minOrderAmount: Number(minOrderAmount || 0),
    maxUses: maxUses === "" || maxUses === null ? null : Number(maxUses),
    expiresAt: expiresAt || null,
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json({
    success: true,
    message: "Coupon created successfully.",
    coupon,
  });
};

const updateCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: "Coupon not found.",
    });
  }

  const {
    code,
    type,
    value,
    minOrderAmount,
    maxUses,
    expiresAt,
    isActive,
  } = req.body;

  if (code !== undefined) coupon.code = String(code).trim().toUpperCase();
  if (type !== undefined) coupon.type = type;
  if (value !== undefined) coupon.value = Number(value);
  if (minOrderAmount !== undefined) {
    coupon.minOrderAmount = Number(minOrderAmount || 0);
  }
  if (maxUses !== undefined) {
    coupon.maxUses = maxUses === "" || maxUses === null ? null : Number(maxUses);
  }
  if (expiresAt !== undefined) {
    coupon.expiresAt = expiresAt || null;
  }
  if (isActive !== undefined) {
    coupon.isActive = isActive;
  }

  const updatedCoupon = await coupon.save();

  res.json({
    success: true,
    message: "Coupon updated successfully.",
    coupon: updatedCoupon,
  });
};

const deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: "Coupon not found.",
    });
  }

  await coupon.deleteOne();

  res.json({
    success: true,
    message: "Coupon deleted successfully.",
  });
};

const validateCouponCode = async (req, res) => {
  const { code, subtotalAfterBundle } = req.body;

  const result = await validateCoupon({
    code,
    subtotalAfterBundle: Number(subtotalAfterBundle || 0),
  });

  if (!result.valid) {
    return res.status(400).json({
      success: false,
      message: result.message,
    });
  }

  res.json({
    success: true,
    message: result.message,
    coupon: {
      code: result.coupon.code,
      type: result.coupon.type,
      value: result.coupon.value,
    },
    discount: result.discount,
  });
};

module.exports = {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCouponCode,
};