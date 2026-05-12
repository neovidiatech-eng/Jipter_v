import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { authorize } from "../../Middlewares/Authorize.js";
import * as controller from "./subscription.controller.js";
import plansRouter from "./Plans/plans.routes.js";
import requestsRouter from "./SubscriptionRequests/subscriptionRequests.routes.js";
import { PERMISSIONS_V2 } from "../../Constants/permissions.constants.js";

const router = Router();

router.use("/plans", plansRouter);
router.use("/requests", requestsRouter);

router.get(
  "/my-subscription",
  authentication,
  authorize(PERMISSIONS_V2.SUBSCRIPTIONS.READ),
  controller.getMySubscription,
);

export default router;
