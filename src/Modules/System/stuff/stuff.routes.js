import { Router } from "express";
import * as stuffController from "./stuff.controller.js";
import authentication from "../../../Middlewares/Authentication.js";
import { authorizeResource } from "../../../Middlewares/AuthorizeResource.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();
const stuffResource = "users"; // Staff are users with specific roles

router.use(authentication);

router.get(
  "/",
  authorizeResource(stuffResource),
  stuffController.getAllStuff,
);

router.get(
  "/:id",
  authorizeResource(stuffResource),
  stuffController.getStuffById,
);

router.post(
  "/create",
  authorizeResource(stuffResource),
  stuffController.createStuffUser,
);

router.patch(
  "/update/:id",
  authorizeResource(stuffResource),
  stuffController.updateStuffUser,
);

router.delete(
  "/delete/:id",
  authorizeResource(stuffResource),
  stuffController.deleteStuffUser,
);

export default router;
