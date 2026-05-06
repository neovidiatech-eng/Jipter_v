import joi from "joi";
import { generalFields } from "../../Utils/GeneralFields/index.js";

export const getCalendar = {
  query: joi
    .object({
      startDate: joi.string().required(),
      endDate: joi.string().required(),
    })
    .required(),
  params: joi
    .object()
    .keys({
      student_id: generalFields,
    })
    .required(),
};
export const getStudentCalendar = {
  query: joi
    .object({
      startDate: joi.string().required(),
      endDate: joi.string().required(),
    })
    .required(),
  params: joi
    .object({
      student_id: generalFields.id.messages({
        "any.required": "STUDENT_ID_REQUIRED",
        "string.empty": "STUDENT_ID_REQUIRED",
        "string.guid": "STUDENT_ID_INVALID",
      }),
    })
    .required(),
};
export const getTeacherCalendar = {
  query: joi
    .object({
      startDate: joi.string().required(),
      endDate: joi.string().required(),
    })
    .required(),
  params: joi
    .object({
      student_id: generalFields.id.messages({
        "any.required": "STUDENT_ID_REQUIRED",
        "string.empty": "STUDENT_ID_REQUIRED",
        "string.guid": "STUDENT_ID_INVALID",
      }),
    })
    .required(),
};
export const getTeachersCalendar = {
  query: joi.object({
    startDate: joi.string().required(),
    endDate: joi.string().required(),
  }),
};
