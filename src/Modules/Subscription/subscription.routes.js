import { Router } from "express";
import plansRouter from "./Plans/plans.routes.js";
import subscriptionsRequestsRouter from "./SubscriptionRequests/subscriptionRequests.routes.js";
import authentication from "../../Middlewares/Authentication.js";
import { authorization } from "../../Middlewares/Authorization.js";
import * as sub from "./subscription.controller.js";

import { PERMISSIONS } from "../../Utils/Permissions/permissions.js";

const router = Router();
router.use("/plans", plansRouter);
router.use("/requests", subscriptionsRequestsRouter);
router.get(
  "/",
  authentication,
  authorization({ permissions: [PERMISSIONS.SUBSCRIPTION_MANAGE] }),
  sub.getallSubscriptions,
);

export default router;
