import api from "../lib/api";

export const getMyOrders = async () => {
  const { data } = await api.get("/orders/my/orders");
  return data.orders;
};

export const getMyOrderById = async (id) => {
  const { data } = await api.get(`/orders/my/orders/${id}`);
  return data.order;
};