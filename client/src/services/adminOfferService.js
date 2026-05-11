import api from "../lib/api";

export const getAdminOffers = async () => {
  const { data } = await api.get("/offers/admin");
  return data.offers;
};

export const getAdminOfferById = async (id) => {
  const { data } = await api.get(`/offers/admin/${id}`);
  return data.offer;
};

export const createAdminOffer = async (offerData) => {
  const { data } = await api.post("/offers/admin", offerData);
  return data.offer;
};

export const updateAdminOffer = async ({ id, offerData }) => {
  const { data } = await api.put(`/offers/admin/${id}`, offerData);
  return data.offer;
};

export const deleteAdminOffer = async (id) => {
  const { data } = await api.delete(`/offers/admin/${id}`);
  return data;
};

export const sendAdminOfferNotification = async ({ id, audience }) => {
  const { data } = await api.post(`/offers/admin/${id}/notify`, { audience });
  return data;
};