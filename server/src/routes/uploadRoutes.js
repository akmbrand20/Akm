const express = require("express");
const {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
} = require("../controllers/uploadController");
const upload = require("../middleware/uploadMiddleware");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/image", protectAdmin, upload.single("image"), uploadImage);
router.post(
  "/multiple",
  protectAdmin,
  upload.array("images", 8),
  uploadMultipleImages
);
router.delete("/:publicId", protectAdmin, deleteImage);

module.exports = router;