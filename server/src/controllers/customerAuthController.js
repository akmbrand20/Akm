const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const { sendOwnerNewCustomerEmail } = require("../services/emailService");

const generateToken = (customerId) => {
  return jwt.sign({ id: customerId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const signupCustomer = async (req, res) => {
  try {
    const { fullName, email, phone, password, acceptsMarketing } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, phone, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const existingCustomer = await Customer.findOne({
      email: String(email).toLowerCase().trim(),
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "An account already exists with this email.",
      });
    }

    const customer = await Customer.create({
      fullName,
      email,
      phone,
      password,
      acceptsMarketing: acceptsMarketing !== undefined ? acceptsMarketing : true,
    });

    try {
      const emailResult = await sendOwnerNewCustomerEmail(customer);

      if (emailResult.sent) {
        console.log(`Owner signup email sent for customer: ${customer.email}`);
      } else {
        console.log(
          `Owner signup email not sent for customer ${customer.email}: ${
            emailResult.reason || "Unknown reason"
          }`
        );
      }
    } catch (emailError) {
      console.log("Owner signup email failed:", emailError.message);
    }

    const token = generateToken(customer._id);

    res.status(201).json({
      success: true,
      token,
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        acceptsMarketing: customer.acceptsMarketing,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Signup failed.",
    });
  }
};

const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  const customer = await Customer.findOne({
    email: String(email).toLowerCase().trim(),
  }).select("+password");

  if (!customer || !customer.isActive) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  const isMatch = await customer.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  const token = generateToken(customer._id);

  res.json({
    success: true,
    token,
    customer: {
      _id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      acceptsMarketing: customer.acceptsMarketing,
    },
  });
};

const getCustomerProfile = async (req, res) => {
  res.json({
    success: true,
    customer: req.customer,
  });
};

module.exports = {
  signupCustomer,
  loginCustomer,
  getCustomerProfile,
};