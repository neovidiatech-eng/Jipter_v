import { Router } from "express";
import * as settingsController from "./settings.controller.js";
import authentication from "../../Middlewares/Authentication.js";
import {
  cloudinaryMulterUpload,
  fileValidation,
} from "../../Utils/Multer/index.js";

import { validation } from "../../Middlewares/Validation.js";
import { updateSettingsSchema } from "./settings.validation.js";
import { authorization } from "../../Middlewares/Authorization.js";

import { PERMISSIONS } from "../../Utils/Permissions/permissions.js";

const router = Router();

router.get("/", settingsController.getSettings);

router.patch(
  "/",
  authentication,
  authorization({ permissions: [PERMISSIONS.SETTINGS_UPDATE] }),
  validation(updateSettingsSchema),
  settingsController.updateSettings,
);

export default router;
