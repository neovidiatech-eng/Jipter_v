import Joi from "joi";
import { generalFeilds } from "../../../Utils/GeneralFields/index.js";

export const createPermissionSchema = {
  body: Joi.object({
    name: generalFeilds.permission_name.required(),
    code: generalFeilds.permission_code,
  }).required(),
};

export const updatePermissionSchema = {
  body: Joi.object({
    name: generalFeilds.permission_name,
    code: generalFeilds.permission_code,
  }).required(),
  params: Joi.object({
    id: generalFeilds.id.required(),
  }).required(),
};

export const deletePermissionSchema = {
  params: Joi.object({
    id: generalFeilds.id.required(),
  }).required(),
};
