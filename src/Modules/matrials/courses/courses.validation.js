import Joi from "joi";
import { generalFields } from "../../../Utils/GeneralFields/index.js";

export const createCourseSchema = {
  body: Joi.object({
    title: generalFields.name
      .messages({
        "string.base": "title must be a string",
        "string.empty": "title cannot be empty",
        "any.required": "title is required",
      })
      .required(),
    description: generalFields.description
      .messages({
        "string.base": "description must be a string",
        "string.empty": "description cannot be empty",
        "any.required": "description is required",
      })
      .required(),
    rankId: generalFields.id
      .messages({
        "string.base": "rankId must be a string",
        "string.empty": "rankId cannot be empty",
        "any.required": "rankId is required",
      })
      .required()
  }).required(),
};

export const getCoursesSchema = {
  query: Joi.object({
    rankId: generalFields.id.optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    sort: Joi.string().valid("asc", "desc").optional(),
    sortBy: Joi.string().valid("rankId", "createdAt", "title").optional(),
  }).optional(),
};

export const updateCourseSchema = {
  body: Joi.object({
    title: generalFields.name.messages({
      "string.base": "title must be a string",
      "string.empty": "title cannot be empty",
      "any.required": "title is required",
    }),
    description: generalFields.description.messages({
      "string.base": "description must be a string",
      "string.empty": "description cannot be empty",
      "any.required": "description is required",
    }),

    rankId: generalFields.id.messages({
      "string.base": "rankId must be a string",
      "string.empty": "rankId cannot be empty",
      "any.required": "rankId is required",
    })
  }).required(),
  params: Joi.object({
    id: generalFields.id
      .messages({
        "string.base": "id must be a string",
        "string.empty": "id cannot be empty",
        "any.required": "id is required",
      })
      .required(),
  }).required(),
};

export const courseIdSchema = {
  params: Joi.object({
    id: generalFields.id
      .messages({
        "string.base": "id must be a string",
        "string.empty": "id cannot be empty",
        "any.required": "id is required",
      })
      .required(),
  }).required(),
};

