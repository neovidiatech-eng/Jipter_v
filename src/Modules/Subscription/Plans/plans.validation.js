import Joi from "joi";
import { generalFields } from "../../../Utils/GeneralFields/index.js";

export const createPlanSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().positive().required(),
    duration: Joi.number().integer().min(1).required(),
    sessionsCount: Joi.number().integer().min(0).default(0),
    rescheduleCount: Joi.number().integer().min(0).default(0),
    active: Joi.boolean().default(false),
    features: Joi.array().items(Joi.string()).min(1).required(),
    currencyId: Joi.string().uuid().required(),
  }),
};

export const updatePlanSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().min(10),
    price: Joi.number().positive(),
    duration: Joi.number().integer().min(1),
    sessionsCount: Joi.number().integer().min(0),
    rescheduleCount: Joi.number().integer().min(0),
    active: Joi.boolean(),
    features: Joi.array().items(Joi.string()),
    currencyId: Joi.string().uuid(),
  }),
};
export const deletePlanSchema = {
  params: Joi.object({
    id: generalFields.id.required(),
  }),
};
