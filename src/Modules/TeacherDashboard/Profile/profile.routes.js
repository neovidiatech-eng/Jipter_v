import { Router } from "express";
import authentication from "../../../Middlewares/Authentication.js";
import { authorization } from "../../../Middlewares/Authorization.js";
import { endpoints } from "./profile.authorization.js";
import * as profileController from "./profile.controller.js";

const router = Router();


router.get(
  "/",
  authentication,
  authorization({ permissions: endpoints.getProfile }), 
  profileController.getProfile,
);
export default router;
