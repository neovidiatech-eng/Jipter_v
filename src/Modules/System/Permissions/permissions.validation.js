import Joi from "joi";
import { generalFields } from "../../../Utils/GeneralFields/index.js";

export const createPermissionSchema = {
  body: Joi.object({
    name: generalFields.permission_name.required(),
    code: generalFields.permission_code,
  }).required(),
};

export const updatePermissionSchema = {
  body: Joi.object({
    name: generalFields.permission_name,
    code: generalFields.permission_code,
  }).required(),
  params: Joi.object({
    id: generalFields.id.required(),
  }).required(),
};

export const deletePermissionSchema = {
  params: Joi.object({
    id: generalFields.id.required(),
  }).required(),
};
