const Order = require("../models/Order");
const SiteSettings = require("../models/SiteSettings");
const { generateOrderNumber } = require("../services/orderNumberService");
const {
  validateAndBuildOrderItems,
  decreaseStockAfterOrder,
} = require("../services/stockService");
const { calculateTotals } = require("../utils/calculateTotals");
const { sendMetaPurchaseEvent } = require("../services/metaCapiService");
const Coupon = require("../models/Coupon");
const { validateCoupon } = require("../services/couponService");
const {
  sendOwnerNewOrderEmail,
  sendCustomerOrderConfirmationEmail,
} = require("../services/emailService");
const { getActiveBundleOffers } = require("../services/bundleOfferService");

const createOrder = async (req, res) => {
  try {
    const {
  customer,
  items,
  paymentMethod,
  instapayTiming,
  transactionReference,
  trackingEventId,
  couponCode,
} = req.body;

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Customer information is required.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty.",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required.",
      });
    }

    if (paymentMethod === "Instapay" && !instapayTiming) {
      return res.status(400).json({
        success: false,
        message: "Please choose when you will pay by Instapay.",
      });
    }

    const orderItems = await validateAndBuildOrderItems(items);
const settings = await SiteSettings.findOne();

const deliveryFee = settings?.deliveryFee ?? 80;
const freeShippingThreshold = settings?.freeShippingThreshold ?? null;

const activeBundleOffers = await getActiveBundleOffers();

const baseTotals = calculateTotals(
  orderItems,
  deliveryFee,
  freeShippingThreshold,
  0,
  activeBundleOffers
);

let couponDiscount = 0;
let appliedCoupon = {
  code: "",
  discount: 0,
};

if (couponCode) {
  const couponResult = await validateCoupon({
    code: couponCode,
    subtotalAfterBundle: baseTotals.subtotal - baseTotals.bundleDiscount,
  });

  if (!couponResult.valid) {
    return res.status(400).json({
      success: false,
      message: couponResult.message,
    });
  }

  couponDiscount = couponResult.discount;
  appliedCoupon = {
    code: couponResult.coupon.code,
    discount: couponResult.discount,
  };
}

const totals = calculateTotals(
  orderItems,
  deliveryFee,
  freeShippingThreshold,
  couponDiscount,
  activeBundleOffers
);
    const orderNumber = await generateOrderNumber();

    let paymentStatus = "Unpaid";

    if (paymentMethod === "Instapay" && instapayTiming === "Pay Now") {
      paymentStatus = "Pending Verification";
    }

    const order = await Order.create({
  orderNumber,
  customerId: req.customer?._id || null,
  customer: {
        fullName: customer.fullName,
        phone: customer.phone,
        secondPhone: customer.secondPhone || "",
        email: customer.email || req.customer?.email || "",
        city: customer.city,
        address: customer.address,
        notes: customer.notes || "",
      },
      items: orderItems,
      subtotal: totals.subtotal,
shippingFee: totals.shippingFee,
discount: totals.discount,
bundleDiscount: totals.bundleDiscount,
couponDiscount: totals.couponDiscount,
total: totals.total,
appliedOffer: totals.appliedOffer,
coupon: appliedCoupon,
paymentMethod,
      instapayTiming: paymentMethod === "Instapay" ? instapayTiming : "",
      transactionReference: transactionReference || "",
      paymentStatus,
      orderStatus: "Pending",
      tracking: {
        eventId: trackingEventId || `purchase_${orderNumber}`,
      },
    });

    await decreaseStockAfterOrder(orderItems);
    if (appliedCoupon.code) {
  await Coupon.findOneAndUpdate(
    { code: appliedCoupon.code },
    { $inc: { usedCount: 1 } }
  );
}
try {
  const emailResult = await sendOwnerNewOrderEmail(order);

  if (emailResult.sent) {
    order.notifications.ownerEmailSent = true;
    order.notifications.ownerEmailSentAt = new Date();
    order.notifications.ownerEmailError = "";
  } else {
    order.notifications.ownerEmailSent = false;
    order.notifications.ownerEmailError = emailResult.reason || "";
  }

  await order.save();
} catch (emailError) {
  order.notifications.ownerEmailSent = false;
  order.notifications.ownerEmailError =
    emailError.message || "Owner email failed.";

  await order.save();
}
try {
  const customerEmailResult = await sendCustomerOrderConfirmationEmail(order);

  if (customerEmailResult.sent) {
    order.notifications.customerEmailSent = true;
    order.notifications.customerEmailSentAt = new Date();
    order.notifications.customerEmailError = "";
  } else {
    order.notifications.customerEmailSent = false;
    order.notifications.customerEmailError =
      customerEmailResult.reason || "";
  }

  await order.save();
} catch (customerEmailError) {
  order.notifications.customerEmailSent = false;
  order.notifications.customerEmailError =
    customerEmailError.message || "Customer email failed.";

  await order.save();
}

