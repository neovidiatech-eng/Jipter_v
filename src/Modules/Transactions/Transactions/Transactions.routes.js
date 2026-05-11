import { Router } from "express";
import authentication from "../../../Middlewares/Authentication.js";
import { authorization } from "../../../Middlewares/Authorization.js";
import * as TransactionsController from "./Transactions.controller.js";
import { endpoints } from "./Transactions.authorization.js";

const router = Router();
router.get("/",
  authentication,
  authorization({ permissions: endpoints.getTransactions }),
  TransactionsController.getTransactions,
)

export default router;
