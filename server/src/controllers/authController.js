const Admin = require("../models/Admin");
const Customer = require("../models/Customer");
const generateToken = require("../utils/generateToken");

const buildAdminResponse = (admin) => {
  return {
    _id: admin._id,
    fullName: admin.fullName,
    email: admin.email,
    phone: admin.phone,
    role: admin.role,
  };
};

const buildCustomerResponse = (customer) => {
  return {
    _id: customer._id,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    acceptsMarketing: customer.acceptsMarketing,
  };
};

const loginUnified = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  const cleanEmail = String(email).toLowerCase().trim();

  const admin = await Admin.findOne({ email: cleanEmail }).select("+password");

  if (admin && admin.isActive) {
    const isAdminMatch = await admin.matchPassword(password);

    if (isAdminMatch) {
      const token = generateToken(admin._id);

      return res.json({
        success: true,
        userType: "admin",
        token,
        admin: buildAdminResponse(admin),
      });
    }
  }

  const customer = await Customer.findOne({ email: cleanEmail }).select(
    "+password"
  );

  if (customer && customer.isActive) {
    const isCustomerMatch = await customer.matchPassword(password);

    if (isCustomerMatch) {
      const token = generateToken(customer._id);

      return res.json({
        success: true,
        userType: "customer",
        token,
        customer: buildCustomerResponse(customer),
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: "Invalid email or password.",
  });
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  const cleanEmail = String(email).toLowerCase().trim();

  const admin = await Admin.findOne({ email: cleanEmail }).select("+password");

  if (!admin || !admin.isActive) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  const isMatch = await admin.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  const token = generateToken(admin._id);

  res.json({
    success: true,
    token,
    admin: buildAdminResponse(admin),
  });
};

const getAdminProfile = async (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
  });
};

module.exports = {
  loginUnified,
  loginAdmin,
  getAdminProfile,
};