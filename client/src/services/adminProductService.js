import api from "../lib/api";

export const getAdminProducts = async () => {
  const { data } = await api.get("/products/admin");
  return data.products;
};

export const getAdminProductById = async (id) => {
  const { data } = await api.get(`/products/admin/${id}`);
  return data.product;
};

export const createAdminProduct = async (productData) => {
  const { data } = await api.post("/products/admin", productData);
  return data.product;
};

export const updateAdminProduct = async ({ id, productData }) => {
  const { data } = await api.put(`/products/admin/${id}`, productData);
  return data.product;
};

export const toggleProductStatus = async (id) => {
  const { data } = await api.patch(`/products/admin/${id}/status`);
  return data.product;
};

export const deleteAdminProduct = async (id) => {
  const { data } = await api.delete(`/products/admin/${id}`);
  return data;
};