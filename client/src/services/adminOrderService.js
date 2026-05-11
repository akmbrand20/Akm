import api from "../lib/api";

export const getAdminStats = async () => {
  const { data } = await api.get("/orders/admin/stats");
  return data.stats;
};

export const getAdminOrders = async (params = {}) => {
  const { data } = await api.get("/orders/admin", { params });
  return data.orders;
};

export const getAdminOrderById = async (id) => {
  const { data } = await api.get(`/orders/admin/${id}`);
  return data.order;
};

export const updateOrderStatus = async ({ id, orderStatus }) => {
  const { data } = await api.patch(`/orders/admin/${id}/status`, {
    orderStatus,
  });

  return data.order;
};

export const updatePaymentStatus = async ({ id, paymentStatus }) => {
  const { data } = await api.patch(`/orders/admin/${id}/payment`, {
    paymentStatus,
  });

  return data.order;
};