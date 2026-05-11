import api from "../lib/api";

export const createOrder = async (orderData) => {
  const { data } = await api.post("/orders", orderData);
  return data.order;
};

export const getOrderByNumber = async (orderNumber) => {
  const { data } = await api.get(`/orders/track/${orderNumber}`);
  return data.order;
};