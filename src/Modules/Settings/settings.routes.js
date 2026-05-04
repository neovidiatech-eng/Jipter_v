import { Router } from "express";
import * as settingsController from "./settings.controller.js";
import authentication from "../../Middlewares/Authentication.js";
import { cloudinaryMulterUpload, fileValidation } from "../../Utils/Multer/index.js";

const router = Router();

router.patch(
    "/profile-image",
    authentication,
    cloudinaryMulterUpload({ validation: fileValidation.image }).single("image"),
    settingsController.updateProfileImage
);

export default router;
