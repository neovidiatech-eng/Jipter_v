import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { validation } from "../../Middlewares/Validation.js";
import { authorization } from "../../Middlewares/Authorization.js";
import * as withdrawalController from "./withdrawals.controller.js";
import * as schema from "./withdrawals.validation.js";

const router = Router();

/**
 * @route   POST /withdrawals/request
 * @desc    Teacher requests a withdrawal
 * @access  Teacher
 */
router.get(
  "/",
  authentication,
  authorization({ accessRoles: ["teacher"] }),
  withdrawalController.getWithdrawals
);
router.get(
  "/all",
  authentication,
  authorization({ accessRoles: ["admin", "super_admin"] }),
  withdrawalController.getAllWithdrawals
);
router.post(
  "/request",
  authentication,
  // Assuming 'Teacher' is the role name in DB
  authorization({ accessRoles: ["teacher"] }),
  validation(schema.requestWithdrawal),
  withdrawalController.requestWithdrawal
);

/**
 * @route   POST /withdrawals/:id/approve
 * @desc    Admin approves a withdrawal
 * @access  Admin
 */
router.patch(
  "/:id/approve",
  authentication,
  // Assuming 'Admin' or 'SuperAdmin'
  authorization({ accessRoles: ["admin", "super_admin"] }),
  validation(schema.processWithdrawal),
  withdrawalController.approveWithdrawal
);

/**
 * @route   POST /withdrawals/:id/reject
 * @desc    Admin rejects a withdrawal
 * @access  Admin
 */
router.patch(
  "/:id/reject",
  authentication,
  authorization({ accessRoles: ["admin", "super_admin"] }),
  validation(schema.processWithdrawal),
  withdrawalController.rejectWithdrawal
);

export default router;
