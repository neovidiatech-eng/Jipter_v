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
  
  authorizeResource(ranksResource),
  controller.getRanks,
);

router.get(
  "/:id",
  
  authorizeResource(ranksResource),
  validation(schema.getRank),
  controller.getRank,
);

router.post(
  "/create",
  
  authorizeResource(ranksResource),
  validation(schema.createRank),
  controller.addRank,
);

router.patch(
  "/:id",
  
  authorizeResource(ranksResource),
  validation(schema.updateRank),
  controller.updateRank,
);

router.delete(
  "/:id",
  
  authorizeResource(ranksResource),
  validation(schema.deleteRank),
  controller.deleteRank,
);

export default router;
