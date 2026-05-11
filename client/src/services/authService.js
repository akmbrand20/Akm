import api from "../lib/api";

export const loginUnified = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const loginAdmin = async (credentials) => {
  const { data } = await api.post("/auth/admin/login", credentials);
  return data;
};

export const getAdminProfile = async () => {
  const { data } = await api.get("/auth/admin/me");
  return data.admin;
};