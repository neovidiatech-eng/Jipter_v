import multer from "multer";
import { customAlphabet } from "nanoid";
import path from "node:path"
import fs from "node:fs"

export const fileValidation = {
     image: ["image/png", "image/jpeg", "image/jpg"],
     pdf: ["application/pdf"]
}
export const localMulterUpload = ({ customPath = "general", validation = [] } = {}) => {
     let finalPath;

     const fileFilter = function (req, file, cb) {

          if (validation.includes(file.mimetype)) {
               return cb(null, true)
          }
          return cb(new Error("inVaild File Format"), false)

     }

     const storage = multer.diskStorage({
          destination: function (req, file, cb) {
               let basePath = `uploads/${customPath}`
               if (req.user?.user_id) {
                    basePath += `/${req.user?.user_id}`
               }


               finalPath = basePath
               const fullPath = path.resolve(`./src/${basePath}`)



               if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true })
               }

               cb(null, path.resolve(fullPath))
          },
          filename: function (req, file, cb) {
               const uniqueFileName = `${customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 5)()}-${file.originalname}`;
               file.finalPath = `${finalPath}/${uniqueFileName}`
               cb(null, uniqueFileName)
          }
     })

     return multer({
          dest: "./temp",
          fileFilter,
          storage
     })
}






