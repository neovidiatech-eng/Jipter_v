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
    courseId: generalFields.id
      .messages({
        "string.base": "courseId must be a string",
        "string.empty": "courseId cannot be empty",
        "any.required": "courseId is required",
      })
      .required(),
  }).required(),
};

export const updateLectureSchema = {
  body: Joi.object({
    title: generalFields.name,
    content: generalFields.description,
    videoUrl: generalFields.url,
    order: generalFields.number,
    courseId: generalFields.id,
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
