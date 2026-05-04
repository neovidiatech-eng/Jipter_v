import { Router } from "express";
import { authentication } from "../../../Middlewares/Authentication.js";
import { validation } from "../../../Middlewares/Validation.js";
import { changeStatus, getSubscription } from "./subscriptionRequests.validation.js";
import * as service from "./subscriptionRequests.controller.js";

const router = Router();
router.get(
  "/",
  authentication(),
  validation(getSubscription),
  service.getSubscriptionRequests,
);

router.put(
  "/change-status/:id",
  authentication(),
  validation(changeStatus),
  service.changeStatus,
);

export default router;
