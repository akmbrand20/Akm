const crypto = require("crypto");

const normalize = (value = "") => {
  return String(value).trim().toLowerCase();
};

const hashValue = (value = "") => {
  const normalizedValue = normalize(value);

  if (!normalizedValue) return "";

  return crypto.createHash("sha256").update(normalizedValue).digest("hex");
};

const normalizePhone = (phone = "") => {
  return String(phone).replace(/\D/g, "");
};

module.exports = {
  hashValue,
  normalizePhone,
};