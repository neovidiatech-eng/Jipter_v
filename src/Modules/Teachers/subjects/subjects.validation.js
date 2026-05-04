import Joi from "joi";
import { generalFeilds } from "../../../Utils/GeneralFields/index.js";

export const createSubjectSchema = {
  body: Joi.object({
    name: generalFeilds.name.required(),
    color: generalFeilds.color.required(),
    rankId: generalFeilds.id
      .messages({
        "string.empty": "RANK_REQUIRED",
        "any.required": "RANK_REQUIRED",
      })
      .required(),
  }),
};

export const updateSubjectSchema = {
  body: Joi.object({
    name: generalFeilds.name,
    active: generalFeilds.active,
    color: generalFeilds.color,
    rankId: generalFeilds.id
      .messages({
        "string.empty": "RANK_REQUIRED",
        "any.required": "RANK_REQUIRED",
      }),
  }),
  params: Joi.object({
    id: generalFeilds.id
      .messages({
        "string.empty": "ID_REQUIRED",
        "any.required": "ID_REQUIRED",
      })
      .required(),
  }),
};

export const deleteSubjectSchema = {
  params: Joi.object({
    id: generalFeilds.id
      .messages({
        "string.empty": "ID_REQUIRED",
        "any.required": "ID_REQUIRED",
      })
      .required(),
  }),
};
