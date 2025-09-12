// services/mediaAPI.js
import { httpClient } from "./httpClient.js";

export const mediaAPI = {
  // Upload single file
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await httpClient.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Upload failed:", error);
      // Check if it's a permissions error
      if (error.response?.status === 403) {
        throw new Error("Không có quyền upload file. Vui lòng liên hệ admin.");
      }
      throw error;
    }
  },

  // Upload multiple files
  uploadFiles: async (files) => {
    try {
      const uploadPromises = files.map((file) => mediaAPI.uploadFile(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Multiple upload failed:", error);
      throw error;
    }
  },

  // Convert base64 to File object
  base64ToFile: (base64, filename = "image.jpg") => {
    try {
      // Extract the data part (remove data:image/png;base64, prefix)
      const base64Data = base64.split(",")[1];
      const mimeType = base64.split(",")[0].split(":")[1].split(";")[0];

      // Convert base64 to binary
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Create file
      return new File([byteArray], filename, { type: mimeType });
    } catch (error) {
      console.error("Failed to convert base64 to file:", error);
      throw error;
    }
  },

  // Convert base64 images to files and upload them
  uploadBase64Images: async (base64Images) => {
    try {
      if (!base64Images || base64Images.length === 0) {
        return [];
      }

      const files = base64Images.map((base64, index) => {
        const timestamp = Date.now();
        const filename = `recipe-image-${timestamp}-${index}.jpg`;
        return mediaAPI.base64ToFile(base64, filename);
      });

      const uploadResults = await mediaAPI.uploadFiles(files);

      // Extract the media IDs from upload results
      return uploadResults
        .map(
          (result) =>
            result._id || result.id || result.data?._id || result.data?.id
        )
        .filter(Boolean);
    } catch (error) {
      console.error("Failed to upload base64 images:", error);
      throw error;
    }
  },
};

export default mediaAPI;
