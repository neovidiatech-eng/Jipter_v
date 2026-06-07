import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import * as financesController from "./finances.controller.js";
import * as schema from "./finances.validation.js";
import { validation } from "../../Middlewares/Validation.js";

const router = Router();

router.get(
  "/expenses",
  authentication,
  validation(schema.getExpensesValidation),
  financesController.getExpenses,
);

router.get(
  "/expenses/:id",
  authentication,
  validation(schema.getExpenseByIdValidation),
  financesController.getExpenseById,
);

router.post(
  "/expenses",
  authentication,
  validation(schema.createExpenseValidation),
  financesController.createExpense,
);

router.patch(
  "/expenses/:id",
  authentication,
  validation(schema.updateExpenseValidation),
  financesController.updateExpense,
);

router.delete(
  "/expenses/:id",
  authentication,
  validation(schema.deleteExpenseValidation),
  financesController.deleteExpense,
);

export default router;
