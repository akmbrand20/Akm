import api from "../lib/api";

export const getProductReviews = async (productId) => {
  const { data } = await api.get(`/reviews/product/${productId}`);
  return data;
};

export const getCustomerReviewStatus = async (productId) => {
  const { data } = await api.get(`/reviews/customer/status/${productId}`);
  return data;
};

export const submitCustomerReview = async ({ productId, rating, comment }) => {
  const { data } = await api.post(`/reviews/customer/${productId}`, {
    rating,
    comment,
  });

  return data;
};