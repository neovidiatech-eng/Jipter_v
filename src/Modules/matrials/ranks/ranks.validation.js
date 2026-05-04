import joi from "joi";
import { generalFeilds } from "../../../Utils/GeneralFields/index.js";

export const createRank = {
  body: joi.object({
    name: generalFeilds.name
      .messages({
        "any.required": "Rank name is required",
        "string.empty": "Rank name cannot be empty",
        "string.base": "Rank name must be a string",
      })
      .required(),
    color: generalFeilds.color
      .messages({
        "any.required": "color is required",
        "string.empty": "color cannot be empty",
        "string.base": "color must be a string",
      })
      .required(),
    ageRange: generalFeilds.ageRange
      .messages({
        "any.required": "ageRange is required",
        "string.empty": "ageRange cannot be empty",
        "string.base": "ageRange must be a string",
      })
      .required(),
  }),
};

export const updateRank = {
  body: joi.object({
    name: generalFeilds.name
      .messages({
        "string.empty": "Rank name cannot be empty",
        "string.base": "Rank name must be a string",
      })
      .optional(),
    color: generalFeilds.color
      .messages({
        "string.empty": "color cannot be empty",
        "string.base": "color must be a string",
      })
      .optional(),
    ageRange: generalFeilds.ageRange.optional(),
  }),
  params: joi.object({
    id: generalFeilds.id.required(),
  }),
};

export const deleteRank = {
  params: joi.object({
    id: generalFeilds.id.required(),
  }),
};

export const getRank = {
  params: joi.object({
    id: generalFeilds.id.required(),
  }),
};
