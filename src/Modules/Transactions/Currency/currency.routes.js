import { Router } from "express";
import { authentication } from "../../../Middlewares/Authentication.js";
import * as currencyController from "./currency.controller.js";
import { validation } from "../../../Middlewares/Validation.js";
import {
  getCurrenciesSchema,
  addCurrencySchema,
  updateCurrencySchema,
  deleteCurrencySchema,
  getCurrencyById,
} from "./currency.validation.js";

const router = Router();

router.get(
  "/currencies",
  authentication(),
  validation(getCurrenciesSchema),
  currencyController.getCurrencies,
);
router.get(
  "/:id",
  authentication(),
  validation(getCurrencyById),
  currencyController.getCurrencyById,
);
router.post(
  "/add-currency",
  authentication(),
  validation(addCurrencySchema),
  currencyController.addCurrency,
);
router.patch(
  "/update-currency/:id",
  authentication(),
  validation(updateCurrencySchema),
  currencyController.updateCurrency,
);

router.delete(
  "/delete-currency/:id",
  authentication(),
  validation(deleteCurrencySchema),
  currencyController.deleteCurrency,
);
export default router;
