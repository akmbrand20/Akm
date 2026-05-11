const express = require("express");
const {
  getPublicSettings,
  getAdminSettings,
  updateSettings,
} = require("../controllers/settingsController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/public", getPublicSettings);
router.get("/admin", protectAdmin, getAdminSettings);
router.put("/admin", protectAdmin, updateSettings);

module.exports = router;