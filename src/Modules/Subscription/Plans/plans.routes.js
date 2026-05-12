import { Router } from "express";
import authentication from "../../../Middlewares/Authentication.js";
import { authorizeResource } from "../../../Middlewares/AuthorizeResource.js";
import * as plans from "./plans.controller.js";
import { validation } from "../../../Middlewares/Validation.js";
import {
  createPlanSchema,
  deletePlanSchema,
  updatePlanSchema,
} from "./plans.validation.js";

const router = Router();
const plansResource = "plans";

router.get("/", plans.getAllPlans);

router.post(
  "/",
  authentication,
  authorizeResource(plansResource),
  validation(createPlanSchema),
  plans.createPlan,
);

router.patch(
  "/:id",
  authentication,
  authorizeResource(plansResource),
  validation(updatePlanSchema),
  plans.updatePlan,
);

router.delete(
  "/:id",
  authentication,
  authorizeResource(plansResource),
  validation(deletePlanSchema),
  plans.deletePlan,
);

export default router;
