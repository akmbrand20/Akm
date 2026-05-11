const express = require("express");
const {
  signupCustomer,
  loginCustomer,
  getCustomerProfile,
} = require("../controllers/customerAuthController");
const { protectCustomer } = require("../middleware/customerAuthMiddleware");

const router = express.Router();

router.post("/signup", signupCustomer);
router.post("/login", loginCustomer);
router.get("/me", protectCustomer, getCustomerProfile);

module.exports = router;