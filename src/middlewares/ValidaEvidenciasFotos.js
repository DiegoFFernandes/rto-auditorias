const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const defaultFolder = process.env.CLOUDINARY_UPLOAD_FOLDER;

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

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
      resource_type: "image",
      overwrite: false,
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }
  const error = new Error("Tipo de arquivo não permitido. Envie uma imagem JPG, PNG, WEBP ou HEIC.");
  error.statusCode = 400;
  return cb(error);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
});

upload.MAX_FILE_SIZE_MB = MAX_FILE_SIZE_MB;

module.exports = upload;
