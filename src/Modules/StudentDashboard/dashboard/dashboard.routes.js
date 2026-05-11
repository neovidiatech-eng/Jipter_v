import { Router } from "express";
import authentication from "../../../Middlewares/Authentication.js";
import { authorization } from "../../../Middlewares/Authorization.js";
import { endpoints } from "./dashboard.authorization.js";
import * as controller from "./dashboard.controller.js"
const router = Router();

router.get(
  "/",
  authentication,
  authorization({ permissions: endpoints.getDashboard }),
  controller.getDashboard,
);

export default router;
