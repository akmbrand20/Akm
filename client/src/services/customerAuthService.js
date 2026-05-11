import api from "../lib/api";

export const signupCustomer = async (customerData) => {
  const { data } = await api.post("/customer-auth/signup", customerData);
  return data;
};

export const loginCustomer = async (credentials) => {
  const { data } = await api.post("/customer-auth/login", credentials);
  return data;
};

export const getCustomerProfile = async () => {
  const { data } = await api.get("/customer-auth/me");
  return data.customer;
};