import joi from "joi";
import { generalFields } from "../../Utils/GeneralFields/index.js";

export const createHomework = {
  body: joi
    .object({
      title: joi.string().required(),
      description: joi.string().required(),
      dueDate: joi.date().required(),
      studentId: generalFields.id.required(),
      status: joi
        .string()
        .valid("pending", "submitted", "completed")
        .optional(),
    })
    .required(),
};

export const updateHomework = {
  params: joi
    .object({
      id: generalFields.id.required(),
    })
    .required(),
  body: joi
    .object({
      title: joi.string().optional(),
      description: joi.string().optional(),
      dueDate: joi.date().optional(),
      studentId: generalFields.id.optional(),
      status: joi
        .string()
        .valid("pending", "submitted", "completed")
        .optional(),
    })
    .required(),
};

export const deleteHomework = {
  params: joi
    .object({
      id: generalFields.id.required(),
    })
    .required(),
};

export const getHomework = {
  params: joi
    .object({
      id: generalFields.id.required(),
    })
    .required(),
};

export const getAllHomework = {
  query: joi
    .object({
      studentId: generalFields.id.optional(),
      teacherId: generalFields.id.optional(),
      status: joi.string().optional(),
    })
    .optional(),
};
