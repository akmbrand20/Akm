const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Customer = require("../models/Customer");

const getTokenFromHeader = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
};

const protectAdmin = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid token.",
    });
  }
};

const protectCustomer = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please sign in first.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer || !customer.isActive) {
      return res.status(401).json({
        success: false,
        message: "Please sign in again.",
      });
    }

    req.customer = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Please sign in again.",
    });
  }
};

module.exports = {
  protectAdmin,
  protectCustomer,
};