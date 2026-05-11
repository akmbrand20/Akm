import api from "../lib/api";

export const getPublicSettings = async () => {
  const { data } = await api.get("/settings/public");
  return data.settings;
};

export const getAdminSettings = async () => {
  const { data } = await api.get("/settings/admin");
  return data.settings;
};

export const updateAdminSettings = async (settingsData) => {
  const { data } = await api.put("/settings/admin", settingsData);
  return data.settings;
};