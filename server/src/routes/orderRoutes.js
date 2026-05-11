const express = require("express");
const {
  createOrder,
  getOrderByNumber,
  getMyOrders,
  getMyOrderById,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getAdminStats,
} = require("../controllers/orderController");
const { protectAdmin } = require("../middleware/authMiddleware");
const {
  protectCustomer,
  optionalCustomer,
} = require("../middleware/customerAuthMiddleware");

const router = express.Router();

router.post("/", optionalCustomer, createOrder);
router.get("/track/:orderNumber", getOrderByNumber);

router.get("/my/orders", protectCustomer, getMyOrders);
router.get("/my/orders/:id", protectCustomer, getMyOrderById);

router.get("/admin/stats", protectAdmin, getAdminStats);
router.get("/admin", protectAdmin, getAdminOrders);
router.get("/admin/:id", protectAdmin, getAdminOrderById);
router.patch("/admin/:id/status", protectAdmin, updateOrderStatus);
router.patch("/admin/:id/payment", protectAdmin, updatePaymentStatus);

module.exports = router;