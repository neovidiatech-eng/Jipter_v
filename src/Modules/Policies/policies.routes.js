import { Router } from "express";
import * as policiesController from "./policies.controller.js";
import * as policiesValidation from "./policies.validation.js";
import authentication from "../../Middlewares/Authentication.js";
import { authorization } from "../../Middlewares/Authorization.js";
import { validation } from "../../Middlewares/Validation.js";

const router = Router();

// Publicly available for authenticated users
router.use(authentication);

// Get policies and notice (Shared)
router.get("/", policiesController.getAllPolicies);
router.get("/notice", policiesController.getActiveNotice);

// Admin only routes for managing policies
router.post(
  "/",
  authorization({ accessRoles: ["admin", "super_admin"] }),
  validation(policiesValidation.createPolicySchema),
  policiesController.createPolicy
);

router.patch(
  "/:id",
  authorization({ accessRoles: ["admin", "super_admin"] }),
  validation(policiesValidation.updatePolicySchema),
  policiesController.updatePolicy
);

router.delete(
  "/:id",
  authorization({ accessRoles: ["admin", "super_admin"] }),
  validation(policiesValidation.policyIdSchema),
  policiesController.deletePolicy
);

// Admin only routes for managing notice
router.post(
  "/notice",
  authorization({ accessRoles: ["admin", "super_admin"] }),
  validation(policiesValidation.createNoticeSchema),
  policiesController.upsertNotice
);

export default router;
