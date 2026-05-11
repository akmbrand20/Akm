const express = require("express");
const {
  getCampaigns,
  getMarketingCustomersCount,
  createCampaign,
  sendCampaign,
  deleteCampaign,
} = require("../controllers/emailCampaignController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protectAdmin, getCampaigns);
router.get("/customers/count", protectAdmin, getMarketingCustomersCount);
router.post("/", protectAdmin, createCampaign);
router.post("/:id/send", protectAdmin, sendCampaign);
router.delete("/:id", protectAdmin, deleteCampaign);

module.exports = router;