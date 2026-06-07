import joi from "joi";
import { generalFields } from "../../../Utils/GeneralFields/index.js";

export const createRank = {
  body: joi.object({
    name: generalFields.name
      .messages({
        "any.required": "Rank name is required",
        "string.empty": "Rank name cannot be empty",
        "string.base": "Rank name must be a string",
      })
      .required(),
    color: generalFields.color
      .messages({
        "any.required": "color is required",
        "string.empty": "color cannot be empty",
        "string.base": "color must be a string",
      })
      .required(),
    ageRange: generalFields.ageRange
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
    name: generalFields.name
      .messages({
        "string.empty": "Rank name cannot be empty",
        "string.base": "Rank name must be a string",
      })
      .optional(),
    color: generalFields.color
      .messages({
        "string.empty": "color cannot be empty",
        "string.base": "color must be a string",
      })
      .optional(),
    ageRange: generalFields.ageRange.optional(),
  }),
  params: joi.object({
    id: generalFields.id.required(),
  }),
};

export const deleteRank = {
  params: joi.object({
    id: generalFields.id.required(),
  }),
};

export const getRank = {
  params: joi.object({
    id: generalFields.id.required(),
  }),
};
