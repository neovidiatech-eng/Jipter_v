import { Router } from "express";
import * as settingsController from "./settings.controller.js";
import authentication from "../../Middlewares/Authentication.js";
import { authorize } from "../../Middlewares/Authorize.js";
import { validation } from "../../Middlewares/Validation.js";
import { updateSettingsSchema } from "./settings.validation.js";
import { PERMISSIONS_V2 } from "../../Constants/permissions.constants.js";

const router = Router();

router.get("/", settingsController.getSettings);

router.patch(
  "/",
  authentication,
  authorize(PERMISSIONS_V2.SETTINGS.UPDATE),
  validation(updateSettingsSchema),
  settingsController.updateSettings,
);

export default router;
