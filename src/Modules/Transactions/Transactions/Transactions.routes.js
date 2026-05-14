import { Router } from "express";
import authentication from "../../../Middlewares/Authentication.js";
import { authorize } from "../../../Middlewares/Authorize.js";
import { validation } from "../../../Middlewares/Validation.js";
import * as TransactionsController from "./Transactions.controller.js";
import * as TransactionsValidation from "./Transactions.validation.js";
import { ROLES } from "../../../Utils/Permissions/permissions.js";
import { authorization } from "../../../Middlewares/Authorization.js";

const router = Router();

router.get("/",
  authentication,
  authorization({ roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] }),
  validation(TransactionsValidation.getTransactionsSchema),
  TransactionsController.getTransactions,
);

router.get("/stats",
  authentication,
  authorization({ roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] }),
  validation(TransactionsValidation.getTransactionsStatsSchema),
  TransactionsController.getTransactionStats,
);


export default router;

