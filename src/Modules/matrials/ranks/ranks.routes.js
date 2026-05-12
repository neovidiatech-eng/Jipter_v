import { Router } from "express";
import * as controller from "./ranks.controller.js";
import authentication from "../../../Middlewares/Authentication.js";
import { validation } from "../../../Middlewares/Validation.js";
import { authorizeResource } from "../../../Middlewares/AuthorizeResource.js";
import { authorize } from "../../../Middlewares/Authorize.js";
import * as schema from "./ranks.validation.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();
const ranksResource = "ranks";

router.get(
  "/",
  authentication,
  authorize(PERMISSIONS_V2.COURSES.READ), // Ranks often tied to course access
  controller.getRanks,
);

router.get(
  "/:id",
  authentication,
  authorize(PERMISSIONS_V2.COURSES.READ),
  validation(schema.getRank),
  controller.getRank,
);

router.post(
  "/create",
  authentication,
  authorizeResource(ranksResource),
  validation(schema.createRank),
  controller.addRank,
);

router.patch(
  "/:id",
  authentication,
  authorizeResource(ranksResource),
  validation(schema.updateRank),
  controller.updateRank,
);

router.delete(
  "/:id",
  authentication,
  authorizeResource(ranksResource),
  validation(schema.deleteRank),
  controller.deleteRank,
);

export default router;
