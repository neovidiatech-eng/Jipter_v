import { Router } from "express";
import authentication from "../../../Middlewares/Authentication.js";
import { authorize } from "../../../Middlewares/Authorize.js";
import * as profileController from "./profile.controller.js";
import { validation } from "../../../Middlewares/Validation.js";
import * as schema from "./profile.validation.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();

router.get(
  "/",
  authentication,
  authorize(PERMISSIONS_V2.PROFILE.VIEW), 
  profileController.getProfile,
);

router.patch(
  "/update-profile",
  authentication,
  authorize(PERMISSIONS_V2.PROFILE.UPDATE), 
  validation(schema.updateProfileSchema),
  profileController.updateProfile,
);

export default router;
