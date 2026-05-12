import { Router } from "express";
import authentication from "../../../Middlewares/Authentication.js";
import { authorize } from "../../../Middlewares/Authorize.js";
import * as profileController from "./profile.controller.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();

router.get(
  "/",
  authentication,
  authorize(PERMISSIONS_V2.PROFILE.VIEW), 
  profileController.getProfile,
);

router.get(
  "/my-students",
  authentication,
  authorize(PERMISSIONS_V2.USERS.READ), // Assuming viewing students is covered by user:read
  profileController.getMyStudents,
);

export default router;
