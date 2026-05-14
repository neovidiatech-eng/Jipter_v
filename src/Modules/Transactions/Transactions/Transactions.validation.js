import Joi from "joi";
import { generalFields } from "../../../Utils/GeneralFields/index.js";

export const getTransactionsSchema = {
  query: Joi.object()
    .keys({
      currency: generalFields.code.optional(),
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      type: Joi.string().valid("subscription", "expense", "withdrawal", "credit", "debit").optional(),
      status: Joi.string().valid("completed", "pending", "failed", "cancelled").optional(),
      search: generalFields.search.optional(),
    })
    .required(),
};

export const getTransactionsStatsSchema = {
  query: Joi.object()
    .keys({
      currency: generalFields.code.optional(),
    })
    .required(),
};


