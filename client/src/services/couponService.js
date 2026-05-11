import api from "../lib/api";

export const validateCouponCode = async ({ code, subtotalAfterBundle }) => {
  const { data } = await api.post("/coupons/validate", {
    code,
    subtotalAfterBundle,
  });

  return data;
};

export const getAdminCoupons = async () => {
  const { data } = await api.get("/coupons");
  return data.coupons;
};

export const createAdminCoupon = async (couponData) => {
  const { data } = await api.post("/coupons", couponData);
  return data.coupon;
};

export const updateAdminCoupon = async ({ id, couponData }) => {
  const { data } = await api.put(`/coupons/${id}`, couponData);
  return data.coupon;
};

export const deleteAdminCoupon = async (id) => {
  const { data } = await api.delete(`/coupons/${id}`);
  return data;
};