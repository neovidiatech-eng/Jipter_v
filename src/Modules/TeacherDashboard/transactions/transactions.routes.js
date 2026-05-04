import { Router } from "express";
import authentication from "../../../Middlewares/Authentication.js";
import { authorization } from "../../../Middlewares/Authorization.js";
import { endpoints } from "./transactions.authorization.js";
import * as transactionsController from "./transactions.controller.js";

const router = Router();


router.get(
  "/",
  authentication,
  authorization({ accessRoles: endpoints.getTransactions }), 
  transactionsController.getTeacherTransactions,
);
export default router;
