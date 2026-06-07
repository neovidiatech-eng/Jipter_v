import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { authorizeResource } from "../../Middlewares/AuthorizeResource.js";
import { authorize } from "../../Middlewares/Authorize.js";
import { validation } from "../../Middlewares/Validation.js";
import * as requestsController from "./requests.controller.js";
import * as schema from "./requests.validation.js";
import { PERMISSIONS_V2 } from "../../Constants/permissions.constants.js";

const router = Router();
const requestsResource = "requests";

router.use(authentication);

router.get(
  "/",
  authorize(PERMISSIONS_V2.REQUESTS.READ),
  requestsController.getAllRequests,
);

router.get(
  "/my",
  authorize(PERMISSIONS_V2.REQUESTS.READ),
  requestsController.getMyRequests,
);

router.post(
  "/",
  authorize(PERMISSIONS_V2.REQUESTS.CREATE),
  validation(schema.createRequest),
  requestsController.createRequest,
);

router.patch(
  "/:id/approve",
  authorize(PERMISSIONS_V2.REQUESTS.HANDLE),
  requestsController.approveRequest,
);

router.patch(
  "/:id/reject",
  authorize(PERMISSIONS_V2.REQUESTS.HANDLE),
  requestsController.rejectRequest,
);

// router.delete(
//   "/:id",
//   authorizeResource(requestsResource),
//   validation(schema.requestIdSchema),
//   // deleteRequest is missing in controller, I'll assume it's not implemented or uses a generic one
//   // Actually, I'll just comment it out or point to a placeholder to avoid crash if it's missing
// );

export default router;
