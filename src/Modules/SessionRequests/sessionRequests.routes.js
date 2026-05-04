import { Router } from "express";
import * as sessionRequestsController from "./sessionRequests.controller.js";
import * as sessionRequestsValidation from "./sessionRequests.validation.js";
import { validation } from "../../Middlewares/Validation.js";
import { authentication } from "../../Middlewares/Authentication.js";
import { authorization } from "../../Middlewares/Authorization.js";
import { endpoints } from "./sessionRequests.authorization.js";

const router = Router();

// Create Request
router.post(
  "/",
  authentication(),
  authorization({ accessRoles: endpoints.createRequest }),
  validation(sessionRequestsValidation.createRequest),
  sessionRequestsController.createRequest,
);

// Admin: Get All
router.get(
  "/all",
  authentication(),
  authorization({ accessRoles: endpoints.getAllRequests }),
  sessionRequestsController.getAllRequests,
);
router.get(
  "/my-requests",
  authentication(),
  authorization({ accessRoles: endpoints.getMyRequests }),
  sessionRequestsController.getMyRequests,
);

// Admin: Approve
router.patch(
  "/:id/approve",
  authentication(),
  authorization({ accessRoles: endpoints.handleRequest }),
  validation(sessionRequestsValidation.handleRequest),
  sessionRequestsController.approveRequest,
);

// Admin: Reject
router.patch(
  "/:id/reject",
  authentication(),
  authorization({ accessRoles: endpoints.handleRequest }),
  validation(sessionRequestsValidation.handleRequest),
  sessionRequestsController.rejectRequest,
);

export default router;
