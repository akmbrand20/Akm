const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const protectCustomer = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer || !customer.isActive) {
      return res.status(401).json({
        success: false,
        message: "Customer account not found.",
      });
    }

    req.customer = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Please login again.",
    });
  }
};

const optionalCustomer = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id).select("-password");

    if (customer && customer.isActive) {
      req.customer = customer;
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  protectCustomer,
  optionalCustomer,
};