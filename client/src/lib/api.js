import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

const adminProtectedPaths = [
  "/auth/admin",
  "/orders/admin",
  "/products/admin",
  "/offers/admin",
  "/reviews/admin",
  "/settings/admin",
  "/coupons",
  "/upload",
  "/email-campaigns",
];

const customerProtectedPaths = [
  "/customer-auth/me",
  "/orders/my",
  "/reviews/customer",
];

api.interceptors.request.use((config) => {
  const url = config.url || "";

  const adminToken = localStorage.getItem("akm_admin_token");
  const customerToken = localStorage.getItem("akm_customer_token");

  const isAdminRequest = adminProtectedPaths.some((path) =>
    url.startsWith(path)
  );

  const isCustomerRequest = customerProtectedPaths.some((path) =>
    url.startsWith(path)
  );

  if (isAdminRequest && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
    return config;
  }

  if (isCustomerRequest && customerToken) {
    config.headers.Authorization = `Bearer ${customerToken}`;
    return config;
  }

  return config;
});

export default api;