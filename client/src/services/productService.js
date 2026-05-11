import api from "../lib/api";

export const getProducts = async (params = {}) => {
  const { data } = await api.get("/products", { params });
  return data.products;
};

export const getProductFilters = async () => {
  const { data } = await api.get("/products/filters");
  return data.filters;
};

export const getFeaturedProducts = async () => {
  const { data } = await api.get("/products/featured");
  return data.products;
};

export const getProductBySlug = async (slug) => {
  const { data } = await api.get(`/products/${slug}`);
  return data.product;
};