try {
  const capiResult = await sendMetaPurchaseEvent({
    order,
    req,
  });

  if (capiResult.sent) {
    order.tracking.metaCapiSent = true;
    order.tracking.metaCapiSentAt = new Date();
    order.tracking.metaCapiError = "";
  } else {
    order.tracking.metaCapiSent = false;
    order.tracking.metaCapiError = capiResult.reason || "";
  }

  await order.save();
} catch (capiError) {
  order.tracking.metaCapiSent = false;
  order.tracking.metaCapiError =
    capiError?.response?.data?.error?.message ||
    capiError.message ||
    "Meta CAPI failed.";

  await order.save();
}

res.status(201).json({
  success: true,
  message: "Order created successfully.",
  order,
});
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create order.",
    });
  }
};

const getOrderByNumber = async (req, res) => {
  const order = await Order.findOne({
    orderNumber: req.params.orderNumber,
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  res.json({
    success: true,
    order,
  });
};

const getAdminOrders = async (req, res) => {
  const { status, paymentStatus, paymentMethod, search } = req.query;

  const query = {};

  if (status) {
    query.orderStatus = status;
  }

  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  if (paymentMethod) {
    query.paymentMethod = paymentMethod;
  }

  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { "customer.fullName": { $regex: search, $options: "i" } },
      { "customer.phone": { $regex: search, $options: "i" } },
    ];
  }

  const orders = await Order.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: orders.length,
    orders,
  });
};

const getAdminOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  res.json({
    success: true,
    order,
  });
};

const updateOrderStatus = async (req, res) => {
  const { orderStatus } = req.body;

  const allowedStatuses = [
    "Pending",
    "Confirmed",
    "Preparing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  if (!allowedStatuses.includes(orderStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status.",
    });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  res.json({
    success: true,
    message: "Order status updated.",
    order,
  });
};

const updatePaymentStatus = async (req, res) => {
  const { paymentStatus } = req.body;

  const allowedStatuses = ["Unpaid", "Pending Verification", "Paid"];

  if (!allowedStatuses.includes(paymentStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment status.",
    });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { paymentStatus },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  res.json({
    success: true,
    message: "Payment status updated.",
    order,
  });
};

const getAdminStats = async (req, res) => {
  const orders = await Order.find();

  const totalOrders = orders.length;

  const totalRevenue = orders
    .filter((order) => order.orderStatus !== "Cancelled")
    .reduce((total, order) => total + Number(order.total || 0), 0);

  const pendingOrders = orders.filter(
    (order) => order.orderStatus === "Pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.orderStatus === "Delivered"
  ).length;

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
    },
  });
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({
    customerId: req.customer._id,
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: orders.length,
    orders,
  });
};

const getMyOrderById = async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    customerId: req.customer._id,
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  res.json({
    success: true,
    order,
  });
};

module.exports = {
  createOrder,
  getOrderByNumber,
  getMyOrders,
  getMyOrderById,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getAdminStats,
};