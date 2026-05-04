import { Router } from "express";
import plansRouter from "./Plans/plans.routes.js";
import subscriptionsRequestsRouter from "./SubscriptionRequests/subscriptionRequests.routes.js";
import { authentication } from "../../Middlewares/Authentication.js";
import { authorization } from "../../Middlewares/Authorization.js";
import * as sub from "./subscription.controller.js";

const router = Router();
router.use("/plans", plansRouter);
router.use("/requests", subscriptionsRequestsRouter);
router.get(
  "/",
  authentication(),
  authorization({ accessRoles: ["admin", "super_admin"] }),
  sub.getallSubscriptions,
);

export default router;
