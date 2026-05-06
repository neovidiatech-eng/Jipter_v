import Joi from "joi";
import { generalFields } from "../../Utils/GeneralFields/index.js";

export const requestWithdrawal = {
  body: Joi.object()
    .keys({
      amount: Joi.number().positive().required(),
    })
    .required(),
};

export const processWithdrawal = {
  params: Joi.object()
    .keys({
      id: generalFields.id.required(),
    })
    .required(),
  body: Joi.object()
    .keys({
      adminNotes: Joi.string().max(500).optional(),
    })
    .required(),
};
