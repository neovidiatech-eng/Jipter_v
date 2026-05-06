import joi from "joi";
import { generalFields } from "../../Utils/GeneralFields/index.js";

export const createExam = {
  body: joi
    .object({
      title: generalFields.name.messages({
        "string.empty": "TITLE_REQUIRED",
        "any.required": "TITLE_REQUIRED",
      }),
      dueDate: generalFields.date.messages({
        "string.empty": "DUE_DATE_REQUIRED",
        "any.required": "DUE_DATE_REQUIRED",
      }),
      studentId: generalFields.id
        .messages({
          "string.empty": "STUDENT_ID_REQUIRED",
          "any.required": "STUDENT_ID_REQUIRED",
        })
        .required(),
      subjectId: generalFields.id
        .messages({
          "string.empty": "SUBJECT_ID_REQUIRED",
          "any.required": "SUBJECT_ID_REQUIRED",
        })
        .required(),
      status: joi
        .string()
        .valid("pending", "submitted", "completed")
        .optional(),
      totalMarks: joi
        .number()
        .messages({
          "number.base": "TOTAL_MARKS_NUMBER",
          "number.empty": "TOTAL_MARKS_REQUIRED",
          "any.required": "TOTAL_MARKS_REQUIRED",
        })
        .optional(),
      duration: joi
        .number()
        .messages({
          "number.base": "DURATION_NUMBER",
          "number.empty": "DURATION_REQUIRED",
          "any.required": "DURATION_REQUIRED",
        })
        .optional(),
    })
    .required(),
};

export const updatecreateExam = {
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
      subjectId: generalFields.id.optional(),
      status: joi
        .string()
        .valid("pending", "submitted", "completed")
        .optional(),
    })
    .required(),
};

export const deleteExam = {
  params: joi
    .object({
      id: generalFields.id.required(),
    })
    .required(),
};

export const getExam = {
  params: joi
    .object({
      id: generalFields.id.required(),
    })
    .required(),
};

export const getAllExams = {
  query: joi
    .object({
      studentId: generalFields.id.optional(),
      subjectId: generalFields.id.optional(),
      teacherId: generalFields.id.optional(),
      status: joi.string().optional(),
    })
    .optional(),
};
