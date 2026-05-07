import multer from "multer";
import { customAlphabet } from "nanoid";
import path from "node:path";
import fs from "node:fs";

export const fileValidation = {
  image: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"],
  video: ["video/mp4", "video/mpeg", "video/ogg", "video/webm"],
  pdf: ["application/pdf"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};
export const localMulterUpload = ({
  customPath = "general",
  validation = [],
} = {}) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const pathValue =
        typeof customPath === "function"
          ? `uploads/${customPath(req)}`
          : `uploads/${customPath}`;
      const fullPath = path.resolve(`./src/${pathValue}`);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      file.finalPath = `${pathValue}`;
      cb(null, fullPath);
    },
    filename: function (req, file, cb) {
      const uniqueFileName = `${customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 10)()}-${file.originalname}`;
      file.finalPath = `${file.finalPath}/${uniqueFileName}`;
      cb(null, uniqueFileName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (validation.length === 0 || validation.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Invalid File Format"), false);
  };

  return multer({ fileFilter, storage });
};
