import Joi from "joi";
import { generalFields } from "../../Utils/GeneralFields/index.js";

export const createSupport = {
  body: Joi.object({
    title: generalFields.name
      .messages({
        "string.empty": "Enter support title",
        "string.min": "Title must be at least 3 characters long",
        "string.max": "Title must be at most 50 characters long",
      })
      .required(),
    url: generalFields.url
      .messages({
        "string.empty": "Enter support url",
        "string.uri": "Enter a valid url",
      })
      .required(),
    description: generalFields.description
      .messages({
        "string.empty": "Enter support description",
        "string.min": "Description must be at least 10 characters long",
        "string.max": "Description must be at most 1000 characters long",
      })
      .required(),
    categoryId: generalFields.id
      .messages({
        "string.empty": "Enter support category",
        "string.min": "Category ID must be at least 24 characters long",
        "string.max": "Category ID must be at most 24 characters long",
      })
      .required(),
    active: Joi.boolean(),
  }).required(),
};

export const updateSupport = {
  body: Joi.object({
    title: generalFields.name.messages({
      "string.empty": "Enter support title",
      "string.min": "Title must be at least 3 characters long",
      "string.max": "Title must be at most 50 characters long",
    }),
    url: generalFields.url.messages({
      "string.empty": "Enter support url",
      "string.uri": "Enter a valid url",
    }),
    description: generalFields.description.messages({
      "string.empty": "Enter support description",
      "string.min": "Description must be at least 10 characters long",
      "string.max": "Description must be at most 1000 characters long",
    }),
    categoryId: generalFields.id.messages({
      "string.empty": "Enter support category",
    }),
    active: Joi.boolean(),
  }).required(),
  params: Joi.object({
    id: generalFields.id.required(),
  }).required(),
};

export const supportIdSchema = {
  params: Joi.object({
    id: generalFields.id.required(),
  }).required(),
};

export const createCategory = {
  body: Joi.object({
    title: generalFields.name.required(),
    active: Joi.boolean(),
  }).required(),
};

export const updateCategory = {
  body: Joi.object({
    title: generalFields.name,
    active: Joi.boolean(),
  }).required(),
  params: Joi.object({
    id: generalFields.id.required(),
  }).required(),
};

export const categoryIdSchema = {
  params: Joi.object({
    id: generalFields.id.required(),
  }).required(),
};
