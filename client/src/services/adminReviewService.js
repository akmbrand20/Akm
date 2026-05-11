import api from "../lib/api";

export const getAdminReviews = async (params = {}) => {
  const { data } = await api.get("/reviews/admin", { params });
  return data.reviews;
};

export const createAdminReview = async (reviewData) => {
  const { data } = await api.post("/reviews/admin", reviewData);
  return data.review;
};

export const updateAdminReviewStatus = async ({ id, status, adminNote = "" }) => {
  const { data } = await api.patch(`/reviews/admin/${id}/status`, {
    status,
    adminNote,
  });

  return data.review;
};

export const deleteAdminReview = async (id) => {
  const { data } = await api.delete(`/reviews/admin/${id}`);
  return data;
};