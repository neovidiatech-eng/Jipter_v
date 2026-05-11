import { Router } from "express";
import * as requestsController from "./requests.controller.js";
import * as requestsValidation from "./requests.validation.js";
import { validation } from "../../Middlewares/Validation.js";
import authentication from "../../Middlewares/Authentication.js";
import { authorization } from "../../Middlewares/Authorization.js";
import { endpoints } from "./requests.authorization.js";
import { cloudinaryMulterUpload, fileValidation } from "../../Utils/Multer/index.js";

const router = Router();
const actorRoles = ["student", "teacher"];
const adminRoles = ["admin", "super_admin"];

// Create Request
router.post(
  "/",
  authentication,
  authorization({ roles: actorRoles, permissions: endpoints.createRequest }),
  cloudinaryMulterUpload({ validation: [...fileValidation.image, ...fileValidation.document] }).array("attachments", 5),
    validation(requestsValidation.createRequest),
    requestsController.createRequest,
  );
  
  // Admin: Get All
  router.get(
    "/all",
    authentication,
    authorization({ roles: adminRoles, permissions: endpoints.getAllRequests }),
    requestsController.getAllRequests,
  );
  router.get(
    "/my-requests",
    authentication,
    authorization({ roles: actorRoles, permissions: endpoints.getMyRequests }),
    requestsController.getMyRequests,
  );
  
  router.get(
    "/dashboard",
    authentication,
    authorization({ roles: ["student", "teacher", ...adminRoles] }),
    // Accessible to anyone who can see their own or all requests
    requestsController.getRequestsDashboard,
  );
  
  
  // Admin: Approve
  router.patch(
    "/:id/approve",
    authentication,
    authorization({ roles: adminRoles, permissions: endpoints.handleRequest }),
    validation(requestsValidation.handleRequest),
    requestsController.approveRequest,
  );
  
  // Admin: Reject
  router.patch(
    "/:id/reject",
    authentication,
    authorization({ roles: adminRoles, permissions: endpoints.handleRequest }),
    validation(requestsValidation.handleRequest),
    requestsController.rejectRequest,
  );

export default router;
