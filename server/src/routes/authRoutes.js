const express = require("express");
const {
  loginUnified,
  loginAdmin,
  getAdminProfile,
} = require("../controllers/authController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginUnified);
router.post("/admin/login", loginAdmin);
router.get("/admin/me", protectAdmin, getAdminProfile);

module.exports = router;