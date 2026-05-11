import { Router } from "express";
import authentication from "../../../Middlewares/Authentication.js";
import { authorization } from "../../../Middlewares/Authorization.js";
import { endpoints } from "./profile.authorization.js";
import * as profileController from "./profile.controller.js";
import { validation } from "../../../Middlewares/Validation.js";
import * as schema from "./profile.validation.js";
const router = Router();


router.get(
  "/",
  authentication,
  authorization({ permissions: endpoints.getProfile }), 
  profileController.getProfile,
);

router.patch(
  "/update-profile",
  authentication,
  authorization({ permissions: endpoints.updateProfile }), 
  validation(schema.updateProfileSchema),
  profileController.updateProfile,
);

export default router;
