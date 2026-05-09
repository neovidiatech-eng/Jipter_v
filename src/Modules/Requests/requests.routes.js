import { Router } from "express";
import * as requestsController from "./requests.controller.js";
import * as requestsValidation from "./requests.validation.js";
import { validation } from "../../Middlewares/Validation.js";
import authentication from "../../Middlewares/Authentication.js";
import { authorization } from "../../Middlewares/Authorization.js";
import { endpoints } from "./requests.authorization.js";
import { cloudinaryMulterUpload, fileValidation } from "../../Utils/Multer/index.js";

const router = Router();

// Create Request
router.post(
  "/",
  authentication,
  authorization({ accessRoles: endpoints.createRequest }),
  cloudinaryMulterUpload({ validation: [...fileValidation.image, ...fileValidation.document] }).array("attachments", 5),
    validation(requestsValidation.createRequest),
    requestsController.createRequest,
  );
  
  // Admin: Get All
  router.get(
    "/all",
    authentication,
    authorization({ accessRoles: endpoints.getAllRequests }),
    requestsController.getAllRequests,
  );
  router.get(
    "/my-requests",
    authentication,
    authorization({ accessRoles: endpoints.getMyRequests }),
    requestsController.getMyRequests,
  );
  
  router.get(
    "/dashboard",
    authentication,
    // Accessible to anyone who can see their own or all requests
    requestsController.getRequestsDashboard,
  );
  
  
  // Admin: Approve
  router.patch(
    "/:id/approve",
    authentication,
    authorization({ accessRoles: endpoints.handleRequest }),
    validation(requestsValidation.handleRequest),
    requestsController.approveRequest,
  );
  
  // Admin: Reject
  router.patch(
    "/:id/reject",
    authentication,
    authorization({ accessRoles: endpoints.handleRequest }),
    validation(requestsValidation.handleRequest),
    requestsController.rejectRequest,
  );

export default router;
