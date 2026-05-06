import Joi from "joi";
import { generalFields } from "../../Utils/GeneralFields/index.js";

export const createRoleSchema = {
  body: Joi.object({
    name: generalFields.role_name.required(),
  }).required(),
};

export const updateRoleSchema = {
  body: Joi.object({
    name: generalFields.role_name.required(),
  }).required(),
  params: Joi.object({
    id: generalFields.id.required(),
  }).required(),
};

export const deleteRoleSchema = {
  params: Joi.object({
    id: generalFields.id.required(),
  }).required(),
};
export const assignRoleSchema = {
  params: Joi.object({
    user_id: generalFields.id
      .messages({
        "string.empty": "USER_ID_REQUIRED",
        "any.required": "USER_ID_REQUIRED",
      })
      .required(),
  }).required(),
  body: Joi.object({
    role_id: generalFields.id
      .messages({
        "string.empty": "ROLE_ID_REQUIRED",
        "any.required": "ROLE_ID_REQUIRED",
      })
      .required(),
  }).required(),
};
