const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const defaultFolder = process.env.CLOUDINARY_UPLOAD_FOLDER;

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const baseName = (file.originalname || "arquivo")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "_");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    return {
      folder: defaultFolder,
      public_id: `${baseName}-${uniqueSuffix}`,
      resource_type: "auto",
      transformation: [{ angle: "exif", quality: "auto:good", fetch_format: "auto" }],
      overwrite: false,
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
