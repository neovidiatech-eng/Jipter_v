import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { authorizeResource } from "../../Middlewares/AuthorizeResource.js";
import { authorize } from "../../Middlewares/Authorize.js";
import { validation } from "../../Middlewares/Validation.js";
import * as withdrawalController from "./withdrawals.controller.js";
import * as schema from "./withdrawals.validation.js";
import { PERMISSIONS_V2 } from "../../Constants/permissions.constants.js";

const router = Router();
const withdrawalResource = "withdrawals";

router.get(
  "/",
  authentication,
  authorize(PERMISSIONS_V2.WITHDRAWALS.READ),
  withdrawalController.getWithdrawals,
);

router.get(
  "/all",
  authentication,
  authorize(PERMISSIONS_V2.WITHDRAWALS.READ),
  withdrawalController.getAllWithdrawals,
);

router.post(
  "/request",
  authentication,
  authorize(PERMISSIONS_V2.WITHDRAWALS.CREATE),
  validation(schema.requestWithdrawal),
  withdrawalController.requestWithdrawal,
);

router.patch(
  "/:id/approve",
  authentication,
  authorize(PERMISSIONS_V2.WITHDRAWALS.APPROVE),
  validation(schema.processWithdrawal),
  withdrawalController.approveWithdrawal,
);

router.patch(
  "/:id/reject",
  authentication,
  authorize(PERMISSIONS_V2.WITHDRAWALS.APPROVE), // Reject usually handled by same permission as approve
  validation(schema.processWithdrawal),
  withdrawalController.rejectWithdrawal,
);

export default router;
