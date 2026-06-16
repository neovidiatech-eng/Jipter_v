import { Router } from "express";
import * as stuffController from "./stuff.controller.js";
import authentication from "../../../Middlewares/Authentication.js";
import { authorizeResource } from "../../../Middlewares/AuthorizeResource.js";
import { validation } from "../../../Middlewares/Validation.js";
import {
  createStuffUserSchema,
  updateStuffUserSchema,
  deleteStuffUserSchema,
  getStuffByIdSchema,
  getAllStuffSchema,
} from "./stuff.validation.js";

const router = Router();
const stuffResource = "users"; // Staff are users with specific roles

router.use(authentication);

router.get(
  "/",
  authorizeResource(stuffResource),
  validation(getAllStuffSchema),
  stuffController.getAllStuff,
);

router.get(
  "/:id",
  authorizeResource(stuffResource),
  validation(getStuffByIdSchema),
  stuffController.getStuffById,
);

router.post(
  "/create",
  authorizeResource(stuffResource),
  validation(createStuffUserSchema),
  stuffController.createStuffUser,
);

router.patch(
  "/update/:id",
  authorizeResource(stuffResource),
  validation(updateStuffUserSchema),
  stuffController.updateStuffUser,
);

router.delete(
  "/delete/:id",
  authorizeResource(stuffResource),
  validation(deleteStuffUserSchema),
  stuffController.deleteStuffUser,
);

export default router;
