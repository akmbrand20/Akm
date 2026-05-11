import api from "../lib/api";

export const getEmailCampaigns = async () => {
  const { data } = await api.get("/email-campaigns");
  return data.campaigns;
};

export const getMarketingCustomersCount = async () => {
  const { data } = await api.get("/email-campaigns/customers/count");
  return data.counts;
};

export const createEmailCampaign = async (campaignData) => {
  const { data } = await api.post("/email-campaigns", campaignData);
  return data.campaign;
};

export const sendEmailCampaign = async (id) => {
  const { data } = await api.post(`/email-campaigns/${id}/send`);
  return data.campaign;
};

export const deleteEmailCampaign = async (id) => {
  const { data } = await api.delete(`/email-campaigns/${id}`);
  return data;
};