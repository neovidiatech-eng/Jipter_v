import Joi from "joi";
import { generalFields } from "../../../Utils/GeneralFields/index.js";

export const createLectureSchema = {
  body: Joi.object({
    title: generalFields.name
      .messages({
        "string.base": "title must be a string",
        "string.empty": "title cannot be empty",
        "any.required": "title is required",
      })
      .required(),
    content: generalFields.description
      .messages({
        "string.base": "content must be a string",
        "string.empty": "content cannot be empty",
        "any.required": "content is required",
      })
      .required(),
    videoUrl: generalFields.url
      .messages({
        "string.base": "videoUrl must be a string",
        "string.empty": "videoUrl cannot be empty",
        "any.required": "videoUrl is required",
      })
      .required(),
    slidesUrl: generalFields.url
      .messages({
        "string.base": "slidesUrl must be a string",
        "string.empty": "slidesUrl cannot be empty",
        "any.required": "slidesUrl is required",
      })
      .required(),
    pdfUrl: generalFields.url
      .messages({
        "string.base": "pdfUrl must be a string",
        "string.empty": "pdfUrl cannot be empty",
        "any.required": "pdfUrl is required",
      })
      .required(),
    order: generalFields.number
      .messages({
        "number.base": "order must be a number",
        "number.empty": "order cannot be empty",
        "any.required": "order is required",
      })
      .required(),
    courseId: generalFields.id.required(),
    duration: Joi.string().optional(),
    date: Joi.date().optional(),
  }).required(),
};

export const updateLectureSchema = {
  body: Joi.object({
    title: generalFields.name,
    content: generalFields.description,
    videoUrl: generalFields.url,
    order: generalFields.number,
    courseId: generalFields.id,
    duration: Joi.string().optional(),
    date: Joi.date().optional(),
    pdfUrl: generalFields.url.optional(),
    slidesUrl: generalFields.url.optional(),
  }).required(),
  params: Joi.object({
    id: generalFields.id.required(),
  }).required(),
};

export const lectureIdSchema = {
  params: Joi.object({
    id: generalFields.id.required(),
  }).required(),
};
