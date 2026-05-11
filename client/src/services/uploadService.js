import api from "../lib/api";

export const uploadMultipleImages = async ({ files, folder, alt }) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  if (folder) {
    formData.append("folder", folder);
  }

  if (alt) {
    formData.append("alt", alt);
  }

  const { data } = await api.post("/upload/multiple", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.images;
};

export const deleteCloudinaryImage = async (publicId) => {
  const encodedPublicId = encodeURIComponent(publicId);
  const { data } = await api.delete(`/upload/${encodedPublicId}`);
  return data;
};