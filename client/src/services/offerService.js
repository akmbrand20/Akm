import api from "../lib/api";

export const getOffers = async () => {
  const { data } = await api.get("/offers");
  return data.offers;
};