import { Router } from "express";
import * as policiesController from "./policies.controller.js";
import * as policiesValidation from "./policies.validation.js";
import authentication from "../../Middlewares/Authentication.js";
import { authorize } from "../../Middlewares/Authorize.js";
import { validation } from "../../Middlewares/Validation.js";
import { PERMISSIONS_V2 } from "../../Constants/permissions.constants.js";

const router = Router();

// Publicly available for authenticated users
router.use(authentication);

// Get policies and notice (Shared)
router.get("/", policiesController.getAllPolicies);
router.get("/notice", policiesController.getActiveNotice);

// Admin only routes for managing policies
router.post(
  "/",
  authorize(PERMISSIONS_V2.POLICIES.MANAGE),
  validation(policiesValidation.createPolicySchema),
  policiesController.createPolicy
);

router.patch(
  "/:id",
  authorize(PERMISSIONS_V2.POLICIES.MANAGE),
  validation(policiesValidation.updatePolicySchema),
  policiesController.updatePolicy
);

router.delete(
  "/:id",
  authorize(PERMISSIONS_V2.POLICIES.MANAGE),
  validation(policiesValidation.policyIdSchema),
  policiesController.deletePolicy
);

// Admin only routes for managing notice
router.post(
  "/notice",
  authorize(PERMISSIONS_V2.POLICIES.MANAGE),
  validation(policiesValidation.createNoticeSchema),
  policiesController.upsertNotice
);

export default router;
