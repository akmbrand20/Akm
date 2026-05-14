const COLORS = ["Black", "Brown", "Off White"];
const SIZES = ["M", "L", "XL"];

const PRODUCT_CATEGORIES = ["tshirt", "pants", "sweater"];

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const PAYMENT_METHODS = ["Cash on Delivery", "Instapay", "Vodafone Cash"];

const INSTAPAY_TIMINGS = ["Pay Now", "Pay on Delivery", ""];

const PAYMENT_STATUSES = ["Unpaid", "Pending Verification", "Paid"];

const DELIVERY_FEE = 80;

module.exports = {
  COLORS,
  SIZES,
  PRODUCT_CATEGORIES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  INSTAPAY_TIMINGS,
  PAYMENT_STATUSES,
  DELIVERY_FEE,
};
