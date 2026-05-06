import Joi from "joi";
import { generalFields } from "../../../Utils/GeneralFields/index.js";

export const createSubjectSchema = {
  body: Joi.object({
    name: generalFields.name.required(),
    color: generalFields.color.required(),
    rankId: generalFields.id
      .messages({
        "string.empty": "RANK_REQUIRED",
        "any.required": "RANK_REQUIRED",
      })
      .required(),
  }),
};

export const updateSubjectSchema = {
  body: Joi.object({
    name: generalFields.name,
    active: generalFields.active,
    color: generalFields.color,
    rankId: generalFields.id.messages({
      "string.empty": "RANK_REQUIRED",
      "any.required": "RANK_REQUIRED",
    }),
  }),
  params: Joi.object({
    id: generalFields.id
      .messages({
        "string.empty": "ID_REQUIRED",
        "any.required": "ID_REQUIRED",
      })
      .required(),
  }),
};

export const deleteSubjectSchema = {
  params: Joi.object({
    id: generalFields.id
      .messages({
        "string.empty": "ID_REQUIRED",
        "any.required": "ID_REQUIRED",
      })
      .required(),
  }),
};
