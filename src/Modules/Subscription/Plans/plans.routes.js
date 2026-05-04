import { Router } from "express";
import authentication from "../../../Middlewares/Authentication.js";
import * as plans from "./plans.controller.js";
import { validation } from "../../../Middlewares/Validation.js";
import {
  createPlanSchema,
  deletePlanSchema,
  updatePlanSchema,
} from "./plans.validation.js";

const router = Router();
router.get("/", plans.getAllPlans);
router.post(
  "/",
  authentication,
  validation(createPlanSchema),
  plans.createPlan,
);
router.patch(
  "/:id",
  authentication,
  validation(updatePlanSchema),
  plans.updatePlan,
);
router.delete(
  "/:id",
  authentication,
  validation(deletePlanSchema),
  plans.deletePlan,
);

export default router;
