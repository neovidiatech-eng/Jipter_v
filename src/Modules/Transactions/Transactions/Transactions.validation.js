import Joi from "joi";
import { generalFields } from "../../../Utils/GeneralFields/index.js";
import { transactionType, transactionStatus } from "../../../Utils/Enums/transactions.js";

export const getTransactionsSchema = {
  query: Joi.object()
    .keys({
      currency: generalFields.code.optional(),
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).optional(),
      type: Joi.string().valid(...Object.values(transactionType)).optional(),
      status: Joi.string().valid(...Object.values(transactionStatus)).optional(),
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


