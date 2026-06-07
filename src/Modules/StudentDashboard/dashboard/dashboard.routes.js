import { Router } from "express";
import authentication from "../../../Middlewares/Authentication.js";
import { authorize } from "../../../Middlewares/Authorize.js";
import * as controller from "./dashboard.controller.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();

router.get(
  "/",
  authentication,
  authorize(PERMISSIONS_V2.DASHBOARD.READ),
  controller.getDashboard,
);

export default router;
