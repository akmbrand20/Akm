const express = require("express");
const {
  getOffers,
  getAdminOffers,
  getAdminOfferById,
  createAdminOffer,
  updateAdminOffer,
  deleteAdminOffer,
  sendAdminOfferNotification,
} = require("../controllers/offerController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/admin", protectAdmin, getAdminOffers);
router.get("/admin/:id", protectAdmin, getAdminOfferById);
router.post("/admin", protectAdmin, createAdminOffer);
router.put("/admin/:id", protectAdmin, updateAdminOffer);
router.delete("/admin/:id", protectAdmin, deleteAdminOffer);
router.post("/admin/:id/notify", protectAdmin, sendAdminOfferNotification);

router.get("/", getOffers);

module.exports = router;