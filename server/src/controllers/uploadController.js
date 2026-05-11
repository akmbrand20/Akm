const cloudinary = require("../config/cloudinary");

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded.",
      });
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary environment variables are missing.",
      });
    }

    const folder = req.body.folder || "akm/products";

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            {
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    res.status(201).json({
      success: true,
      image: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        alt: req.body.alt || "",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Image upload failed.",
    });
  }
};

const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files uploaded.",
      });
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary environment variables are missing.",
      });
    }

    const folder = req.body.folder || "akm/products";

    const uploadedImages = [];

    for (const file of req.files) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "image",
            transformation: [
              {
                quality: "auto",
                fetch_format: "auto",
              },
            ],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        stream.end(file.buffer);
      });

      uploadedImages.push({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        alt: req.body.alt || "",
      });
    }

    res.status(201).json({
      success: true,
      images: uploadedImages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Images upload failed.",
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Image public ID is required.",
      });
    }

    await cloudinary.uploader.destroy(publicId);

    res.json({
      success: true,
      message: "Image deleted from Cloudinary.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete image.",
    });
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
};