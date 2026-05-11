const express = require("express");
const {
  getProducts,
  getProductFilters,
  getFeaturedProducts,
  getProductBySlug,
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  toggleProductStatus,
  deleteAdminProduct,
} = require("../controllers/productController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/admin", protectAdmin, getAdminProducts);
router.post("/admin", protectAdmin, createAdminProduct);
router.get("/admin/:id", protectAdmin, getAdminProductById);
router.put("/admin/:id", protectAdmin, updateAdminProduct);
router.patch("/admin/:id/status", protectAdmin, toggleProductStatus);
router.delete("/admin/:id", protectAdmin, deleteAdminProduct);

router.get("/", getProducts);
router.get("/filters", getProductFilters);
router.get("/featured", getFeaturedProducts);
router.get("/:slug", getProductBySlug);

module.exports = router;